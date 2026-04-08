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
  {
    path: '/mini-games',
    name: 'MiniGames',
    component: () => import('../views/MiniGamesView.vue'),
    meta: { title: 'Mini Games', requiresAuth: false },
  },
  {
    path: '/mini-games/solitaire',
    name: 'Solitaire',
    component: () => import('../views/SolitaireView.vue'),
    meta: { 
      title: 'Solitaire', 
      requiresAuth: false, 
      isCustomHeader: true,
      headerClass: 'mb-0 !bg-transparent !border-0 !shadow-none !backdrop-blur-0'
    },
  },
  {
    path: '/mini-games/memory-match',
    name: 'MemoryMatch',
    component: () => import('../views/MemoryMatchView.vue'),
    meta: { 
      title: 'Memory Match', 
      requiresAuth: false, 
      isCustomHeader: true,
      headerClass: 'mb-0 !bg-transparent !border-0 !shadow-none !backdrop-blur-0'
    },
  },
  {
    path: '/mini-games/snake-and-ladders',
    name: 'SnakeAndLaddersCategory',
    component: () => import('../views/SnakeAndLaddersCategoryView.vue'),
    meta: { 
      title: 'Choose Realm', 
      requiresAuth: false, 
      isCustomHeader: true,
      headerClass: 'mb-0 !bg-transparent !border-0 !shadow-none !backdrop-blur-0'
    },
  },
  {
    path: '/mini-games/snake-and-ladders/island-quest',
    name: 'SnakeAndLadders',
    component: () => import('../views/SnakeAndLaddersView.vue'),
    meta: { 
      title: 'Island Quest', 
      requiresAuth: false, 
      isCustomHeader: true,
      headerClass: 'mb-0 !bg-transparent !border-0 !shadow-none !backdrop-blur-0'
    },
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

  // 4. Public Access (Home, Camera, Maps ShareIt, Previews, Mini Games)
  if (to.path === '/' || to.path === '/timestamp-camera' || to.path === '/maps-shareit' || to.path.startsWith('/wedding-invitation/preview') || to.path.startsWith('/mini-games')) {
    return next();
  }

  next();
});

export default router;

