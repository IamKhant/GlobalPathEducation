<template>
  <div class="consultant-page">
    <div class="container">
      <header class="consultant-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('consultant.kicker') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('consultant.title') }}</h1>
          <p class="section-subheading mb-0">{{ settingsStore.t('consultant.subtitle') }}</p>
        </div>
        <div class="role-pill">{{ role || 'consultant' }}</div>
      </header>

      <div v-if="loading" class="loading-panel">{{ settingsStore.t('consultant.loading') }}</div>

      <template v-else>
        <div class="stats-grid">
          <article class="stat-card">
            <span>{{ settingsStore.t('consultant.stats.totalRequests') }}</span>
            <strong>{{ dashboard.totals?.consultations || consultations.length }}</strong>
            <small>{{ settingsStore.t('consultant.stats.awaitingAction', { count: pendingCount }) }}</small>
          </article>
          <article class="stat-card accent">
            <span>{{ settingsStore.t('consultant.stats.pendingRequests') }}</span>
            <strong>{{ pendingCount }}</strong>
            <small>{{ settingsStore.t('consultant.stats.alreadyConfirmed', { count: confirmedCount }) }}</small>
          </article>
          <article class="stat-card">
            <span>{{ settingsStore.t('consultant.stats.students') }}</span>
            <strong>{{ dashboard.totals?.students || students.length }}</strong>
            <small>{{ settingsStore.t('consultant.stats.profilesReady', { count: studentProfilesReady }) }}</small>
          </article>
          <article class="stat-card">
            <span>{{ settingsStore.t('consultant.stats.assignedAreas') }}</span>
            <strong>{{ dashboard.totals?.assignedCountries || 0 }}</strong>
            <small>{{ dashboard.countries?.length ? dashboard.countries.join(', ') : settingsStore.t('consultant.stats.noAreas') }}</small>
          </article>
        </div>

        <div class="overview-grid">
          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('consultant.overview.pipeline') }}</h2>
              <button type="button" class="text-button" @click="router.push('/consultant/consultations')">
                {{ settingsStore.t('consultant.overview.openQueue') }}
              </button>
            </div>
            <div class="status-grid">
              <div v-for="item in overviewStatuses" :key="item.key" class="status-card">
                <span :class="['status-dot', `status-dot-${item.key}`]"></span>
                <div>
                  <strong>{{ item.count }}</strong>
                  <small>{{ item.label }}</small>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('consultant.overview.quickActions') }}</h2>
            </div>
            <div class="quick-action-grid">
              <button type="button" class="quick-action-card" @click="router.push('/consultant/consultations')">
                <i class="bi bi-calendar-check"></i>
                <div>
                  <strong>{{ settingsStore.t('consultant.overview.reviewRequests') }}</strong>
                  <small>{{ settingsStore.t('consultant.overview.reviewRequestsDesc') }}</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/consultant/students')">
                <i class="bi bi-people"></i>
                <div>
                  <strong>{{ settingsStore.t('consultant.overview.openProfiles') }}</strong>
                  <small>{{ settingsStore.t('consultant.overview.openProfilesDesc') }}</small>
                </div>
              </button>
              <button type="button" class="quick-action-card muted-action">
                <i class="bi bi-geo-alt"></i>
                <div>
                  <strong>{{ settingsStore.t('consultant.overview.checkCoverage') }}</strong>
                  <small>{{ assignedAreasText }}</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/consultant/consultations?status=pending')">
                <i class="bi bi-clock-history"></i>
                <div>
                  <strong>{{ settingsStore.t('consultant.overview.focusPending') }}</strong>
                  <small>{{ settingsStore.t('consultant.overview.focusPendingDesc', { count: pendingCount }) }}</small>
                </div>
              </button>
            </div>
          </article>
        </div>

        <div class="two-col">
          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('consultant.overview.recentConsultations') }}</h2>
              <button type="button" class="text-button" @click="router.push('/consultant/consultations')">
                {{ settingsStore.t('consultant.overview.viewAll') }}
              </button>
            </div>
            <div class="compact-list">
              <div v-for="consultation in recentConsultations" :key="consultation.id" class="compact-row">
                <div>
                  <strong>{{ consultation.fullName }}</strong>
                  <span>{{ consultation.program?.title || settingsStore.t('consultant.consultations.generalInquiry') }}</span>
                </div>
                <span class="status-badge" :class="statusClass(consultation.status)">
                  {{ statusLabel(consultation.status) }}
                </span>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('consultant.overview.recentStudents') }}</h2>
              <button type="button" class="text-button" @click="router.push('/consultant/students')">
                {{ settingsStore.t('consultant.overview.viewAll') }}
              </button>
            </div>
            <div class="compact-list">
              <div v-for="student in recentStudents" :key="student.id" class="compact-row">
                <div>
                  <strong>{{ studentName(student) }}</strong>
                  <span>{{ student.email }}</span>
                </div>
                <small>{{ student.preferredDestination || settingsStore.t('consultant.overview.noDestination') }}</small>
              </div>
            </div>
          </article>
        </div>

        <div class="two-col">
          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('consultant.overview.assignedRegions') }}</h2>
            </div>
            <div class="area-chip-row">
              <span v-for="country in dashboard.countries || []" :key="country">{{ country }}</span>
              <span v-if="!(dashboard.countries || []).length" class="area-chip-muted">{{ settingsStore.t('consultant.filter.noRegionsAssigned') }}</span>
            </div>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('consultant.overview.studentReadiness') }}</h2>
            </div>
            <div class="compact-list">
              <div class="compact-row">
                <div>
                  <strong>{{ studentProfilesReady }}</strong>
                  <span>{{ settingsStore.t('consultant.overview.profilesWithPreferences') }}</span>
                </div>
                <small>{{ students.length ? `${Math.round((studentProfilesReady / students.length) * 100)}%` : '0%' }}</small>
              </div>
              <div class="compact-row">
                <div>
                  <strong>{{ students.length - studentProfilesReady }}</strong>
                  <span>{{ settingsStore.t('consultant.overview.studentsMissingDetails') }}</span>
                </div>
                <small>{{ settingsStore.t('consultant.overview.needsFollowUp') }}</small>
              </div>
            </div>
          </article>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useSettingsStore } from '@/stores/settings'

