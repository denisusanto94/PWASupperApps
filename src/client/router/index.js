import { createRouter, createWebHistory } from 'vue-router';
import { authState } from '../db.js';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { title: 'Sign In' },
  },
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/HomeView.vue'),
    meta: { title: 'Home', requiresAuth: false },
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('../views/AdminView.vue'),
    meta: { title: 'Admin Panel', requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/wab-blaster',
    name: 'Dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { title: 'WhatsApp Blaster', requiresAuth: true },
  },
  {
    path: '/getlynkid',
    name: 'Getlynkid',
    component: () => import('../views/GetlynkidView.vue'),
    meta: { title: 'getlynk.id', requiresAuth: true },
  },
  {
    path: '/instant-chat',
    name: 'InstantMessaging',
    component: () => import('../views/InstantMessagingView.vue'),
    meta: { title: 'Instant Messaging', requiresAuth: true },
  },
  {
    path: '/wedding-invitation',
    name: 'WeddingInvitation',
    component: () => import('../views/WeddingInvitationView.vue'),
    meta: { title: 'Wedding Invitation', requiresAuth: true },
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
    meta: { title: 'Timestamp Camera' }, // Accessible by Guest
  },
  {
    path: '/maps-shareit',
    name: 'MapsShareIt',
    component: () => import('../views/MapsShareItView.vue'),
    meta: { title: 'Maps ShareIt', requiresAuth: false },
  },
  {
    path: '/vconference',
    name: 'Vconference',
    component: () => import('../views/VconferenceView.vue'),
    meta: { title: 'Meeting Online', requiresAuth: true },
  },
  {
    path: '/vconference/room/:code',
    name: 'VconferenceRoom',
    component: () => import('../views/VconferenceView.vue'),
    meta: { title: 'Room Meeting', requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const isAuthenticated = !!authState.sessionId;

  // 1. Allow access to login page if not authenticated
  if (to.path === '/login') {
    if (isAuthenticated) return next('/');
    return next();
  }

  // 2. Admin Access Policy
  if (to.meta.requiresAdmin && authState.user?.role !== 'admin') {
    return next('/');
  }

  // 3. Authenticated Routes guard
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next('/login');
  }

  // 4. Public Access (Home, Camera, Maps ShareIt, Previews)
  if (to.path === '/' || to.path === '/timestamp-camera' || to.path === '/maps-shareit' || to.path.startsWith('/wedding-invitation/preview')) {
    return next();
  }

  next();
});

export default router;

