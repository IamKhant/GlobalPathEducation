<template>
  <div class="compare-page">
    <!-- Hero header -->
    <section class="compare-hero">
      <div class="container">
        <div class="compare-hero-content">
          <div>
            <span class="compare-kicker">{{ settingsStore.t('compare.title') }}</span>
            <h1 class="compare-title">{{ settingsStore.t('compare.title') }}</h1>
            <p class="compare-subtitle">{{ settingsStore.t('compare.subtitle') }}</p>
          </div>
          <div v-if="userStore.compareList.length" class="d-flex gap-2">
            <button class="btn btn-outline-danger btn-sm rounded-pill px-3" @click="userStore.clearCompareList()">
              <i class="bi bi-trash me-1"></i>{{ settingsStore.t('compare.clearAll') }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <div class="container py-4">
      <!-- Empty state -->
      <div v-if="userStore.compareList.length === 0" class="compare-empty animate-in">
        <div class="compare-empty-icon">⚖️</div>
        <h3>{{ settingsStore.t('compare.empty.title') }}</h3>
        <p>{{ settingsStore.t('compare.empty.subtitle') }}</p>
        <RouterLink to="/programs" class="btn btn-primary rounded-pill px-4">
          {{ settingsStore.t('compare.empty.button') }}
        </RouterLink>
      </div>

      <!-- Comparison grid -->
      <div v-else class="compare-grid" :style="{ '--cols': userStore.compareList.length + (userStore.compareList.length < 3 ? 1 : 0) }">
        <!-- Program columns -->
        <div
          v-for="(p, idx) in userStore.compareList"
          :key="p.id"
          class="compare-column animate-in"
          :style="{ animationDelay: `${idx * 0.1}s` }"
        >
          <!-- Card header with gradient -->
          <div class="compare-card-header" :style="{ background: getCountryGradient(p.country) }">
            <div class="compare-card-header-overlay">
              <button
                class="compare-remove-btn"
                @click="userStore.removeFromCompare(p.id)"
                :aria-label="settingsStore.t('compare.clearAll')"
              >
                <i class="bi bi-x-lg"></i>
              </button>
              <div class="compare-card-avatar">{{ p.institution.charAt(0) }}</div>
              <h4 class="compare-card-title">{{ p.title }}</h4>
              <p class="compare-card-institution">{{ p.institution }}</p>
            </div>
          </div>

          <!-- Info rows -->
          <div class="compare-card-body">
            <div v-for="(row, rIdx) in compareRows" :key="row.key" :class="['compare-row', { alt: rIdx % 2 === 1 }]">
              <span class="compare-row-label">{{ settingsStore.t(row.labelKey) }}</span>
              <div class="compare-row-value">
                <span v-if="row.key === 'type'" :class="['compare-type-badge', p.type === 'Master' ? 'master' : 'bootcamp']">
                  {{ p.type }}
                </span>
                <span v-else-if="row.key === 'country'">{{ getCountryFlag(p.country) }} {{ p.country }}</span>
                <span v-else-if="row.key === 'duration'">{{ p.durationMonths }} months</span>
                <span v-else-if="row.key === 'tuition'">
                  <strong :class="{ 'text-success': p.tuitionFee === 0 }">{{ formatTuition(p) }}</strong>
                  <small v-if="p.tuitionFee !== 0" class="compare-fee-basis">{{ feeBasisLabel(p.feeBasis) }}</small>
                </span>
                <span v-else-if="row.key === 'specialization'" class="compare-tags">
                  <span v-for="tag in specializationTags(p)" :key="tag" class="compare-tag">{{ tag }}</span>
                </span>
                <span v-else-if="row.key === 'desc'" class="compare-description">
                  {{ shortDescription(p.description) }}
                </span>
                <a
                  v-else-if="row.key === 'link' && p.websiteUrl"
                  :href="p.websiteUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="compare-visit-btn"
                >
                  {{ settingsStore.t('compare.visit') }}
                  <i class="bi bi-arrow-up-right"></i>
                </a>
                <span v-else-if="row.key === 'link'" class="compare-na">—</span>
                <span v-else>{{ row.value(p) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Add program slot -->
        <div v-if="userStore.compareList.length < 3" class="compare-column compare-add-column animate-in" :style="{ animationDelay: `${userStore.compareList.length * 0.1}s` }">
          <RouterLink to="/programs" class="compare-add-card">
            <div class="compare-add-icon">
              <i class="bi bi-plus-lg"></i>
            </div>
            <span>{{ settingsStore.t('compare.addProgram') }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { getCountryFlag } from '@/utils/countryFlags'
import { getCountryGradient } from '@/utils/countryStyles'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

watch(
  () => [
    settingsStore.selectedCurrency,
    ...userStore.compareList.map((program) => program.currency),
  ],
  () => settingsStore.fetchRatesForPrograms(userStore.compareList),
  { immediate: true },
)

function formatTuition(p) {
  return settingsStore.formatMoney(p.tuitionFee, p.currency)
}

function feeBasisLabel(feeBasis) {
  return { annual: '/yr', total: 'total', per_term: '/term' }[feeBasis] || ''
}

function specializationTags(p) {
  return (p.specialization || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function shortDescription(description) {
  if (!description) return '-'
  return description.length > 120 ? `${description.slice(0, 120)}...` : description
}

const compareRows = [
  { key: 'type', labelKey: 'compare.row.type' },
  { key: 'country', labelKey: 'compare.row.country' },
  { key: 'city', labelKey: 'compare.row.city', value: (p) => p.city || '-' },
  { key: 'duration', labelKey: 'compare.row.duration' },
  { key: 'tuition', labelKey: 'compare.row.tuition' },
  { key: 'language', labelKey: 'compare.row.language', value: (p) => p.language || '-' },
  { key: 'specialization', labelKey: 'compare.row.specialization' },
  { key: 'desc', labelKey: 'compare.row.description' },
  { key: 'link', labelKey: 'compare.row.link' },
]
</script>

<style scoped>
.compare-page {
  min-height: 80vh;
  background: #f8fafc;
}

/* Hero */
.compare-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1a3a5c 60%, #1e5fa0 100%);
  color: #ffffff;
  padding: 2.5rem 0 2rem;
  position: relative;
  overflow: hidden;
}

.compare-hero::after {
  content: '';
  position: absolute;
  right: -120px;
  top: -120px;
  width: 360px;
  height: 360px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.12);
  pointer-events: none;
}

.compare-hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.compare-kicker {
  display: inline-block;
  margin-bottom: 0.3rem;
  color: #f4a41b;
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.compare-title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 850;
  letter-spacing: -0.04em;
}

.compare-subtitle {
  margin: 0.5rem 0 0;
  color: #94a3b8;
}

/* Empty state */
.compare-empty {
  max-width: 480px;
  margin: 3rem auto;
  padding: 3rem 2rem;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e8eef5;
  border-radius: 24px;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
}

.compare-empty-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.compare-empty h3 {
  color: #0f172a;
  font-weight: 850;
  margin-bottom: 0.5rem;
}

.compare-empty p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* Grid */
.compare-grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 3), minmax(0, 1fr));
  gap: 1rem;
  align-items: start;
}

/* Column */
.compare-column {
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e5edf7;
  overflow: hidden;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.06);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease;
}

