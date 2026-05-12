<template>
  <div class="consultant-page">
    <div class="container">
      <header class="consultant-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('consultant.kicker') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('consultant.title') }}</h1>
          <p class="section-subheading mb-0">
            {{ settingsStore.t('consultant.subtitle') }}
          </p>
        </div>
        <div class="role-pill">{{ role || 'consultant' }}</div>
      </header>

      <nav class="workspace-tabs" :aria-label="settingsStore.t('consultant.kicker')">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="workspace-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon"></i>
          <span>{{ settingsStore.t(tab.labelKey) }}</span>
        </button>
      </nav>

      <div v-if="loading" class="loading-panel">{{ settingsStore.t('consultant.loading') }}</div>

      <template v-else>
        <section v-if="activeTab === 'overview'" class="workspace-section">
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
                <button type="button" class="text-button" @click="activeTab = 'consultations'">
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
                <button type="button" class="quick-action-card" @click="activeTab = 'consultations'">
                  <i class="bi bi-calendar-check"></i>
                  <div>
                    <strong>{{ settingsStore.t('consultant.overview.reviewRequests') }}</strong>
                    <small>{{ settingsStore.t('consultant.overview.reviewRequestsDesc') }}</small>
                  </div>
                </button>
                <button type="button" class="quick-action-card" @click="activeTab = 'students'">
                  <i class="bi bi-people"></i>
                  <div>
                    <strong>{{ settingsStore.t('consultant.overview.openProfiles') }}</strong>
                    <small>{{ settingsStore.t('consultant.overview.openProfilesDesc') }}</small>
                  </div>
                </button>
                <button type="button" class="quick-action-card" @click="activeTab = 'overview'">
                  <i class="bi bi-geo-alt"></i>
                  <div>
                    <strong>{{ settingsStore.t('consultant.overview.checkCoverage') }}</strong>
                    <small>{{ assignedAreasText }}</small>
                  </div>
                </button>
                <button type="button" class="quick-action-card" @click="activeStatus = 'pending'; activeTab = 'consultations'">
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
                <button type="button" class="text-button" @click="activeTab = 'consultations'">
                  {{ settingsStore.t('consultant.overview.viewAll') }}
                </button>
              </div>
              <div class="compact-list">
                <div
                  v-for="consultation in recentConsultations"
                  :key="consultation.id"
                  class="compact-row"
                >
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
                <button type="button" class="text-button" @click="activeTab = 'students'">
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
        </section>

        <section v-if="activeTab === 'consultations'" class="workspace-section">
          <div class="toolbar">
            <div>
              <h2>{{ settingsStore.t('consultant.consultations.title') }}</h2>
              <p>{{ settingsStore.t('consultant.consultations.subtitle') }}</p>
            </div>
            <input
              v-model="consultationSearch"
              class="form-control search-input"
              type="search"
              :placeholder="settingsStore.t('consultant.consultations.searchPlaceholder')"
            />
          </div>

          <div class="toolbar toolbar-secondary">
            <div class="status-tabs">
              <button
                v-for="tab in statusTabs"
                :key="tab.value"
                type="button"
                class="status-tab"
                :class="{ active: activeStatus === tab.value }"
                @click="activeStatus = tab.value"
              >
                {{ settingsStore.t(tab.labelKey) }}
                <span>{{ statusCount(tab.value) }}</span>
              </button>
            </div>
          </div>

          <div v-if="filteredConsultations.length === 0" class="empty-state">
            <h5>{{ settingsStore.t('consultant.consultations.emptyTitle') }}</h5>
            <p class="text-muted mb-0">{{ settingsStore.t('consultant.consultations.emptySubtitle') }}</p>
          </div>

          <div v-else class="consultation-list">
            <article
              v-for="consultation in filteredConsultations"
              :key="consultation.id"
              class="consultation-card"
            >
              <div class="consultation-main">
                <div class="consultation-top">
                  <div>
                    <h2>{{ consultation.fullName }}</h2>
                    <div class="consultation-contact">
                      <span><i class="bi bi-envelope"></i>{{ consultation.email }}</span>
                      <span v-if="consultation.phone">
                        <i class="bi bi-telephone"></i>{{ consultation.phone }}
                      </span>
                    </div>
                  </div>
                  <span class="status-badge" :class="statusClass(consultation.status)">
                    {{ statusLabel(consultation.status) }}
                  </span>
                </div>

                <div class="consultation-program">
                  <span>{{ settingsStore.t('consultant.consultations.program') }}</span>
                  <strong>{{ consultation.program?.title || settingsStore.t('consultant.consultations.generalInquiry') }}</strong>
                  <small v-if="consultation.program">
                    {{ consultation.program.institution }} - {{ consultation.program.country }}
                  </small>
                </div>

                <p v-if="consultation.message" class="consultation-message">
                  {{ consultation.message }}
                </p>

                <div class="consultation-meta-row">
                  <span><i class="bi bi-geo-alt"></i>{{ consultation.user?.preferredDestination || consultation.preferredCountry || settingsStore.t('consultant.overview.noDestination') }}</span>
                  <span><i class="bi bi-calendar-event"></i>{{ formatDate(consultation.createdAt) }}</span>
                </div>

                <div class="status-actions">
                  <div class="dropdown">
                    <button class="btn btn-sm dropdown-toggle status-badge" :class="statusClass(consultation.status)" type="button" data-bs-toggle="dropdown" aria-expanded="false" :disabled="updatingId === consultation.id" style="border: none;">
                      <span v-if="updatingId === consultation.id" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      {{ statusLabel(consultation.status) }}
                    </button>
                    <ul class="dropdown-menu shadow-sm" style="min-width: auto; border-radius: 8px;">
                      <li v-for="status in actionStatuses" :key="status">
                        <button class="dropdown-item" type="button" :class="{ active: normalizeStatus(consultation.status) === status }" @click="updateStatus(consultation.id, status)">
                          {{ statusLabel(status) }}
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <aside class="student-profile">
                <h3>{{ settingsStore.t('consultant.consultations.studentProfile') }}</h3>
                <dl>
                  <div>
                    <dt>{{ settingsStore.t('consultant.students.nationality') }}</dt>
                    <dd>{{ consultation.user?.nationality || '-' }}</dd>
                  </div>
                  <div>
                    <dt>{{ settingsStore.t('consultant.students.currentEducation') }}</dt>
                    <dd>{{ profileValue(consultation.user?.currentEducationLevel) }}</dd>
                  </div>
                  <div>
                    <dt>{{ settingsStore.t('consultant.students.preferredLevel') }}</dt>
                    <dd>{{ profileValue(consultation.user?.preferredStudyLevel) }}</dd>
                  </div>
                  <div>
                    <dt>{{ settingsStore.t('consultant.students.destination') }}</dt>
                    <dd>
                      {{ consultation.user?.preferredDestination || consultation.preferredCountry || '-' }}
                    </dd>
                  </div>
                  <div>
                    <dt>{{ settingsStore.t('consultant.consultations.requested') }}</dt>
                    <dd>{{ formatDate(consultation.createdAt) }}</dd>
                  </div>
                </dl>
              </aside>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'students'" class="workspace-section">
          <div class="toolbar">
            <div>
              <h2>{{ settingsStore.t('consultant.students.title') }}</h2>
              <p>{{ settingsStore.t('consultant.students.subtitle') }}</p>
            </div>
            <input
              v-model="studentSearch"
              class="form-control search-input"
              type="search"
              :placeholder="settingsStore.t('consultant.students.searchPlaceholder')"
            />
          </div>
          <div class="toolbar toolbar-secondary">
            <div class="status-tabs">
              <button
                v-for="tab in studentFilterTabs"
                :key="tab.value"
                type="button"
                class="status-tab"
                :class="{ active: studentFilter === tab.value }"
                @click="studentFilter = tab.value"
              >
                {{ settingsStore.t(tab.labelKey) }}
                <span>{{ studentFilterCount(tab.value) }}</span>
              </button>
            </div>
          </div>

          <div class="student-grid">
            <article v-for="student in filteredStudents" :key="student.id" class="student-card">
              <div class="student-card-top">
                <div>
                  <h3>{{ studentName(student) }}</h3>
                  <p>{{ student.email }}</p>
                </div>
                <span>{{ settingsStore.t('consultant.students.requests', { count: student.consultations?.length || 0 }) }}</span>
              </div>
              <dl class="profile-list">
                <div>
                  <dt>{{ settingsStore.t('consultant.students.nationality') }}</dt>
                  <dd>{{ student.nationality || '-' }}</dd>
                </div>
                <div>
                  <dt>{{ settingsStore.t('consultant.students.currentEducation') }}</dt>
                  <dd>{{ profileValue(student.currentEducationLevel) }}</dd>
                </div>
                <div>
                  <dt>{{ settingsStore.t('consultant.students.preferredLevel') }}</dt>
                  <dd>{{ profileValue(student.preferredStudyLevel) }}</dd>
                </div>
                <div>
                  <dt>{{ settingsStore.t('consultant.students.destination') }}</dt>
                  <dd>{{ student.preferredDestination || '-' }}</dd>
                </div>
              </dl>
              <div class="student-card-tags">
                <span v-if="student.preferredDestination">{{ student.preferredDestination }}</span>
                <span v-if="student.preferredStudyLevel">{{ profileValue(student.preferredStudyLevel) }}</span>
                <span v-if="student.currentEducationLevel">{{ profileValue(student.currentEducationLevel) }}</span>
              </div>
              <div class="student-footer">
                <span>{{ settingsStore.t('consultant.students.savedPrograms', { count: student.bookmarks?.length || 0 }) }}</span>
                <small>{{ settingsStore.t('consultant.students.joined', { date: formatDate(student.createdAt) }) }}</small>
              </div>
            </article>
          </div>
        </section>

      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const loading = ref(true)
