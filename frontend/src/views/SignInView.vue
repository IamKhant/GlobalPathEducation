<template>
  <div class="auth-page">
    <div class="auth-blob auth-blob-1"></div>
    <div class="auth-blob auth-blob-2"></div>
    <div class="auth-blob auth-blob-3"></div>
    <div class="auth-card animate-in">
      <SignIn
        routing="path"
        path="/sign-in"
        sign-up-url="/sign-up"
        fallback-redirect-url="/dashboard"
      />
    </div>

    <div class="demo-credentials animate-in">
      <div class="demo-credentials-head">
        <i class="bi bi-key"></i>
        <span>{{ settingsStore.t('auth.demoCredentials') }}</span>
      </div>
      <div class="demo-credentials-list">
        <div class="demo-credential-row">
          <strong>{{ settingsStore.t('auth.demoAdmin') }}</strong>
          <div class="credential-line">
            <span>{{ settingsStore.t('auth.demoEmail') }}</span>
            <code>admin@globalpath.com</code>
          </div>
          <div class="credential-line">
            <span>{{ settingsStore.t('auth.demoPassword') }}</span>
            <code>iamadmin</code>
          </div>
        </div>
        <div class="demo-credential-row">
          <strong>{{ settingsStore.t('auth.demoConsultant') }}</strong>
          <div class="credential-line credential-line-stack">
            <span>{{ settingsStore.t('auth.demoEmails') }}</span>
            <code>auconsultant@globalpath.com</code>
            <code>euconsultant@globalpath.com</code>
            <code>asianconsultant@globalpath.com</code>
          </div>
          <div class="credential-line">
            <span>{{ settingsStore.t('auth.demoPassword') }}</span>
            <code>consultant</code>
          </div>
        </div>
        <div class="demo-credential-row">
          <strong>{{ settingsStore.t('auth.demoStudent') }}</strong>
          <p class="credential-note">
            <i class="bi bi-envelope-check"></i>
            <span>{{ settingsStore.t('auth.studentEmailTestingNote') }}</span>
          </p>
          <div class="credential-line">
            <span>{{ settingsStore.t('auth.demoAccounts') }}</span>
            <code>studentone@globalpath.com - studentten@globalpath.com</code>
          </div>
          <div class="credential-line">
            <span>{{ settingsStore.t('auth.demoPassword') }}</span>
            <code>student</code>
          </div>
        </div>
      </div>
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
  flex-direction: column;
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

.auth-card :deep(.cl-rootBox),
.auth-card :deep(.cl-cardBox),
.auth-card :deep(.cl-card) {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.demo-credentials {
  position: absolute;
  top: calc(50% - 300px);
  left: calc(50% + 270px);
  width: min(360px, calc(50vw - 300px));
  max-height: calc(100% - 2rem);
  overflow-y: auto;
  padding: 1rem;
  border: 1px solid #e5edf7;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  text-align: left;
  z-index: 1;
}

.demo-credentials-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.8rem;
  color: #0f172a;
  font-size: 0.9rem;
  font-weight: 800;
}

.demo-credentials-head i {
  color: #f4a41b;
}

.demo-credentials-list {
  display: grid;
  gap: 0.7rem;
}

.demo-credential-row {
  display: grid;
  gap: 0.35rem;
  padding: 0.75rem 0.85rem;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.demo-credential-row strong {
  color: #0f172a;
  font-size: 0.82rem;
}

.demo-credential-row code {
  display: inline-block;
  width: fit-content;
  padding: 0.22rem 0.45rem;
  border-radius: 8px;
  background: #e2e8f0;
  color: #0f172a;
  font-size: 0.78rem;
}

.credential-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.credential-line-stack {
  align-items: flex-start;
  flex-direction: column;
}

.credential-line span {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
}

.credential-note {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  margin: 0.35rem 0 0;
  padding: 0.65rem 0.7rem;
  border: 1px solid #facc15;
  border-radius: 9px;
  background: #fffbeb;
  color: #854d0e;
  font-size: 0.76rem;
  font-weight: 700;
  line-height: 1.45;
}

.credential-note i {
  flex-shrink: 0;
  color: #d97706;
  font-size: 0.9rem;
  line-height: 1.3;
}

@media (max-width: 1199.98px) {
  .auth-page {
    justify-content: flex-start;
    overflow: visible;
  }

  .demo-credentials {
    position: relative;
    top: auto;
    left: auto;
    width: min(100%, 480px);
    max-height: none;
    margin-top: 1rem;
    overflow-y: visible;
    transform: none;
  }
}
</style>