.compare-column:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.12);
}

.compare-card-header {
  position: relative;
  padding: 0;
  min-height: 160px;
}

.compare-card-header-overlay {
  position: absolute;
  inset: 0;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.55) 100%);
  color: #ffffff;
}

.compare-remove-btn {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.2s ease;
}

.compare-remove-btn:hover {
  background: rgba(239, 68, 68, 0.85);
  transform: scale(1.1);
}

.compare-card-avatar {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 0.6rem;
}

.compare-card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.3;
  color: #ffffff;
}

.compare-card-institution {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.8);
}

/* Rows */
.compare-card-body {
  padding: 0;
}

.compare-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
}

.compare-row.alt {
  background: #fafbfd;
}

.compare-row:last-child {
  border-bottom: 0;
}

.compare-row-label {
  font-size: 0.72rem;
  font-weight: 750;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #94a3b8;
}

.compare-row-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: #0f172a;
}

.compare-type-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.compare-type-badge.master {
  background: #e8f0fe;
  color: #1a3a5c;
}

.compare-type-badge.bootcamp {
  background: #fff3cd;
  color: #856404;
}

.compare-fee-basis {
  color: #94a3b8;
  margin-left: 0.3rem;
}

.compare-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.compare-tag {
  display: inline-block;
  background: #f0f6ff;
  color: #2e7dc7;
  border-radius: 20px;
  padding: 2px 9px;
  font-size: 0.72rem;
  font-weight: 500;
}

.compare-description {
  display: block;
  font-size: 0.82rem;
  font-weight: 400;
  color: #64748b;
  line-height: 1.5;
}

.compare-visit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.85rem;
  border-radius: 999px;
  background: #2e7dc7;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.compare-visit-btn:hover {
  background: #1a3a5c;
  transform: translateY(-1px);
  color: #ffffff;
}

.compare-na {
  color: #cbd5e1;
}

/* Add program card */
.compare-add-column {
  border: 2px dashed #cbd5e1;
  background: transparent;
  box-shadow: none;
  min-height: 400px;
}

.compare-add-column:hover {
  border-color: #2563eb;
  box-shadow: none;
}

.compare-add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  min-height: 400px;
  text-decoration: none;
  color: #94a3b8;
  transition: color 0.2s ease;
}

.compare-add-card:hover {
  color: #2563eb;
}

.compare-add-icon {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  transition: background 0.2s ease, transform 0.2s ease;
}

.compare-add-card:hover .compare-add-icon {
  background: #dbeafe;
  transform: scale(1.1);
}

.compare-add-card span {
  font-size: 0.88rem;
  font-weight: 700;
}

@media (max-width: 991.98px) {
  .compare-grid {
    grid-template-columns: 1fr;
  }

  .compare-hero-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .compare-add-column {
    min-height: 200px;
  }

  .compare-add-card {
    min-height: 200px;
  }
}
</style>