const updatingId = ref(null)
const role = ref('')
const dashboard = ref({})
const consultations = ref([])
const students = ref([])
const activeTab = ref('overview')
const activeStatus = ref('all')
const consultationSearch = ref('')
const studentSearch = ref('')
const studentFilter = ref('all')

const tabs = [
  { key: 'overview', labelKey: 'consultant.tab.overview', icon: 'bi bi-grid-1x2' },
  { key: 'consultations', labelKey: 'consultant.tab.consultations', icon: 'bi bi-calendar-check' },
  { key: 'students', labelKey: 'consultant.tab.students', icon: 'bi bi-people' },
]
const statusTabs = [
  { value: 'all', labelKey: 'consultant.filter.all' },
  { value: 'pending', labelKey: 'consultant.filter.pending' },
  { value: 'confirmed', labelKey: 'consultant.filter.confirmed' },
  { value: 'completed', labelKey: 'consultant.filter.completed' },
  { value: 'cancelled', labelKey: 'consultant.filter.cancelled' },
]
const actionStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
const studentFilterTabs = [
  { value: 'all', labelKey: 'consultant.filter.all' },
  { value: 'profile-ready', labelKey: 'consultant.overview.profileReady' },
  { value: 'needs-followup', labelKey: 'consultant.overview.needsFollowupShort' },
  { value: 'bookmarked', labelKey: 'consultant.overview.bookmarked' },
]

