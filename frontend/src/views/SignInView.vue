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

      <div class="demo-credentials">
        <div class="demo-credentials-head">
          <i class="bi bi-key"></i>
          <span>Demo login credentials</span>
        </div>
        <div class="demo-credentials-list">
          <div class="demo-credential-row">
            <strong>Admin</strong>
            <code>admin@globalpath.com</code>
            <code>iamadmin</code>
          </div>
          <div class="demo-credential-row">
            <strong>Consultant</strong>
            <code>khantzinkoaustralia@gmail.com</code>
            <code>iamconsultant</code>
          </div>
          <div class="demo-credential-row">
            <strong>Student</strong>
            <code>studentthree@gmail.com</code>
            <code>iamstudent</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { SignIn } from '@clerk/vue'
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

.auth-card :deep(.cl-rootBox),
.auth-card :deep(.cl-cardBox),
.auth-card :deep(.cl-card) {
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.demo-credentials {
  width: 100%;
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #e5edf7;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  text-align: left;
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
</style>
