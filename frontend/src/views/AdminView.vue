<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('admin.overview.kicker') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('admin.overview.title') }}</h1>
          <p class="section-subheading mb-0">
            {{ settingsStore.t('admin.overview.subtitle') }}
          </p>
        </div>
        <span class="role-pill">admin</span>
      </header>

      <div v-if="loading" class="panel loading-panel">{{ settingsStore.t('admin.overview.loading') }}</div>

      <template v-else>
        <div class="stats-grid">
          <article class="stat-card">
            <span>{{ settingsStore.t('admin.stats.totalConsultations') }}</span>
            <strong>{{ dashboard.totals?.consultations || consultations.length }}</strong>
            <small>{{ settingsStore.t('admin.stats.pendingReview', { count: pendingConsultationsCount }) }}</small>
          </article>
          <article class="stat-card">
            <span>{{ settingsStore.t('admin.stats.students') }}</span>
            <strong>{{ dashboard.totals?.students || students.length }}</strong>
            <small>{{ settingsStore.t('admin.stats.addedRecently', { count: recentStudents.length }) }}</small>
          </article>
          <article class="stat-card">
            <span>{{ settingsStore.t('admin.stats.consultants') }}</span>
            <strong>{{ dashboard.totals?.consultants || consultants.length }}</strong>
            <small>{{ settingsStore.t('admin.stats.unassignedRequests', { count: unassignedConsultationsCount }) }}</small>
          </article>
          <article class="stat-card accent">
            <span>{{ settingsStore.t('admin.stats.programs') }}</span>
            <strong>{{ dashboard.totals?.programs || programs.length }}</strong>
            <small>{{ settingsStore.t('admin.stats.updatedRecently', { count: recentPrograms.length }) }}</small>
          </article>
        </div>

        <div class="overview-grid">
          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('admin.overview.pipeline') }}</h2>
              <button class="text-button" type="button" @click="router.push('/admin/consultations')">
                {{ settingsStore.t('admin.overview.manageQueue') }}
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
              <h2>{{ settingsStore.t('admin.overview.quickActions') }}</h2>
            </div>
            <div class="quick-action-grid">
              <button type="button" class="quick-action-card" @click="router.push('/admin/programs')">
                <i class="bi bi-mortarboard"></i>
                <div>
                  <strong>{{ settingsStore.t('admin.action.programs') }}</strong>
                  <small>{{ settingsStore.t('admin.action.programsDesc') }}</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/admin/homepage')">
                <i class="bi bi-house-door"></i>
                <div>
                  <strong>{{ settingsStore.t('admin.action.homepage') }}</strong>
                  <small>{{ settingsStore.t('admin.action.homepageDesc') }}</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/admin/consultants')">
                <i class="bi bi-person-badge"></i>
                <div>
                  <strong>{{ settingsStore.t('admin.action.consultants') }}</strong>
                  <small>{{ settingsStore.t('admin.action.consultantsDesc') }}</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/admin/students')">
                <i class="bi bi-people"></i>
                <div>
                  <strong>{{ settingsStore.t('admin.action.students') }}</strong>
                  <small>{{ settingsStore.t('admin.action.studentsDesc') }}</small>
                </div>
              </button>
            </div>
          </article>
        </div>

        <div class="two-col">
          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('admin.overview.recentConsultations') }}</h2>
              <button class="text-button" type="button" @click="router.push('/admin/consultations')">
                {{ settingsStore.t('admin.common.viewAll') }}
              </button>
            </div>
            <div class="compact-list">
              <div v-for="item in recentConsultations" :key="item.id" class="compact-row">
                <div>
                  <strong>{{ item.fullName }}</strong>
                  <span>{{ item.program?.title || settingsStore.t('consultant.consultations.generalInquiry') }}</span>
                </div>
                <small>{{ item.consultant ? userName(item.consultant) : statusLabel(item.status) }}</small>
              </div>
              <div v-if="!recentConsultations.length" class="compact-row">
                <div>
                  <strong>{{ settingsStore.t('admin.empty.noConsultations') }}</strong>
                  <span>{{ settingsStore.t('admin.empty.noConsultationsText') }}</span>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('admin.overview.recentPrograms') }}</h2>
              <button class="text-button" type="button" @click="router.push('/admin/programs')">
                {{ settingsStore.t('admin.action.programs') }}
              </button>
            </div>
            <div class="compact-list">
              <div v-for="program in recentPrograms" :key="program.id" class="compact-row">
                <div>
                  <strong>{{ program.title }}</strong>
                  <span>{{ program.institution }} - {{ program.country }}</span>
                </div>
                <small>{{ formatDate(program.updatedAt) }}</small>
              </div>
              <div v-if="!recentPrograms.length" class="compact-row">
                <div>
                  <strong>{{ settingsStore.t('admin.empty.noProgramEdits') }}</strong>
                  <span>{{ settingsStore.t('admin.empty.noProgramEditsText') }}</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="two-col">
          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('admin.overview.newestStudents') }}</h2>
              <button class="text-button" type="button" @click="router.push('/admin/students')">
                {{ settingsStore.t('admin.common.viewStudents') }}
              </button>
            </div>
            <div class="compact-list">
              <div v-for="student in recentStudents" :key="student.id" class="compact-row">
                <div>
                  <strong>{{ userName(student) }}</strong>
                  <span>{{ student.email }}</span>
                </div>
                <small>{{ formatDate(student.createdAt) }}</small>
              </div>
              <div v-if="!recentStudents.length" class="compact-row">
                <div>
                  <strong>{{ settingsStore.t('admin.empty.noStudentSignups') }}</strong>
                  <span>{{ settingsStore.t('admin.empty.noStudentSignupsText') }}</span>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>{{ settingsStore.t('admin.overview.teamCoverage') }}</h2>
              <button class="text-button" type="button" @click="router.push('/admin/consultants')">
                {{ settingsStore.t('admin.common.openTeam') }}
              </button>
            </div>
            <div class="coverage-list">
              <div v-for="consultant in topConsultants" :key="consultant.id" class="coverage-row">
                <div class="coverage-user">
                  <div class="coverage-avatar">{{ initials(consultant) }}</div>
                  <div>
                    <strong>{{ userName(consultant) }}</strong>
                    <span>{{ countryText(consultant) || settingsStore.t('admin.empty.noRegionAssigned') }}</span>
                  </div>
                </div>
                <small>{{ settingsStore.t('admin.stats.assigned', { count: consultant.assignedConsultations?.length || 0 }) }}</small>
              </div>
              <div v-if="!topConsultants.length" class="coverage-row">
                <div class="coverage-user">
                  <div>
                    <strong>{{ settingsStore.t('admin.empty.noConsultants') }}</strong>
                    <span>{{ settingsStore.t('admin.empty.noConsultantsText') }}</span>
                  </div>
                </div>
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
const dashboard = ref({})
const consultations = ref([])
const students = ref([])
const consultants = ref([])
const programs = ref([])