const router = useRouter()
const settingsStore = useSettingsStore()
const loading = ref(true)
const role = ref('')
const dashboard = ref({})
const consultations = ref([])
const students = ref([])

const recentConsultations = computed(() => consultations.value.slice(0, 5))
const recentStudents = computed(() => students.value.slice(0, 5))
const pendingCount = computed(() => statusCount('pending'))
const confirmedCount = computed(() => statusCount('confirmed'))
const assignedAreasText = computed(() => {
  const countries = dashboard.value.countries || []
  if (!countries.length) return settingsStore.t('consultant.filter.noRegionsAssigned')
  return countries.length > 2 ? `${countries.slice(0, 2).join(', ')} +${countries.length - 2} more` : countries.join(', ')
})
const studentProfilesReady = computed(() => students.value.filter((student) => hasProfileContext(student)).length)
const overviewStatuses = computed(() => [
  { key: 'pending', label: settingsStore.t('consultant.filter.pending'), count: pendingCount.value },
  { key: 'confirmed', label: settingsStore.t('consultant.filter.confirmed'), count: confirmedCount.value },
  { key: 'completed', label: settingsStore.t('consultant.filter.completed'), count: statusCount('completed') },
  { key: 'cancelled', label: settingsStore.t('consultant.filter.cancelled'), count: statusCount('cancelled') },
])

onMounted(async () => {
  await Promise.all([fetchRole(), fetchDashboard(), fetchConsultations(), fetchStudents()])
  loading.value = false
})

async function fetchRole() {
  const { data } = await api.get('/api/consultant/me')
  role.value = data.role
}

async function fetchDashboard() {
  const { data } = await api.get('/api/consultant/dashboard')
  dashboard.value = data
}

async function fetchConsultations() {
  const { data } = await api.get('/api/consultant/consultations')
  consultations.value = data
}

async function fetchStudents() {
  const { data } = await api.get('/api/consultant/students')
  students.value = data
}

function statusCount(status) {
  return consultations.value.filter((consultation) => normalizeStatus(consultation.status) === status).length
}

