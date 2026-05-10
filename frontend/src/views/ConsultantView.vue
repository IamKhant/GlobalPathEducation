<template>
  <div class="consultant-page">
    <div class="container">
      <header class="consultant-header">
        <div>
          <p class="eyebrow mb-2">Consultant Workspace</p>
          <h1 class="section-heading mb-1">Manage student consultations</h1>
          <p class="section-subheading mb-0">
            Review assigned requests, inspect student profiles, and keep consultation status up to date.
          </p>
        </div>
        <div class="role-pill">{{ role || 'consultant' }}</div>
      </header>

      <nav class="workspace-tabs" aria-label="Consultant workspace sections">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="workspace-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <div v-if="loading" class="loading-panel">Loading consultant workspace...</div>

      <template v-else>
        <section v-if="activeTab === 'overview'" class="workspace-section">
          <div class="stats-grid">
            <article class="stat-card">
              <span>Total requests</span>
              <strong>{{ dashboard.totals?.consultations || consultations.length }}</strong>
            </article>
            <article class="stat-card accent">
              <span>Pending requests</span>
              <strong>{{ statusCount('pending') }}</strong>
            </article>
            <article class="stat-card">
              <span>Students</span>
              <strong>{{ dashboard.totals?.students || students.length }}</strong>
            </article>
            <article class="stat-card">
              <span>Assigned areas</span>
              <strong>{{ dashboard.totals?.assignedCountries || 0 }}</strong>
            </article>
          </div>

          <div class="overview-grid">
            <article class="panel">
              <div class="panel-heading">
                <h2>Recent consultations</h2>
                <button type="button" class="text-button" @click="activeTab = 'consultations'">
                  View all
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
                    <span>{{ consultation.program?.title || 'General inquiry' }}</span>
                  </div>
                  <span class="status-badge" :class="statusClass(consultation.status)">
                    {{ statusLabel(consultation.status) }}
                  </span>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-heading">
                <h2>Recent students</h2>
                <button type="button" class="text-button" @click="activeTab = 'students'">
                  View all
                </button>
              </div>
              <div class="compact-list">
                <div v-for="student in recentStudents" :key="student.id" class="compact-row">
                  <div>
                    <strong>{{ studentName(student) }}</strong>
                    <span>{{ student.email }}</span>
                  </div>
                  <small>{{ student.preferredDestination || 'No destination yet' }}</small>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'consultations'" class="workspace-section">
          <div class="toolbar">
            <div class="status-tabs">
              <button
                v-for="tab in statusTabs"
                :key="tab.value"
                type="button"
                class="status-tab"
                :class="{ active: activeStatus === tab.value }"
                @click="activeStatus = tab.value"
              >
                {{ tab.label }}
                <span>{{ statusCount(tab.value) }}</span>
              </button>
            </div>
          </div>

          <div v-if="filteredConsultations.length === 0" class="empty-state">
            <h5>No consultation requests</h5>
            <p class="text-muted mb-0">There are no requests for this status yet.</p>
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
                  <span>Program</span>
                  <strong>{{ consultation.program?.title || 'General inquiry' }}</strong>
                  <small v-if="consultation.program">
                    {{ consultation.program.institution }} - {{ consultation.program.country }}
                  </small>
                </div>

                <p v-if="consultation.message" class="consultation-message">
                  {{ consultation.message }}
                </p>

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
                <h3>Student Profile</h3>
                <dl>
                  <div>
                    <dt>Nationality</dt>
                    <dd>{{ consultation.user?.nationality || '-' }}</dd>
                  </div>
                  <div>
                    <dt>Current Level</dt>
                    <dd>{{ profileValue(consultation.user?.currentEducationLevel) }}</dd>
                  </div>
                  <div>
                    <dt>Preferred Level</dt>
                    <dd>{{ profileValue(consultation.user?.preferredStudyLevel) }}</dd>
                  </div>
                  <div>
                    <dt>Destination</dt>
                    <dd>
                      {{ consultation.user?.preferredDestination || consultation.preferredCountry || '-' }}
                    </dd>
                  </div>
                  <div>
                    <dt>Requested</dt>
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
              <h2>Student profiles</h2>
              <p>Review profile details, bookmarks, and consultation history.</p>
            </div>
            <input
              v-model="studentSearch"
              class="form-control search-input"
              type="search"
              placeholder="Search students"
            />
          </div>

          <div class="student-grid">
            <article v-for="student in filteredStudents" :key="student.id" class="student-card">
              <div class="student-card-top">
                <div>
                  <h3>{{ studentName(student) }}</h3>
                  <p>{{ student.email }}</p>
                </div>
                <span>{{ student.consultations?.length || 0 }} requests</span>
              </div>
              <dl class="profile-list">
                <div>
                  <dt>Nationality</dt>
                  <dd>{{ student.nationality || '-' }}</dd>
                </div>
                <div>
                  <dt>Current education</dt>
                  <dd>{{ profileValue(student.currentEducationLevel) }}</dd>
                </div>
                <div>
                  <dt>Preferred level</dt>
                  <dd>{{ profileValue(student.preferredStudyLevel) }}</dd>
                </div>
                <div>
                  <dt>Destination</dt>
                  <dd>{{ student.preferredDestination || '-' }}</dd>
                </div>
              </dl>
              <div class="student-footer">
                <span>{{ student.bookmarks?.length || 0 }} saved programs</span>
                <small>Joined {{ formatDate(student.createdAt) }}</small>
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
const studentSearch = ref('')

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2' },
  { key: 'consultations', label: 'Consultations', icon: 'bi bi-calendar-check' },
  { key: 'students', label: 'Students', icon: 'bi bi-people' },
]
const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]
const actionStatuses = ['pending', 'confirmed', 'completed', 'cancelled']

