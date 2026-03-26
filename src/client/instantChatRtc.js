import { reactive, ref, watch } from 'vue';
import { authState, apiFetch, saveModuleData } from './db.js';
import { showToast } from './toast.js';

/** Shared WebRTC + incoming-call state (dipakai App.vue header & InstantMessagingView). */
export const rtcState = reactive({
  incomingCall: null,
  activeCall: null,
  callStatus: '',
  isCallConnected: false,
});

/** true = strip panggilan masuk di header diperkecil (mode chip). */
export const incomingCallBarMinimized = ref(false);

const rtcConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const SOUND_VOICE_RING = '/sound/voice-call-ringing.mp3';
const SOUND_VIDEO_RING = '/sound/video-call-ringing.mp3';
const SOUND_END_DECLINE = '/sound/end-decline-call.mp3';

let peerConnection = null;
let localStream = null;
let pendingRemoteStream = null;
let ringingAudio = null;
let videoEls = { local: null, remote: null };
let rtcProcessLock = false;

function getMyEmail() {
  return authState.user?.email || null;
}

function stopIncomingRingtone() {
  if (ringingAudio) {
    ringingAudio.pause();
    ringingAudio.currentTime = 0;
    ringingAudio.loop = false;
    ringingAudio = null;
  }
}

async function startIncomingRingtone(callType) {
  stopIncomingRingtone();
  const src = callType === 'video' ? SOUND_VIDEO_RING : SOUND_VOICE_RING;
  ringingAudio = new Audio(src);
  ringingAudio.loop = true;
  try {
    await ringingAudio.play();
  } catch {
    /* autoplay */
  }
}

function playEndDeclineSound() {
  stopIncomingRingtone();
  const a = new Audio(SOUND_END_DECLINE);
  a.play().catch(() => {});
}

function applyStreamsToElements() {
  if (videoEls.local && localStream) videoEls.local.srcObject = localStream;
  if (videoEls.remote && pendingRemoteStream) videoEls.remote.srcObject = pendingRemoteStream;
}

export function registerRtcVideoElements(localEl, remoteEl) {
  videoEls.local = localEl;
  videoEls.remote = remoteEl;
  applyStreamsToElements();
}

async function sendSignal(to, data) {
  const from = getMyEmail();
  if (!from) return;
  await saveModuleData('instant_chat', {
    type: 'rtc_signal',
    from,
    to,
    data,
    timestamp: Date.now(),
  });
}

watch(
  () => rtcState.incomingCall,
  (val) => {
    if (val) {
      incomingCallBarMinimized.value = false;
      startIncomingRingtone(val.callType === 'video' ? 'video' : 'audio');
    } else {
      stopIncomingRingtone();
    }
  }
);

export async function processRtcSignalsFromResults(results) {
  const my = getMyEmail();
  if (!my || !Array.isArray(results) || rtcProcessLock) return;
  rtcProcessLock = true;
  try {
    const signals = results
      .filter((r) => r && r.data && r.data.type === 'rtc_signal' && r.data.to === my)
      .sort((a, b) => (a.data.timestamp || 0) - (b.data.timestamp || 0));
    for (const s of signals) await handleRtcSignal(s);
  } finally {
    rtcProcessLock = false;
  }
}

async function handleRtcSignal(doc) {
  const my = getMyEmail();
  if (!my || doc.data.to !== my) return;
  const { from, data } = doc.data;

  const isStale = Date.now() - (data.timestamp || doc.updated_at || 0) > 60000;
  try {
    await apiFetch(`/api/modules/instant_chat/${doc.id}`, { method: 'DELETE' });
  } catch {
    /* ignore */
  }
  if (isStale) return;

  if (data.type === 'offer') {
    if (rtcState.activeCall || rtcState.incomingCall) return;
    rtcState.incomingCall = { from, callType: data.callType, offer: data.offer };
  } else if (data.type === 'answer') {
    if (peerConnection) await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    rtcState.callStatus = 'Connected';
    rtcState.isCallConnected = true;
  } else if (data.type === 'candidate') {
    if (peerConnection) await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  } else if (data.type === 'hangup') {
    if (rtcState.activeCall?.other === from) await endActiveCall(false);
    if (rtcState.incomingCall?.from === from) {
      playEndDeclineSound();
      rtcState.incomingCall = null;
    }
  }
}