const recentConsultations = computed(() => consultations.value.slice(0, 5))
const recentStudents = computed(() => students.value.slice(0, 5))
const pendingCount = computed(() => statusCount('pending'))
const confirmedCount = computed(() => statusCount('confirmed'))
const assignedAreasText = computed(() => {
  const countries = dashboard.value.countries || []
  if (!countries.length) return settingsStore.t('consultant.filter.noRegionsAssigned')
  return countries.length > 2 ? `${countries.slice(0, 2).join(', ')} +${countries.length - 2} more` : countries.join(', ')
})
const studentProfilesReady = computed(() => {
  return students.value.filter((student) => {
    return Boolean(
      student.preferredDestination ||
        student.preferredStudyLevel ||
        student.currentEducationLevel,
    )
  }).length
})
const overviewStatuses = computed(() => {
  return [
    { key: 'pending', label: settingsStore.t('consultant.filter.pending'), count: pendingCount.value },
    { key: 'confirmed', label: settingsStore.t('consultant.filter.confirmed'), count: confirmedCount.value },
    { key: 'completed', label: settingsStore.t('consultant.filter.completed'), count: statusCount('completed') },
    { key: 'cancelled', label: settingsStore.t('consultant.filter.cancelled'), count: statusCount('cancelled') },
  ]
})

