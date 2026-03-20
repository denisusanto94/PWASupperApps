import { reactive } from 'vue';

export const toastState = reactive({
  show: false,
  message: '',
  type: 'info', // 'info', 'success', 'warning', 'error'
  timer: null
});

export function showToast(msg, type = 'success') {
  if (toastState.timer) clearTimeout(toastState.timer);
  
  toastState.message = msg;
  toastState.type = type;
  toastState.show = true;
  
  toastState.timer = setTimeout(() => {
    toastState.show = false;
  }, 3000);
}
