<template>
  <div class="auth-page">
    <div class="auth-blob auth-blob-1"></div>
    <div class="auth-blob auth-blob-2"></div>
    <div class="auth-blob auth-blob-3"></div>
    <div class="auth-card animate-in">
      <div class="text-center mb-4">
        <div class="auth-icon"><i class="bi bi-door-open"></i></div>
        <h2 class="auth-title">{{ settingsStore.t('auth.signIn.title') }}</h2>
        <p class="auth-subtitle">{{ settingsStore.t('auth.signIn.subtitle') }}</p>
      </div>

      <SignIn
        routing="path"
        path="/sign-in"
        sign-up-url="/sign-up"
        fallback-redirect-url="/dashboard"
      />
    </div>
  </div>
</template>

<script setup>
import { SignIn } from '@clerk/vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>

<style scoped>
.auth-page {
  min-height: 80vh;
  padding: 4rem 1rem;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.auth-blob {
  position: absolute;
  border-radius: 999px;
  pointer-events: none;
  filter: blur(80px);
  opacity: 0.5;
}

.auth-blob-1 {
  width: 400px;
  height: 400px;
  background: rgba(37, 99, 235, 0.15);
  top: -120px;
  left: -100px;
  animation: float 8s ease-in-out infinite;
}

.auth-blob-2 {
  width: 300px;
  height: 300px;
  background: rgba(244, 164, 27, 0.12);
  bottom: -80px;
  right: -60px;
  animation: float 10s ease-in-out infinite reverse;
}

.auth-blob-3 {
  width: 200px;
  height: 200px;
  background: rgba(124, 58, 237, 0.1);
  top: 40%;
  right: 20%;
  animation: float 12s ease-in-out infinite;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
}

.auth-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 1rem;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.25);
}

.auth-title {
  color: #0f172a;
  font-weight: 850;
  letter-spacing: -0.03em;
}

.auth-subtitle {
  color: #64748b;
}

.auth-card :deep(.cl-rootBox),
.auth-card :deep(.cl-cardBox),
.auth-card :deep(.cl-card) {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}
</style>
