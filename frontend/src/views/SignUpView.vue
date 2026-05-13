<template>
  <div class="auth-page">
    <div class="auth-blob auth-blob-1"></div>
    <div class="auth-blob auth-blob-2"></div>
    <div class="auth-blob auth-blob-3"></div>
    <div class="auth-card animate-in">
      <SignUp
        routing="path"
        path="/sign-up"
        sign-in-url="/sign-in"
        fallback-redirect-url="/dashboard"
      />
    </div>
  </div>
</template>

<script setup>
import { SignUp } from '@clerk/vue'
</script>

<style scoped>
.auth-page {
  min-height: 80vh;
  padding: 2.5rem 1rem 4rem;
  background: #f8fafc;
  display: flex;
  align-items: flex-start;
  justify-content: center;
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
  right: -100px;
  animation: float 8s ease-in-out infinite;
}

.auth-blob-2 {
  width: 300px;
  height: 300px;
  background: rgba(244, 164, 27, 0.12);
  bottom: -80px;
  left: -60px;
  animation: float 10s ease-in-out infinite reverse;
}

.auth-blob-3 {
  width: 200px;
  height: 200px;
  background: rgba(124, 58, 237, 0.1);
  top: 30%;
  left: 15%;
  animation: float 12s ease-in-out infinite;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  margin: 2rem auto 0;
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
</style>
