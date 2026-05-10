<template>
  <div class="bookmarks-page">
    <!-- Hero header -->
    <section class="bookmarks-hero">
      <div class="container">
        <div class="bookmarks-hero-content">
          <div>
            <span class="bookmarks-kicker">{{ settingsStore.t('bookmarks.title') }}</span>
            <h1 class="bookmarks-title">{{ settingsStore.t('bookmarks.title') }}</h1>
            <p class="bookmarks-subtitle">
              {{ settingsStore.t('bookmarks.savedCount', { count: userStore.bookmarks.length }) }}
            </p>
          </div>
          <RouterLink to="/programs" class="btn btn-outline-light btn-sm rounded-pill px-3">
            <i class="bi bi-search me-2"></i>Browse Programs
          </RouterLink>
        </div>
      </div>
    </section>

    <div class="container py-4">
      <!-- Loading skeleton -->
      <div v-if="loading" class="row g-4">
        <div v-for="i in 3" :key="i" class="col-md-6 col-lg-4">
          <div class="program-card">
            <div style="height: 72px; background: linear-gradient(135deg, #e2e8f0, #cbd5e1)"></div>
            <div class="card-body">
              <div class="placeholder-glow d-flex flex-column gap-2">
                <div class="placeholder rounded-pill" style="height: 14px; width: 60%"></div>
                <div class="placeholder rounded" style="height: 18px; width: 90%"></div>
                <div class="placeholder rounded" style="height: 18px; width: 75%"></div>
                <div class="placeholder rounded" style="height: 12px; width: 45%; margin-top: 4px"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="userStore.bookmarks.length === 0" class="bookmarks-empty animate-in">
        <div class="bookmarks-empty-icon">🔖</div>
        <h3>{{ settingsStore.t('bookmarks.empty.title') }}</h3>
        <p>{{ settingsStore.t('bookmarks.empty.subtitle') }}</p>
        <RouterLink to="/programs" class="btn btn-primary rounded-pill px-4">
          {{ settingsStore.t('bookmarks.empty.button') }}
        </RouterLink>
      </div>

      <!-- Bookmarked programs -->
      <div v-else class="row g-4">
        <div
          v-for="(b, idx) in userStore.bookmarks"
          :key="b.id"
          class="col-md-6 col-lg-4 animate-in"
          :style="{ animationDelay: `${idx * 0.06}s` }"
        >
          <ProgramCard :program="b.program" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import ProgramCard from '@/components/ProgramCard.vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const settingsStore = useSettingsStore()
const userStore = useUserStore()
const loading = ref(true)

onMounted(async () => {
  await userStore.fetchBookmarks()
  loading.value = false
})
</script>

<style scoped>
.bookmarks-page {
  min-height: 80vh;
  background: #f8fafc;
}

/* Hero */
.bookmarks-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1a3a5c 60%, #1e5fa0 100%);
  color: #ffffff;
  padding: 2.5rem 0 2rem;
  position: relative;
  overflow: hidden;
}

.bookmarks-hero::after {
  content: '';
  position: absolute;
  right: -100px;
  top: -100px;
  width: 300px;
  height: 300px;
  border-radius: 999px;
  background: rgba(244, 164, 27, 0.1);
  pointer-events: none;
}

.bookmarks-hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.bookmarks-kicker {
  display: inline-block;
  margin-bottom: 0.3rem;
  color: #f4a41b;
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bookmarks-title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 850;
  letter-spacing: -0.04em;
}

.bookmarks-subtitle {
  margin: 0.5rem 0 0;
  color: #94a3b8;
}

/* Empty state */
.bookmarks-empty {
  max-width: 480px;
  margin: 3rem auto;
  padding: 3rem 2rem;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e8eef5;
  border-radius: 24px;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
}

.bookmarks-empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.bookmarks-empty h3 {
  color: #0f172a;
  font-weight: 850;
  margin-bottom: 0.5rem;
}

.bookmarks-empty p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

@media (max-width: 767.98px) {
  .bookmarks-hero-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