function studentName(student) {
  return [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email
}

function hasProfileContext(student) {
  return Boolean(
    student.preferredDestination ||
      student.preferredStudyLevel ||
      student.currentEducationLevel ||
      student.maxBudget,
  )
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
}

function statusLabel(status) {
  return settingsStore.t(`common.status.${normalizeStatus(status)}`)
}

function statusClass(status) {
  return {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }[normalizeStatus(status)]
}
</script>

<style scoped>
.consultant-page { background: #f8fafc; min-height: 70vh; padding: 2rem 0 3rem; }
.consultant-header { align-items: center; display: flex; gap: 1rem; justify-content: space-between; margin-bottom: 1rem; }
.eyebrow { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.role-pill { background: #0f172a; border-radius: 999px; color: #fff; font-size: 0.8rem; font-weight: 850; padding: 0.45rem 0.85rem; text-transform: capitalize; }
.loading-panel, .panel, .stat-card { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); }
.loading-panel { padding: 2.5rem 1rem; text-align: center; }
.panel, .stat-card { padding: 1rem; }
.stats-grid, .overview-grid, .two-col { display: grid; gap: 1rem; margin-bottom: 1rem; }
.stats-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.overview-grid, .two-col { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.panel-heading, .compact-row { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.panel-heading h2 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0; }
.stat-card span, .stat-card small, .compact-row span, .compact-row small { color: #64748b; }
.stat-card strong { color: #0f172a; display: block; font-size: 1.8rem; line-height: 1.1; margin-top: 0.35rem; }
.stat-card.accent { border-color: rgba(244, 164, 27, 0.45); }
.text-button { background: transparent; border: 0; color: #0a82d3; font-weight: 850; }
.compact-list, .quick-action-grid { display: grid; gap: 0.85rem; }
.quick-action-grid, .status-grid { display: grid; gap: 0.75rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.quick-action-card { align-items: flex-start; background: #f8fafc; border: 1px solid #e5edf7; border-radius: 10px; color: #0f172a; display: flex; gap: 0.85rem; padding: 0.95rem; text-align: left; width: 100%; }
.quick-action-card i { align-items: center; background: #0f172a; border-radius: 10px; color: #fff; display: inline-flex; flex: 0 0 38px; font-size: 1rem; height: 38px; justify-content: center; width: 38px; }
.quick-action-card strong, .compact-row strong { color: #0f172a; display: block; font-size: 0.92rem; font-weight: 850; margin-bottom: 0.2rem; }
.quick-action-card small { color: #64748b; display: block; line-height: 1.5; }
.muted-action { cursor: default; }
.compact-row { align-items: center; border-top: 1px solid #eef2f7; padding-top: 0.85rem; }
.compact-row:first-child { border-top: 0; }
.status-card { align-items: center; background: #f8fafc; border: 1px solid #e5edf7; border-radius: 10px; display: flex; gap: 0.75rem; padding: 0.85rem 0.9rem; }
.status-card strong { color: #0f172a; display: block; font-size: 1.1rem; font-weight: 850; }
.status-card small { color: #64748b; }
.status-dot { border-radius: 999px; display: inline-flex; flex: 0 0 12px; height: 12px; width: 12px; }
.status-dot-pending { background: #f97316; }
.status-dot-confirmed { background: #22c55e; }
.status-dot-completed { background: #64748b; }
.status-dot-cancelled { background: #ef4444; }
.status-badge { border-radius: 999px; font-size: 0.75rem; font-weight: 850; padding: 0.35rem 0.65rem; white-space: nowrap; }
.status-pending { background: #fff7ed; color: #c2410c; }
.status-confirmed { background: #ecfdf3; color: #15803d; }
.status-completed { background: #f1f5f9; color: #475569; }
.status-cancelled { background: #fef2f2; color: #b91c1c; }
.area-chip-row { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.area-chip-row span { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 999px; color: #0f4d85; font-size: 0.74rem; font-weight: 800; padding: 0.24rem 0.5rem; }
.area-chip-row .area-chip-muted { background: #f8fafc; border-color: #e5edf7; color: #64748b; }
@media (max-width: 991.98px) {
  .consultant-header, .panel-heading, .compact-row { align-items: stretch; flex-direction: column; }
  .stats-grid, .overview-grid, .two-col, .quick-action-grid, .status-grid { grid-template-columns: 1fr; }
}
</style>