const recentConsultations = computed(() => consultations.value.slice(0, 5))
const recentStudents = computed(() => students.value.slice(0, 5))

const filteredConsultations = computed(() => {
  if (activeStatus.value === 'all') return consultations.value
  return consultations.value.filter(
    (consultation) => normalizeStatus(consultation.status) === activeStatus.value,
  )
})

const filteredStudents = computed(() => {
  const query = studentSearch.value.trim().toLowerCase()
  if (!query) return students.value
  return students.value.filter((student) =>
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

function statusButtonClass(status) {
  return {
    pending: 'btn-outline-warning',
    confirmed: 'btn-outline-success',
    completed: 'btn-outline-secondary',
    cancelled: 'btn-outline-danger',
  }[status]
}

function profileValue(value) {
  if (!value) return '-'
  return value.startsWith('profile.') ? settingsStore.t(value) : value
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
.program-form-panel,
.program-list-panel,
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
.compact-row span,
.compact-row small,
.toolbar p,
.student-card p,
.student-footer,
.program-admin-row p,
.program-admin-row small {
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
.program-workspace {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.panel,
.program-form-panel,
.program-list-panel {
  padding: 1rem;
}

.panel-heading,
.toolbar,
.consultation-top,
.student-card-top,
.program-admin-row {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.panel-heading h2,
.toolbar h2,
.student-profile h3,
.student-card h3,
.program-admin-row h3 {
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
.program-admin-list,
.program-form {
  display: grid;
  gap: 0.85rem;
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

.student-footer {
  border-top: 1px solid #eef2f7;
  display: flex;
  font-size: 0.8rem;
  justify-content: space-between;
  margin-top: 0.85rem;
  padding-top: 0.85rem;
}

.program-workspace {
  grid-template-columns: 400px minmax(0, 1fr);
}

.form-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.program-admin-row {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  padding: 0.85rem;
}

.program-admin-row h3 {
  margin-bottom: 0.2rem;
}

.program-row-actions {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  text-align: right;
}

@media (max-width: 991.98px) {
  .consultant-header,
  .toolbar,
  .consultation-top,
  .student-card-top,
  .program-admin-row {
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
  .student-grid,
  .program-workspace {
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

@media (max-width: 575.98px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
