<template>
  <div class="login-page">
    <div class="glow-bg"></div>
    
    <div class="login-card">
      <div class="card-glass"></div>
      <div class="card-content">
        <router-link to="/" class="login-back-btn" title="Back to Home">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>Beranda</span>
        </router-link>
        <div class="brand">
          <div class="brand-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <h1 class="brand-name">PWA<span>Supper</span></h1>
          <p class="brand-tagline">All-in-one productivity suite</p>
        </div>

        <!-- TABS -->
        <div class="tabs">
          <button 
            @click="activeTab = 'login'" 
            class="tab-btn" 
            :class="{ active: activeTab === 'login' }"
          >
            Sign In
          </button>
          <button 
            @click="activeTab = 'register'" 
            class="tab-btn" 
            :class="{ active: activeTab === 'register' }"
          >
            Sign Up
          </button>
        </div>

        <div class="form-container">
          <Transition name="fade-slide" mode="out-in">
            <!-- LOGIN FORM -->
            <form v-if="activeTab === 'login'" key="login" @submit.prevent="handleLogin">
              <div class="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  v-model="email" 
                  placeholder="admin@gmail.com"
                  required
                />
              </div>
              <div class="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  v-model="password" 
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="!loading">Sign In</span>
                <span v-else class="loader"></span>
              </button>
            </form>

            <!-- REGISTER FORM -->
            <form v-else key="register" @submit.prevent="handleRegister">
              <div class="input-group">
                <label>Nama Lengkap</label>
                <input 
                  type="text" 
                  v-model="regFullName" 
                  placeholder="John Doe"
                  required
                />
              </div>
              <div class="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  v-model="regEmail" 
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div class="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  v-model="regPassword" 
                  placeholder="••••••••"
                  required
                />
              </div>
              
              <button type="submit" class="submit-btn" :disabled="loading">
                <span v-if="!loading">Create Account</span>
                <span v-else class="loader"></span>
              </button>
            </form>
          </Transition>
        </div>

        <p v-if="error" class="error-msg">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { setAuth, apiFetch } from '../db.js';
import { showToast } from '../toast.js';

const router = useRouter();
const activeTab = ref('login');
const loading = ref(false);
const error = ref('');

// Login Fields
const email = ref('');
const password = ref('');

// Register Fields
const regEmail = ref('');
const regPassword = ref('');
const regFullName = ref('');

const handleLogin = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    
    setAuth(data.user, data.sessionId, false);
    showToast('Login berhasil!', 'success');
    router.push('/');
  } catch (err) {
    error.value = err.message;
    showToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const handleRegister = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: regEmail.value, 
        password: regPassword.value, 
        full_name: regFullName.value 
      })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registrasi gagal');
    
    showToast('Registrasi berhasil! Silakan login.', 'success');
    activeTab.value = 'login';
    email.value = regEmail.value; // Autofill email
  } catch (err) {
    error.value = err.message;
    showToast(err.message, 'error');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #020617;
  overflow: hidden;
  position: relative;
  padding: 1.5rem;
}

.glow-bg {
  position: absolute;
  width: 100%;
  height: 100%;
  background: 
    radial-gradient(circle at 20% 30%, rgba(37, 211, 102, 0.1) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.1) 0%, transparent 40%);
  filter: blur(80px);
}

.login-card {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 10;
}

.login-back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 0.75rem;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-bottom: 2rem;
  width: fit-content;
}

.login-back-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-4px);
}

.card-glass {
  position: absolute;
  inset: 0;
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.card-content {
  position: relative;
  padding: 2.5rem;
}

.brand {
  text-align: center;
  margin-bottom: 2rem;
}

.brand-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #00a884 0%, #3b82f6 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
  box-shadow: 0 10px 20px rgba(0, 168, 132, 0.3);
}

.brand-name {
  font-size: 1.75rem;
  font-weight: 800;
  color: #f8fafc;
  margin: 0;
}

.brand-name span { color: #00a884; }

.brand-tagline {
  color: #94a3b8;
  font-size: 0.9rem;
  margin-top: 0.25rem;
}

.tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.5);
  padding: 4px;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.1);
  color: #f8fafc;
}

.input-group {
  margin-bottom: 1.25rem;
}

.input-group label {
  display: block;
  color: #94a3b8;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  margin-left: 0.25rem;
}

.input-group input {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  color: #f8fafc;
  outline: none;
  transition: all 0.2s;
}

.input-group input:focus {
  border-color: #00a884;
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(0, 168, 132, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #00a884 0%, #1da851 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.submit-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 168, 132, 0.3);
}

.submit-btn:active { transform: translateY(0); }

.submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.submit-btn.guest {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.submit-btn.guest:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.guest-tab {
  text-align: center;
}

.guest-info {
  margin-bottom: 2rem;
  color: #94a3b8;
}

.guest-info svg {
  color: #3b82f6;
  margin-bottom: 1rem;
}

.guest-info p {
  font-size: 0.9rem;
  line-height: 1.6;
}

.error-msg {
  color: #f43f5e;
  font-size: 0.85rem;
  text-align: center;
  margin-top: 1.5rem;
  font-weight: 500;
}

.loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Animations */
.fade-slide-enter-active, .fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from { opacity: 0; transform: translateX(20px); }
.fade-slide-leave-to { opacity: 0; transform: translateX(-20px); }
</style>
