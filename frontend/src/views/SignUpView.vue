<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="text-center mb-4">
        <h2 class="auth-title">Get Started</h2>
        <p class="auth-subtitle">Create your free account to explore programs worldwide.</p>
      </div>

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
  min-height: 100vh;
  padding: 4rem 1rem;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 30%), #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-card {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
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