const filteredConsultations = computed(() => {
  let list = consultations.value

  if (activeStatus.value !== 'all') {
    list = list.filter(
      (consultation) => normalizeStatus(consultation.status) === activeStatus.value,
    )
  }

  const query = consultationSearch.value.trim().toLowerCase()
  if (!query) return list

  return list.filter((consultation) =>
    [
      consultation.fullName,
      consultation.email,
      consultation.program?.title,
      consultation.program?.institution,
      consultation.user?.preferredDestination,
      consultation.preferredCountry,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const filteredStudents = computed(() => {
  let list = students.value

  if (studentFilter.value === 'profile-ready') {
    list = list.filter((student) => hasProfileContext(student))
  } else if (studentFilter.value === 'needs-followup') {
    list = list.filter((student) => !hasProfileContext(student))
  } else if (studentFilter.value === 'bookmarked') {
    list = list.filter((student) => (student.bookmarks?.length || 0) > 0)
  }

  const query = studentSearch.value.trim().toLowerCase()
  if (!query) return list
  return list.filter((student) =>
    [
      studentName(student),
      student.email,
      student.nationality,
      student.preferredDestination,
      student.currentEducationLevel,
      student.preferredStudyLevel,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

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
  if (status === 'all') return consultations.value.length
  return consultations.value.filter(
    (consultation) => normalizeStatus(consultation.status) === status,
  ).length
}

async function updateStatus(id, status) {
  updatingId.value = id

  try {
    const { data } = await api.patch(`/api/consultant/consultations/${id}/status`, { status })
    consultations.value = consultations.value.map((consultation) =>
      consultation.id === id ? data : consultation,
    )
    await fetchDashboard()
  } finally {
    updatingId.value = null
  }
}

function studentName(student) {
  return [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email
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

function profileValue(value) {
  if (!value) return '-'
  return value.startsWith('profile.') ? settingsStore.t(value) : value
}

function hasProfileContext(student) {
  return Boolean(
    student.preferredDestination ||
      student.preferredStudyLevel ||
      student.currentEducationLevel,
  )
}

function studentFilterCount(filter) {
  if (filter === 'all') return students.value.length
  if (filter === 'profile-ready') return students.value.filter((student) => hasProfileContext(student)).length
  if (filter === 'needs-followup') return students.value.filter((student) => !hasProfileContext(student)).length
  if (filter === 'bookmarked') return students.value.filter((student) => (student.bookmarks?.length || 0) > 0).length
  return 0
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
</script>

<style scoped>
.consultant-page {
  background: #f8fafc;
  min-height: 70vh;
  padding: 2rem 0 3rem;
}

.consultant-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
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
  text-transform: capitalize;
}

.workspace-tabs {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  display: flex;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 0.35rem;
}

.workspace-tab {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: #475569;
  display: inline-flex;
  flex: 1;
  font-size: 0.88rem;
  font-weight: 850;
  gap: 0.45rem;
  justify-content: center;
  padding: 0.7rem 0.8rem;
}

.workspace-tab.active {
  background: #f4a41b;
  color: #0f172a;
}

.loading-panel,
.panel,
.empty-state,
.consultation-card,
.student-card,
.stat-card {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.loading-panel,
.empty-state {
  padding: 2.5rem 1rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1rem;
}

.stat-card {
  padding: 1rem;
}

.stat-card span,
.stat-card small,
.compact-row span,
.compact-row small,
.toolbar p,
.student-card p,
.student-footer {
  color: #64748b;
}

.stat-card strong {
  color: #0f172a;
  display: block;
  font-size: 1.8rem;
  line-height: 1.1;
  margin-top: 0.35rem;
}

.stat-card.accent {
  border-color: rgba(244, 164, 27, 0.45);
}

.overview-grid,
.two-col {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.panel {
  padding: 1rem;
}

.panel-heading,
.toolbar,
.consultation-top,
.student-card-top {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.panel-heading h2,
.toolbar h2,
.student-profile h3,
.student-card h3 {
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
.consultation-list,
.student-grid,
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

.quick-action-card strong {
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
  align-items: center;
  border-top: 1px solid #eef2f7;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  padding-top: 0.85rem;
}

.compact-row:first-child {
  border-top: 0;
}

.compact-row strong,
.compact-row span {
  display: block;
}

.toolbar {
  margin-bottom: 1rem;
}

.toolbar-secondary {
  margin-top: -0.35rem;
}

.search-input {
  max-width: 280px;
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
  font-size: 0.85rem;
  font-weight: 850;
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

.status-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.status-card {
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem 0.9rem;
}

.status-card strong {
  color: #0f172a;
  display: block;
  font-size: 1.1rem;
  font-weight: 850;
}

.status-card small {
  color: #64748b;
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

.consultation-card {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(0, 1fr) 280px;
  padding: 1.25rem;
}

.consultation-top h2 {
  color: #0f172a;
  font-size: 1.05rem;
  font-weight: 850;
  margin: 0 0 0.35rem;
}

.consultation-contact {
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  font-size: 0.84rem;
  gap: 0.8rem;
}

.consultation-contact i {
  margin-right: 0.35rem;
}

.status-badge {
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 850;
  padding: 0.35rem 0.65rem;
  white-space: nowrap;
}

.status-pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-confirmed {
  background: #ecfdf3;
  color: #15803d;
}

.status-completed {
  background: #f1f5f9;
  color: #475569;
}

.status-cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

.consultation-program {
  background: #f8fafc;
  border-radius: 8px;
  margin-top: 1rem;
  padding: 0.75rem;
}

.consultation-program span,
.student-profile dt,
.profile-list dt,
.program-form span {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  font-weight: 850;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.consultation-program strong,
.consultation-program small {
  display: block;
}

.consultation-program strong {
  color: #0f172a;
}

.consultation-message {
  color: #475569;
  font-size: 0.9rem;
  line-height: 1.65;
  margin: 1rem 0 0;
}

.consultation-meta-row {
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.84rem;
  margin-top: 0.9rem;
}

.consultation-meta-row i {
  margin-right: 0.35rem;
}

.status-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.student-profile {
  border-left: 1px solid #eef2f7;
  padding-left: 1.25rem;
}

.student-profile dl,
.profile-list {
  display: grid;
  gap: 0.65rem;
  margin: 0;
}

.student-profile dd,
.profile-list dd {
  color: #0f172a;
  font-size: 0.88rem;
  font-weight: 700;
  margin: 0;
}

.student-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.student-card {
  padding: 1rem;
}

.student-card-top {
  border-bottom: 1px solid #eef2f7;
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
}

.student-card-top span {
  background: #f1f5f9;
  border-radius: 999px;
  color: #475569;
  font-size: 0.75rem;
  font-weight: 850;
  padding: 0.35rem 0.6rem;
}

.student-card-tags,
.area-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.student-card-tags {
  margin-top: 0.85rem;
}

.student-card-tags span,
.area-chip-row span {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #0f4d85;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 0.24rem 0.5rem;
}

.area-chip-row .area-chip-muted {
  background: #f8fafc;
  border-color: #e5edf7;
  color: #64748b;
}

.student-footer {
  border-top: 1px solid #eef2f7;
  display: flex;
  font-size: 0.8rem;
  justify-content: space-between;
  margin-top: 0.85rem;
  padding-top: 0.85rem;
}

@media (max-width: 991.98px) {
  .consultant-header,
  .toolbar,
  .consultation-top,
  .student-card-top {
    align-items: stretch;
    flex-direction: column;
  }

  .workspace-tabs {
    overflow-x: auto;
  }

  .workspace-tab {
    flex: 0 0 auto;
  }

  .stats-grid,
  .overview-grid,
  .two-col,
  .student-grid,
  .quick-action-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }

  .consultation-card {
    grid-template-columns: 1fr;
  }

  .student-profile {
    border-left: 0;
    border-top: 1px solid #eef2f7;
    padding-left: 0;
    padding-top: 1rem;
  }

  .search-input {
    max-width: none;
  }
}
</style>