const overviewStatuses = computed(() => {
  const counts = dashboard.value.statusCounts || {}
  return [
    { key: 'pending', label: settingsStore.t('common.status.pending'), count: counts.pending || 0 },
    { key: 'confirmed', label: settingsStore.t('common.status.confirmed'), count: counts.confirmed || 0 },
    { key: 'completed', label: settingsStore.t('common.status.completed'), count: counts.completed || 0 },
    { key: 'cancelled', label: settingsStore.t('common.status.cancelled'), count: counts.cancelled || 0 },
  ]
})

const recentConsultations = computed(() => consultations.value.slice(0, 5))
const recentPrograms = computed(() => dashboard.value.recentPrograms || [])
const recentStudents = computed(() => dashboard.value.recentStudents || [])
const topConsultants = computed(() => consultants.value.slice(0, 4))
const pendingConsultationsCount = computed(() => dashboard.value.statusCounts?.pending || 0)
const unassignedConsultationsCount = computed(() => consultations.value.filter((item) => !item.consultantId).length)

onMounted(async () => {
  await Promise.all([
    fetchDashboard(),
    fetchConsultations(),
    fetchStudents(),
    fetchConsultants(),
    fetchPrograms(),
  ])
  loading.value = false
})

async function fetchDashboard() {
  const { data } = await api.get('/api/admin/dashboard')
  dashboard.value = data
}

