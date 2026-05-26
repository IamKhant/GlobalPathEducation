<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">Admin Overview</p>
          <h1 class="section-heading mb-1">GlobalPath control center</h1>
          <p class="section-subheading mb-0">
            A quick snapshot of platform activity, with direct links to each admin workspace.
          </p>
        </div>
        <span class="role-pill">admin</span>
      </header>

      <div v-if="loading" class="panel loading-panel">Loading admin overview...</div>

      <template v-else>
        <div class="stats-grid">
          <article class="stat-card">
            <span>Total consultations</span>
            <strong>{{ dashboard.totals?.consultations || consultations.length }}</strong>
            <small>{{ pendingConsultationsCount }} pending review</small>
          </article>
          <article class="stat-card">
            <span>Students</span>
            <strong>{{ dashboard.totals?.students || students.length }}</strong>
            <small>{{ recentStudents.length }} added recently</small>
          </article>
          <article class="stat-card">
            <span>Consultants</span>
            <strong>{{ dashboard.totals?.consultants || consultants.length }}</strong>
            <small>{{ unassignedConsultationsCount }} requests still unassigned</small>
          </article>
          <article class="stat-card accent">
            <span>Programs</span>
            <strong>{{ dashboard.totals?.programs || programs.length }}</strong>
            <small>{{ recentPrograms.length }} updated recently</small>
          </article>
        </div>

        <div class="overview-grid">
          <article class="panel">
            <div class="panel-heading">
              <h2>Consultation pipeline</h2>
              <button class="text-button" type="button" @click="router.push('/admin/consultations')">
                Manage queue
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
              <h2>Quick actions</h2>
            </div>
            <div class="quick-action-grid">
              <button type="button" class="quick-action-card" @click="router.push('/admin/programs')">
                <i class="bi bi-mortarboard"></i>
                <div>
                  <strong>Manage programs</strong>
                  <small>Create, edit, target, and promote programs to matched students.</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/admin/homepage')">
                <i class="bi bi-house-door"></i>
                <div>
                  <strong>Edit homepage</strong>
                  <small>Update hero copy, public sections, and translated text.</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/admin/consultants')">
                <i class="bi bi-person-badge"></i>
                <div>
                  <strong>Manage consultants</strong>
                  <small>Assign service regions, update bios, and change roles.</small>
                </div>
              </button>
              <button type="button" class="quick-action-card" @click="router.push('/admin/students')">
                <i class="bi bi-people"></i>
                <div>
                  <strong>Review students</strong>
                  <small>Check profiles, budgets, saved programs, and account activity.</small>
                </div>
              </button>
            </div>
          </article>
        </div>

        <div class="two-col">
          <article class="panel">
            <div class="panel-heading">
              <h2>Recent consultations</h2>
              <button class="text-button" type="button" @click="router.push('/admin/consultations')">
                View all
              </button>
            </div>
            <div class="compact-list">
              <div v-for="item in recentConsultations" :key="item.id" class="compact-row">
                <div>
                  <strong>{{ item.fullName }}</strong>
                  <span>{{ item.program?.title || 'General inquiry' }}</span>
                </div>
                <small>{{ item.consultant ? userName(item.consultant) : statusLabel(item.status) }}</small>
              </div>
              <div v-if="!recentConsultations.length" class="compact-row">
                <div>
                  <strong>No consultation requests yet</strong>
                  <span>New student bookings will appear here.</span>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>Recent program updates</h2>
              <button class="text-button" type="button" @click="router.push('/admin/programs')">
                Manage programs
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
                  <strong>No recent program edits</strong>
                  <span>Program updates will appear here.</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div class="two-col">
          <article class="panel">
            <div class="panel-heading">
              <h2>Newest students</h2>
              <button class="text-button" type="button" @click="router.push('/admin/students')">
                View students
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
                  <strong>No recent student signups</strong>
                  <span>New student accounts will appear here.</span>
                </div>
              </div>
            </div>
          </article>

          <article class="panel">
            <div class="panel-heading">
              <h2>Team coverage</h2>
              <button class="text-button" type="button" @click="router.push('/admin/consultants')">
                Open team
              </button>
            </div>
            <div class="coverage-list">
              <div v-for="consultant in topConsultants" :key="consultant.id" class="coverage-row">
                <div class="coverage-user">
                  <div class="coverage-avatar">{{ initials(consultant) }}</div>
                  <div>
                    <strong>{{ userName(consultant) }}</strong>
                    <span>{{ countryText(consultant) || 'No region assigned yet' }}</span>
                  </div>
                </div>
                <small>{{ consultant.assignedConsultations?.length || 0 }} assigned</small>
              </div>
              <div v-if="!topConsultants.length" class="coverage-row">
                <div class="coverage-user">
                  <div>
                    <strong>No consultants yet</strong>
                    <span>Promote a staff member to start handling consultations.</span>
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

const router = useRouter()
const loading = ref(true)
const dashboard = ref({})
const consultations = ref([])
const students = ref([])
const consultants = ref([])
const programs = ref([])

const overviewStatuses = computed(() => {
  const counts = dashboard.value.statusCounts || {}
  return [
    { key: 'pending', label: 'Pending', count: counts.pending || 0 },
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed || 0 },
    { key: 'completed', label: 'Completed', count: counts.completed || 0 },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled || 0 },
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
