<template>
  <div class="dashboard-page">
    <!-- Hero -->
    <section class="dashboard-hero-section">
      <div class="container">
        <div class="dashboard-hero mb-4">
          <div>
            <p class="eyebrow mb-2">{{ settingsStore.t('dashboard.kicker') }}</p>
            <h1 class="section-heading mb-1">
              {{ settingsStore.t('dashboard.welcome', { name: firstName }) }}
            </h1>
            <p class="section-subheading mb-0">{{ settingsStore.t('dashboard.subtitle') }}</p>
          </div>
          <div class="d-flex flex-wrap gap-2">
            <RouterLink to="/profile" class="btn btn-gpe-outline">
              <i class="bi bi-person-lines-fill me-2"></i>{{ settingsStore.t('dashboard.editProfile') }}
            </RouterLink>
            <RouterLink to="/consult" class="btn btn-gpe-primary">
              <i class="bi bi-calendar-check me-2"></i>{{ settingsStore.t('dashboard.bookConsultation') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <div class="container py-4">

      <!-- Stats -->
      <div class="row g-3 mb-5">
        <div v-for="(stat, idx) in stats" :key="stat.label" class="col-6 col-md-3 animate-in" :style="{ animationDelay: `${idx * 0.08}s` }">
          <div class="stat-card">
            <div class="stat-icon">{{ stat.icon }}</div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </div>

      <!-- Recommended Programs -->
      <section class="recommendation-panel mb-5">
        <div class="recommendation-header">
          <div>
            <p class="recommendation-kicker mb-1">
              {{ settingsStore.t('dashboard.recommendations.kicker') }}
            </p>
            <h5 class="recommendation-title mb-1">
              {{ settingsStore.t('dashboard.recommendations.title') }}
            </h5>
            <p class="recommendation-subtitle mb-0">
              {{ recommendationSubtitle }}
            </p>
          </div>
          <RouterLink
            :to="recommendedBrowseLink"
            class="btn btn-sm btn-gpe-outline"
          >
            {{ settingsStore.t('dashboard.recommendations.browseMatches') }}
          </RouterLink>
        </div>

        <div v-if="recommendationsLoading" class="recommendation-loading">
          <div class="spinner-border spinner-border-sm text-primary"></div>
          <span>{{ settingsStore.t('dashboard.recommendations.loading') }}</span>
        </div>
        <div v-else-if="!userStore.isStudentProfileComplete" class="recommendation-empty">
          <i class="bi bi-person-lines-fill"></i>
          <div>
            <h6>{{ settingsStore.t('dashboard.recommendations.completeProfileTitle') }}</h6>
            <p>{{ settingsStore.t('dashboard.recommendations.completeProfileText') }}</p>
          </div>
          <RouterLink to="/profile" class="btn btn-sm btn-gpe-primary">
            {{ settingsStore.t('dashboard.editProfile') }}
          </RouterLink>
        </div>
        <div v-else-if="recommendedPrograms.length === 0" class="recommendation-empty">
          <i class="bi bi-search"></i>
          <div>
            <h6>{{ settingsStore.t('dashboard.recommendations.emptyTitle') }}</h6>
            <p>{{ settingsStore.t('dashboard.recommendations.emptyText') }}</p>
          </div>
          <RouterLink to="/programs" class="btn btn-sm btn-gpe-primary">
            {{ settingsStore.t('dashboard.browsePrograms') }}
          </RouterLink>
        </div>
        <div v-else class="recommendation-grid">
          <article
            v-for="item in recommendedPrograms"
            :key="item.program.id"
            class="recommendation-card"
          >
            <div class="recommendation-card-top" :style="{ background: getCountryGradient(item.program.country) }">
              <span class="recommendation-flag">{{ getCountryFlag(item.program.country) }}</span>
              <span class="recommendation-score">
                {{ item.score }}% {{ settingsStore.t('dashboard.recommendations.match') }}
              </span>
            </div>
            <div class="recommendation-card-body">
              <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
                <div>
                  <div class="recommendation-type">{{ item.program.type }}</div>
                  <h6 class="recommendation-program-title">{{ item.program.title }}</h6>
                  <p class="recommendation-school">
                    {{ item.program.institution }} · {{ item.program.city }}, {{ item.program.country }}
                  </p>
                </div>
                <button
                  class="recommendation-save"
                  :class="{ active: userStore.bookmarkedIds.has(item.program.id) }"
                  :title="settingsStore.t('programCard.saveProgram')"
                  @click="userStore.toggleBookmark(item.program)"
                >
                  <i :class="userStore.bookmarkedIds.has(item.program.id) ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'"></i>
                </button>
              </div>

              <div class="recommendation-meta">
                <span><i class="bi bi-cash"></i>{{ settingsStore.formatMoney(item.program.tuitionFee, item.program.currency) }}</span>
                <span><i class="bi bi-clock"></i>{{ item.program.durationMonths }} {{ settingsStore.t('programCard.monthShort') }}</span>
              </div>

              <div class="recommendation-reasons">
                <span v-for="reason in item.reasons" :key="reason">{{ reason }}</span>
              </div>

              <div class="recommendation-actions">
                <RouterLink :to="`/programs/${item.program.id}`" class="btn btn-sm btn-gpe-primary">
                  {{ settingsStore.t('dashboard.recommendations.viewProgram') }}
                </RouterLink>
                <RouterLink :to="`/consult?programId=${item.program.id}`" class="btn btn-sm btn-gpe-outline">
                  {{ settingsStore.t('dashboard.bookConsultation') }}
                </RouterLink>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div class="row g-4">
        <!-- Saved Programs -->
        <div class="col-lg-6">
          <div class="bg-white rounded-3 p-4 shadow-sm h-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h5 class="fw-bold mb-0" style="color:var(--gpe-primary)">{{ settingsStore.t('dashboard.savedPrograms') }}</h5>
              <RouterLink to="/bookmarks" class="btn btn-sm btn-gpe-outline">{{ settingsStore.t('dashboard.viewAll') }}</RouterLink>
            </div>
            <div v-if="userStore.bookmarks.length > 0" class="dashboard-toolbar mb-3">
              <div class="dashboard-search">
                <i class="bi bi-search"></i>
                <input
                  v-model="bookmarkSearch"
                  type="search"
                  :placeholder="settingsStore.t('programs.filters.search')"
                />
              </div>
            </div>
            <div v-if="userStore.bookmarks.length === 0" class="text-center py-3 text-muted small">
              <div class="fs-3 mb-2">🔖</div>{{ settingsStore.t('dashboard.noSaved') }}
            </div>
            <div v-else>
              <div v-for="b in filteredBookmarks.slice(0, 4)" :key="b.id" class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                  <div class="small fw-semibold" style="color:var(--gpe-primary)">{{ b.program.title }}</div>
                  <div class="small text-muted">{{ b.program.institution }} · {{ b.program.country }}</div>
                </div>
                <RouterLink :to="`/programs/${b.program.id}`" class="btn btn-sm btn-outline-secondary">{{ settingsStore.t('common.view') }}</RouterLink>
              </div>
              <div v-if="filteredBookmarks.length === 0" class="text-center py-3 text-muted small">
                No saved programs match your search.
              </div>
            </div>
          </div>
        </div>

        <!-- Consultations -->
        <div class="col-lg-6">
          <div class="bg-white rounded-3 p-4 shadow-sm h-100">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <h5 class="fw-bold mb-0" style="color:var(--gpe-primary)">{{ settingsStore.t('dashboard.history') }}</h5>
              <RouterLink to="/consult" class="btn btn-sm btn-gpe-outline">{{ settingsStore.t('dashboard.bookNew') }}</RouterLink>
            </div>
            <div v-if="consultations.length > 0" class="dashboard-toolbar dashboard-toolbar-stack mb-3">
              <div class="status-tabs">
                <button
                  v-for="tab in consultationStatusTabs"
                  :key="tab.value"
                  type="button"
                  class="status-tab"
                  :class="{ active: consultationStatus === tab.value }"
                  @click="consultationStatus = tab.value"
                >
                  {{ tab.label }}
                  <span>{{ consultationCount(tab.value) }}</span>
                </button>
              </div>
              <div class="dashboard-search">
                <i class="bi bi-search"></i>
                <input
                  v-model="consultationSearch"
                  type="search"
                  placeholder="Search consultation or program"
                />
              </div>
            </div>
            <div v-if="loading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            <div v-else-if="consultations.length === 0" class="text-center py-3 text-muted small">
              <div class="fs-3 mb-2">📅</div>{{ settingsStore.t('dashboard.noConsultations') }}
            </div>
            <div v-else>
              <div v-for="c in filteredConsultations.slice(0, 5)" :key="c.id" class="py-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <div class="small fw-semibold" style="color:var(--gpe-primary)">{{ c.program?.title || settingsStore.t('dashboard.generalInquiry') }}</div>
                    <div class="small text-muted">{{ formatDate(c.createdAt) }}</div>
                    <div class="small text-muted mt-1" style="max-width:260px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">{{ c.message }}</div>
                  </div>
                  <div class="d-flex flex-column align-items-end gap-1">
                    <span class="badge" :class="statusClass(c.status)">{{ statusLabel(c.status) }}</span>
                    <button v-if="c.status === 'pending'" class="btn btn-sm btn-outline-danger" style="font-size:0.72rem;" @click="cancel(c.id)">{{ settingsStore.t('common.cancel') }}</button>
                  </div>
                </div>
              </div>
              <div v-if="filteredConsultations.length === 0" class="text-center py-3 text-muted small">
                No consultations match your filters.
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="mt-4">
        <h6 class="fw-bold mb-3" style="color:var(--gpe-primary)">{{ settingsStore.t('dashboard.quickActions') }}</h6>
        <div class="quick-actions-grid">
          <RouterLink to="/programs" class="quick-action-card">
            <i class="bi bi-search"></i>
            <span>{{ settingsStore.t('dashboard.browsePrograms') }}</span>
          </RouterLink>
          <RouterLink to="/compare" class="quick-action-card">
            <i class="bi bi-bar-chart-steps"></i>
            <span>{{ settingsStore.t('dashboard.comparePrograms') }}</span>
          </RouterLink>
          <RouterLink to="/consult" class="quick-action-card">
            <i class="bi bi-calendar-check"></i>
            <span>{{ settingsStore.t('dashboard.bookConsultation') }}</span>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUser } from '@clerk/vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { getCountryFlag } from '@/utils/countryFlags'
import { getCountryGradient } from '@/utils/countryStyles'
import api from '@/api'

const { user } = useUser()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const consultations = ref([])
const loading = ref(true)
const bookmarkSearch = ref('')
const consultationSearch = ref('')
const consultationStatus = ref('all')
const candidatePrograms = ref([])
const recommendationsLoading = ref(true)

const firstName = computed(() => userStore.profile?.firstName || user.value?.firstName || 'there')
const completedCount = computed(() => consultations.value.filter(c => c.status === 'completed').length)
const consultationStatusTabs = computed(() => [
  { value: 'all', label: 'All' },
  { value: 'pending', label: settingsStore.t('common.status.pending') },
  { value: 'confirmed', label: settingsStore.t('common.status.confirmed') },
  { value: 'completed', label: settingsStore.t('common.status.completed') },
  { value: 'cancelled', label: settingsStore.t('common.status.cancelled') },
])

const filteredBookmarks = computed(() => {
  const query = bookmarkSearch.value.trim().toLowerCase()
  if (!query) return userStore.bookmarks
  return userStore.bookmarks.filter((bookmark) =>
    [bookmark.program?.title, bookmark.program?.institution, bookmark.program?.country]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const filteredConsultations = computed(() => {
  let list = consultations.value
  if (consultationStatus.value !== 'all') {
    list = list.filter((item) => String(item.status).toLowerCase() === consultationStatus.value)
  }

  const query = consultationSearch.value.trim().toLowerCase()
  if (!query) return list

  return list.filter((consultation) =>
    [consultation.program?.title, consultation.program?.institution, consultation.message, consultation.preferredCountry]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const stats = computed(() => [
  { icon: '🔖', value: userStore.bookmarks.length, label: settingsStore.t('dashboard.savedPrograms') },
  { icon: '📅', value: consultations.value.length, label: settingsStore.t('dashboard.consultations') },
  { icon: '⚖️', value: userStore.compareList.length, label: settingsStore.t('dashboard.inComparison') },
  { icon: '✅', value: completedCount.value, label: settingsStore.t('dashboard.consultationsDone') },
])

const recommendedBrowseLink = computed(() => ({
  path: '/programs',
  query: {
    country: userStore.profile?.preferredDestination || undefined,
    type: preferredProgramType.value || undefined,
  },
}))

const preferredProgramType = computed(() => studyLevelToProgramType(userStore.profile?.preferredStudyLevel))

const recommendationSubtitle = computed(() => {
  const profile = userStore.profile
  if (!profile?.preferredDestination || !profile?.preferredStudyLevel) {
    return settingsStore.t('dashboard.recommendations.subtitleIncomplete')
  }

  return settingsStore.t('dashboard.recommendations.subtitle', {
    destination: profile.preferredDestination,
    level: translatedLevel(profile.preferredStudyLevel),
  })
})

const recommendedPrograms = computed(() => {
  if (!userStore.isStudentProfileComplete) return []

  return candidatePrograms.value
    .map((program) => scoreProgram(program))
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 3)
})

onMounted(async () => {
  await Promise.all([userStore.fetchBookmarks(), userStore.fetchProfile()])
  await fetchRecommendations()

  try {
    const { data } = await api.get('/api/consultations')
    consultations.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

async function fetchRecommendations() {
  recommendationsLoading.value = true

  try {
    const { data } = await api.get('/api/programs', {
      params: {
        page: 1,
        limit: 80,
      },
    })

    candidatePrograms.value = data.data || []
    await fetchRecommendationRates()
  } catch (error) {
    console.error(error)
    candidatePrograms.value = []
  } finally {
    recommendationsLoading.value = false
  }
}

async function fetchRecommendationRates() {
  const budgetCurrency = userStore.profile?.budgetCurrency
  const currencies = new Set(
    candidatePrograms.value
      .map((program) => program.currency)
      .filter((currency) => currency && currency !== budgetCurrency),
  )

  await Promise.all([
    settingsStore.fetchRatesForPrograms(candidatePrograms.value),
    ...[...currencies].map((currency) => settingsStore.fetchRate(currency, budgetCurrency)),
  ])
}

function studyLevelToProgramType(levelKey) {
  return {
    'profile.level.diploma': 'Diploma',
    'profile.level.bachelor': 'Bachelor',
    'profile.level.master': 'Master',
    'profile.level.bootcamp': 'Bootcamp',
    'profile.level.shortCourse': 'Bootcamp',
  }[levelKey] || ''
}

function translatedLevel(levelKey) {
  return levelKey ? settingsStore.t(levelKey) : ''
}

function normalizedText(value) {
  return String(value || '').trim().toLowerCase()
}

function isDestinationMatch(program) {
  return normalizedText(program.country) === normalizedText(userStore.profile?.preferredDestination)
}

function budgetMatch(program) {
  const budget = Number(userStore.profile?.maxBudget)
  const budgetCurrency = userStore.profile?.budgetCurrency

  if (!budget || !budgetCurrency || !program.tuitionFee || !program.currency) return null

  const converted = settingsStore.convertAmount(program.tuitionFee, program.currency, budgetCurrency)
  const convertedCurrency = settingsStore.displayCurrencyFor(program.currency, budgetCurrency)

  if (convertedCurrency !== budgetCurrency) return null

  return {
    amount: converted,
    fits: converted <= budget,
    close: converted > budget && converted <= budget * 1.15,
  }
}

function scoreProgram(program) {
  const reasons = []
  let rawScore = 30

  if (isDestinationMatch(program)) {
    rawScore += 28
    reasons.push(settingsStore.t('dashboard.recommendations.reasonDestination'))
  }

  if (preferredProgramType.value && program.type === preferredProgramType.value) {
    rawScore += 26
    reasons.push(settingsStore.t('dashboard.recommendations.reasonLevel'))
  }

  const affordability = budgetMatch(program)
  if (affordability?.fits) {
    rawScore += 24
    reasons.push(settingsStore.t('dashboard.recommendations.reasonBudget'))
  } else if (affordability?.close) {
    rawScore += 12
    reasons.push(settingsStore.t('dashboard.recommendations.reasonNearBudget'))
  }

  const preferredDestination = normalizedText(userStore.profile?.preferredDestination)
  const specialization = normalizedText(program.specialization)
  if (preferredDestination && specialization.includes(preferredDestination)) {
    rawScore += 6
  }

  if (reasons.length === 0) {
    reasons.push(settingsStore.t('dashboard.recommendations.reasonPopular'))
  }

  return {
    program,
    rawScore,
    score: Math.min(99, Math.max(55, rawScore)),
    reasons: reasons.slice(0, 3),
  }
}

async function cancel(id) {
  await api.patch(`/api/consultations/${id}/cancel`)
  consultations.value = consultations.value.map(c => c.id === id ? { ...c, status: 'cancelled' } : c)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusClass(status) {
  return {
    pending: 'bg-warning text-dark',
    confirmed: 'bg-success',
    completed: 'bg-secondary',
    cancelled: 'bg-danger',
  }[status] || 'bg-secondary'
}

function statusLabel(status) {
  return settingsStore.t(`common.status.${String(status).toLowerCase()}`)
}

function consultationCount(status) {
  if (status === 'all') return consultations.value.length
  return consultations.value.filter((item) => String(item.status).toLowerCase() === status).length
}
</script>

<style scoped>
.dashboard-page {
  background: #f8fafc;
  min-height: 80vh;
}

.dashboard-hero-section {
  background: linear-gradient(135deg, #0f172a 0%, #1a3a5c 60%, #1e5fa0 100%);
  color: #ffffff;
  padding: 2rem 0;
  position: relative;
  overflow: hidden;
}

.dashboard-hero-section::after {
  content: '';
  position: absolute;
  right: -100px;
  bottom: -100px;
  width: 320px;
  height: 320px;
  border-radius: 999px;
  background: rgba(244, 164, 27, 0.08);
  pointer-events: none;
}

.dashboard-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  position: relative;
  z-index: 1;
}

.eyebrow {
  color: #f4a41b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-heading {
  color: #ffffff;
}

.section-subheading {
  color: #94a3b8;
}

/* Quick actions */
.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.dashboard-toolbar {
  display: grid;
  gap: 0.75rem;
}

.dashboard-toolbar-stack {
  gap: 0.9rem;
}

.dashboard-search {
  position: relative;
}

.dashboard-search i {
  color: #94a3b8;
  left: 0.8rem;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.dashboard-search input {
  width: 100%;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  padding: 0.55rem 0.9rem 0.55rem 2.2rem;
  font-size: 0.88rem;
  outline: none;
}

.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.status-tab {
  align-items: center;
  background: #fff;
  border: 1px solid #dbe3ef;
  border-radius: 999px;
  color: #334155;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 0.45rem;
  padding: 0.45rem 0.75rem;
}

.status-tab span {
  background: #f1f5f9;
  border-radius: 999px;
  color: #64748b;
  min-width: 1.45rem;
  padding: 0.1rem 0.35rem;
  text-align: center;
}

.status-tab.active {
  background: #f4a41b;
  border-color: #f4a41b;
  color: #0f172a;
}

/* Recommended programs */
.recommendation-panel {
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 18px;
  box-shadow: 0 10px 32px rgba(15, 23, 42, 0.06);
  padding: 1.25rem;
}

.recommendation-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.recommendation-kicker {
  color: #f4a41b;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.recommendation-title {
  color: #0f172a;
  font-weight: 850;
  letter-spacing: -0.02em;
}

.recommendation-subtitle {
  color: #64748b;
  font-size: 0.9rem;
}

.recommendation-loading,
.recommendation-empty {
  align-items: center;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 14px;
  color: #64748b;
  display: flex;
  gap: 0.9rem;
  padding: 1rem;
}

.recommendation-empty i {
  align-items: center;
  background: #eff6ff;
  border-radius: 12px;
  color: #2563eb;
  display: inline-flex;
  font-size: 1.3rem;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.recommendation-empty h6 {
  color: #0f172a;
  font-weight: 800;
  margin: 0 0 0.15rem;
}

.recommendation-empty p {
  font-size: 0.88rem;
  margin: 0;
}

.recommendation-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.recommendation-card {
  border: 1px solid #e8eef5;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}

.recommendation-card-top {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  min-height: 76px;
  padding: 0.8rem;
}

.recommendation-flag {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  font-size: 1.9rem;
  line-height: 1;
}

.recommendation-score {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 999px;
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 850;
  padding: 0.3rem 0.55rem;
}

.recommendation-card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 1rem;
}

.recommendation-type {
  color: #2563eb;
  font-size: 0.7rem;
  font-weight: 850;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.recommendation-program-title {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 850;
  line-height: 1.25;
  margin: 0.15rem 0;
}

.recommendation-school {
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.35;
  margin: 0;
}

.recommendation-save {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  color: #64748b;
  display: inline-flex;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.recommendation-save.active {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #f4a41b;
}

.recommendation-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  margin: 0.75rem 0;
}

.recommendation-meta span {
  align-items: center;
  background: #f8fafc;
  border-radius: 999px;
  color: #334155;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 750;
  gap: 0.35rem;
  padding: 0.35rem 0.55rem;
}

.recommendation-reasons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.recommendation-reasons span {
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  color: #15803d;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.28rem 0.5rem;
}

.recommendation-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
}

.quick-action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  padding: 1.5rem 1rem;
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 16px;
  text-decoration: none;
  color: var(--gpe-primary);
  font-weight: 700;
  font-size: 0.88rem;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}

.quick-action-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.1);
  border-color: #bfdbfe;
  color: #2563eb;
}

.quick-action-card i {
  font-size: 1.5rem;
  color: #2563eb;
  transition: transform 0.3s ease;
}

.quick-action-card:hover i {
  transform: scale(1.15);
}

@media (max-width: 767.98px) {
  .dashboard-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .recommendation-header,
  .recommendation-empty {
    align-items: stretch;
    flex-direction: column;
  }

  .recommendation-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 768px) and (max-width: 1199.98px) {
  .recommendation-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