export async function endActiveCall(sendHangup = true, { playEndSound = true } = {}) {
  const hadActiveCall = !!rtcState.activeCall;
  stopIncomingRingtone();
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  pendingRemoteStream = null;
  if (videoEls.local) videoEls.local.srcObject = null;
  if (videoEls.remote) videoEls.remote.srcObject = null;

  const other = rtcState.activeCall?.other;
  rtcState.activeCall = null;
  rtcState.callStatus = '';
  rtcState.isCallConnected = false;

  if (hadActiveCall && playEndSound) playEndDeclineSound();

  try {
    if (sendHangup && other) await sendSignal(other, { type: 'hangup' });
  } catch (e) {
    console.error('Error sending hangup:', e);
  }
}

export async function acceptIncomingCall() {
  if (!rtcState.incomingCall) return;
  const { from, offer, callType } = rtcState.incomingCall;
  rtcState.activeCall = { other: from, callType, isInitiator: false };
  rtcState.callStatus = 'Connecting...';
  rtcState.incomingCall = null;

  try {
    await saveModuleData('instant_chat', {
      type: 'chat_msg',
      from: getMyEmail(),
      to: from,
      text: 'Panggilan Masuk Diangkat',
      isCallLog: true,
      timestamp: Date.now(),
    });
  } catch {
    /* ignore */
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: callType === 'video',
      audio: true,
    });
    applyStreamsToElements();
    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (event) => {
      pendingRemoteStream = event.streams[0];
      if (videoEls.remote) videoEls.remote.srcObject = pendingRemoteStream;
    };
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) sendSignal(from, { type: 'candidate', candidate: event.candidate });
    };
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    sendSignal(from, { type: 'answer', answer });
    rtcState.callStatus = 'Connected';
    rtcState.isCallConnected = true;
  } catch (err) {
    showToast('Gagal mengangkat panggilan.', 'error');
    await endActiveCall(true);
  }
}

export async function declineIncomingCall() {
  if (!rtcState.incomingCall) return;
  playEndDeclineSound();
  const { from } = rtcState.incomingCall;
  try {
    await saveModuleData('instant_chat', {
      type: 'chat_msg',
      from: getMyEmail(),
      to: from,
      text: 'Panggilan Tak Terjawab',
      isCallLog: true,
      timestamp: Date.now(),
    });
    await sendSignal(from, { type: 'hangup' });
  } catch (e) {
    console.error('Error declining call:', e);
  } finally {
    rtcState.incomingCall = null;
  }
}

export async function initiateOutgoingCall(other, type) {
  const me = getMyEmail();
  if (!other || !me) return;

  rtcState.activeCall = { other, callType: type, isInitiator: true };
  rtcState.callStatus = 'Ringing...';

  try {
    await saveModuleData('instant_chat', {
      type: 'chat_msg',
      from: me,
      to: other,
      text: `Panggilan ${type === 'video' ? 'Video' : 'Suara'} Keluar`,
      isCallLog: true,
      timestamp: Date.now(),
    });
  } catch {
    /* ignore */
  }

  try {
    localStream = await navigator.mediaDevices.getUserMedia({
      video: type === 'video',
      audio: true,
    });
    applyStreamsToElements();
    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (event) => {
      pendingRemoteStream = event.streams[0];
      if (videoEls.remote) videoEls.remote.srcObject = pendingRemoteStream;
    };
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) sendSignal(other, { type: 'candidate', candidate: event.candidate });
    };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendSignal(other, { type: 'offer', offer, callType: type });
  } catch (err) {
    showToast('Media access denied.', 'error');
    await endActiveCall(true);
  }
}

export function resetRtcOnLogout() {
  stopIncomingRingtone();
  if (localStream) {
    localStream.getTracks().forEach((t) => t.stop());
    localStream = null;
  }
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  pendingRemoteStream = null;
  if (videoEls.local) videoEls.local.srcObject = null;
  if (videoEls.remote) videoEls.remote.srcObject = null;
  rtcState.incomingCall = null;
  rtcState.activeCall = null;
  rtcState.callStatus = '';
  rtcState.isCallConnected = false;
  incomingCallBarMinimized.value = false;
}