async function fetchConsultations() {
  const { data } = await api.get('/api/admin/consultations')
  consultations.value = data
}

async function fetchStudents() {
  const { data } = await api.get('/api/admin/students')
  students.value = data
}

async function fetchConsultants() {
  const { data } = await api.get('/api/admin/consultants')
  consultants.value = data
}

async function fetchPrograms() {
  const { data } = await api.get('/api/admin/programs')
  programs.value = data
}

function userName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

function initials(user) {
  return userName(user)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function countryText(consultant) {
  return consultant.consultantCountries?.map((item) => item.country).join(', ') || ''
}

function statusLabel(status) {
  const normalized = String(status || '').toLowerCase()
  return normalized ? normalized.charAt(0).toUpperCase() + normalized.slice(1) : 'Pending'
}

function formatDate(value) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
</script>

<style scoped>
.admin-page {
  background: #f8fafc;
  min-height: 70vh;
  padding: 2rem 0 3rem;
}

.admin-header,
.panel-heading,
.compact-row {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.admin-header {
  margin-bottom: 1rem;
}

.eyebrow {
  color: #f4a41b;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.role-pill {
  background: #0f172a;
  border-radius: 999px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 850;
  padding: 0.45rem 0.85rem;
}

.panel,
.stat-card {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

.loading-panel {
  text-align: center;
}

.stats-grid,
.overview-grid,
.two-col {
  display: grid;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stats-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.overview-grid {
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.stat-card span,
.stat-card small,
.compact-row span,
.compact-row small,
.coverage-user span,
.coverage-row small {
  color: #64748b;
}

.stat-card strong {
  color: #0f172a;
  display: block;
  font-size: 1.8rem;
  margin-top: 0.35rem;
}

.stat-card.accent {
  border-color: rgba(244, 164, 27, 0.45);
}

.panel h2 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 850;
  margin: 0;
}

.text-button {
  background: transparent;
  border: 0;
  color: #0a82d3;
  font-weight: 850;
}

.compact-list,
.quick-action-grid,
.coverage-list {
  display: grid;
  gap: 0.85rem;
}

.quick-action-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-action-card {
  align-items: flex-start;
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  color: #0f172a;
  display: flex;
  gap: 0.85rem;
  padding: 0.95rem;
  text-align: left;
  width: 100%;
}

.quick-action-card i {
  align-items: center;
  background: #0f172a;
  border-radius: 10px;
  color: #fff;
  display: inline-flex;
  flex: 0 0 38px;
  font-size: 1rem;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.quick-action-card strong,
.coverage-user strong,
.compact-row strong {
  color: #0f172a;
  display: block;
  font-size: 0.92rem;
  font-weight: 850;
  margin-bottom: 0.2rem;
}

.quick-action-card small {
  color: #64748b;
  display: block;
  line-height: 1.5;
}

.compact-row {
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.compact-row:first-child {
  border-top: 0;
}

.status-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.status-card,
.coverage-row {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  padding: 0.85rem 0.9rem;
}

.status-card strong {
  color: #0f172a;
  display: block;
  font-size: 1.1rem;
  font-weight: 850;
}

.status-dot {
  border-radius: 999px;
  display: inline-flex;
  flex: 0 0 12px;
  height: 12px;
  width: 12px;
}

.status-dot-pending {
  background: #f97316;
}

.status-dot-confirmed {
  background: #22c55e;
}

.status-dot-completed {
  background: #64748b;
}

.status-dot-cancelled {
  background: #ef4444;
}

.coverage-user {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  min-width: 0;
}

.coverage-avatar {
  align-items: center;
  background: #0f172a;
  border-radius: 999px;
  color: #fff;
  display: flex;
  flex: 0 0 38px;
  font-size: 0.76rem;
  font-weight: 850;
  height: 38px;
  justify-content: center;
  width: 38px;
}

@media (max-width: 991.98px) {
  .admin-header,
  .panel-heading,
  .compact-row {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-grid,
  .overview-grid,
  .two-col {
    grid-template-columns: 1fr;
  }

  .quick-action-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
