import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home' },
  },
  {
    path: '/wab-blaster',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'WhatsApp Blaster' },
  },
  {
    path: '/getlynkid',
    name: 'Getlynkid',
    component: () => import('../views/GetlynkidView.vue'),
    meta: { title: 'getlynk.id' },
  },
  {
    path: '/instant-chat',
    name: 'InstantMessaging',
    component: () => import('../views/InstantMessagingView.vue'),
    meta: { title: 'Instant Messaging' },
  },
  {
    path: '/wedding-invitation',
    name: 'WeddingInvitation',
    component: () => import('../views/WeddingInvitationView.vue'),
    meta: { title: 'Wedding Invitation' },
  },
  {
    path: '/wedding-invitation/preview',
    name: 'WeddingInvitationPreview',
    component: () => import('../views/WeddingInvitationPreviewView.vue'),
    meta: { title: 'Preview Undangan' },
  },
  {
    path: '/wedding-invitation/preview-classic',
    name: 'WeddingInvitationPreviewClassic',
    component: () => import('../views/WeddingInvitationPreviewClassicView.vue'),
    meta: { title: 'Preview Undangan Classic' },
  },
  {
    path: '/wedding-invitation/preview-montain',
    name: 'WeddingInvitationPreviewMontain',
    component: () => import('../views/WeddingInvitationPreviewMontainView.vue'),
    meta: { title: 'Preview Undangan Montain' },
  },
  {
    path: '/timestamp-camera',
    name: 'TimestampCamera',
    component: () => import('../views/TimestampCameraView.vue'),
    meta: { title: 'Timestamp Camera' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
