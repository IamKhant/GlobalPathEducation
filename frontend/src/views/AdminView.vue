<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">Admin Workspace</p>
          <h1 class="section-heading mb-1">Manage GlobalPath Education</h1>
          <p class="section-subheading mb-0">
            Manage consultations, students, consultants, and program data.
          </p>
        </div>
        <span class="role-pill">admin</span>
      </header>

      <nav class="workspace-tabs">
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

      <div v-if="loading" class="panel loading-panel">Loading admin workspace...</div>

      <template v-else>
        <section v-if="activeTab === 'overview'">
          <div class="stats-grid">
            <article class="stat-card">
              <span>Consultations</span>
              <strong>{{ dashboard.totals?.consultations || consultations.length }}</strong>
            </article>
            <article class="stat-card">
              <span>Students</span>
              <strong>{{ dashboard.totals?.students || students.length }}</strong>
            </article>
            <article class="stat-card">
              <span>Consultants</span>
              <strong>{{ dashboard.totals?.consultants || consultants.length }}</strong>
            </article>
            <article class="stat-card accent">
              <span>Programs</span>
              <strong>{{ dashboard.totals?.programs || programs.length }}</strong>
            </article>
          </div>

          <div class="two-col">
            <article class="panel">
              <div class="panel-heading">
                <h2>Recent consultations</h2>
                <button class="text-button" type="button" @click="activeTab = 'consultations'">
                  View all
                </button>
              </div>
              <div class="compact-list">
                <div v-for="item in consultations.slice(0, 5)" :key="item.id" class="compact-row">
                  <div>
                    <strong>{{ item.fullName }}</strong>
                    <span>{{ item.program?.title || 'General inquiry' }}</span>
                  </div>
                  <small>{{ statusLabel(item.status) }}</small>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-heading">
                <h2>Management still to add later</h2>
              </div>
              <div class="todo-list">
                <span>Homepage slideshow photos</span>
                <span>Public consultant listing for program pages</span>
              </div>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'consultations'" class="panel">
          <div class="panel-heading" style="border-bottom: 1px solid #e5edf7; padding-bottom: 1rem; margin-bottom: 1rem;">
            <h2>All consultations</h2>
            <div class="position-relative" style="width: 280px;">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 0.8rem;"></i>
              <input v-model="adminConsultationSearch" type="text" class="form-control form-control-sm" placeholder="Search by student or program..." style="padding-left: 2rem; border-radius: 8px;" />
            </div>
          </div>
          <div class="table-wrap scrollable-list">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Consultant</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredAdminConsultations" :key="item.id">
                  <td>
                    <strong>{{ item.fullName }}</strong>
                    <small>{{ item.email }}</small>
                  </td>
                  <td>{{ item.program?.title || 'General inquiry' }}</td>
                  <td>
                    <div class="dropdown">
                      <button class="btn btn-sm dropdown-toggle status-badge" :class="statusClass(item.status)" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="border: none;">
                        {{ statusLabel(item.status) }}
                      </button>
                      <ul class="dropdown-menu shadow-sm" style="min-width: auto; border-radius: 8px;">
                        <li v-for="status in statuses" :key="status">
                          <button class="dropdown-item" type="button" :class="{ active: normalizeStatus(item.status) === status }" @click="updateConsultation(item.id, { status })">
                            {{ statusLabel(status) }}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                  <td>
                    <select
                      class="form-select form-select-sm"
                      :value="item.consultantId || ''"
                      @change="updateConsultation(item.id, { consultantId: $event.target.value || null })"
                    >
                      <option value="">Unassigned</option>
                      <option v-for="consultant in consultants" :key="consultant.id" :value="consultant.id">
                        {{ userName(consultant) }}
                      </option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="activeTab === 'students'">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fs-5 fw-bold mb-0">All students</h2>
            <div class="position-relative" style="width: 280px;">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 0.8rem;"></i>
              <input v-model="adminStudentSearch" type="text" class="form-control form-control-sm" placeholder="Search students by name or email..." style="padding-left: 2rem; border-radius: 8px;" />
            </div>
          </div>
          <div class="grid-list scrollable-list">
            <article v-for="student in filteredAdminStudents" :key="student.id" class="panel user-card">
            <div>
              <h2>{{ userName(student) }}</h2>
              <p>{{ student.email }}</p>
              <small>{{ student.consultations?.length || 0 }} consultations / {{ student.bookmarks?.length || 0 }} saved</small>
            </div>
            <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteStudent(student.id)">
              Delete
            </button>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'consultants'" class="consultant-admin-layout">
          <article class="panel promote-panel">
            <div class="panel-heading">
              <div>
                <h2>Create consultant profile</h2>
                <p>Promote an existing Clerk user, then assign service areas and public bio.</p>
              </div>
            </div>
            <label>
              <span>User account</span>
              <div class="promote-search-wrap">
                <i class="bi bi-search promote-search-icon"></i>
                <input
                  v-model="promoteSearch"
                  type="text"
                  class="form-control"
                  placeholder="Search by name or email..."
                  style="padding-left: 2.2rem"
                />
              </div>
              <div class="promote-user-list">
                <button
                  v-for="student in filteredStudents"
                  :key="student.id"
                  type="button"
                  :class="['promote-user-option', { selected: promoteUserId === student.id }]"
                  @click="promoteUserId = promoteUserId === student.id ? '' : student.id"
                >
                  <div class="promote-user-avatar">{{ initials(student) }}</div>
                  <div class="promote-user-info">
                    <strong>{{ userName(student) }}</strong>
                    <small>{{ student.email }}</small>
                  </div>
                  <i v-if="promoteUserId === student.id" class="bi bi-check-circle-fill text-success"></i>
                </button>
                <div v-if="filteredStudents.length === 0" class="promote-empty">
                  {{ promoteSearch ? 'No matching users' : 'No students available' }}
                </div>
              </div>
            </label>
            <button class="btn btn-gpe-primary w-100" type="button" :disabled="!promoteUserId" @click="promoteConsultant">
              Promote to consultant
            </button>
            <div class="promote-note">
              New consultants should sign up with Clerk first so email verification and login security remain handled by Clerk.
            </div>
          </article>

          <div>
            <div class="consultant-search-wrapper mb-3">
              <div class="position-relative">
                <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 1rem;"></i>
                <input
                  v-model="adminConsultantSearch"
                  type="text"
                  class="form-control"
                  placeholder="Search consultants by name or email..."
                  style="padding-left: 2.5rem; border-radius: 10px;"
                />
              </div>
            </div>

          <div class="consultant-admin-list scrollable-list">
            <article v-for="consultant in filteredAdminConsultants" :key="consultant.id" class="panel consultant-admin-card">
              <div class="consultant-admin-top">
                <div class="consultant-admin-avatar">{{ initials(consultant) }}</div>
                <div>
                  <h2>{{ userName(consultant) }}</h2>
                  <p>{{ consultant.email }}</p>
                  <div class="area-chip-row">
                    <span v-for="area in countryList(consultant)" :key="area">{{ area }}</span>
                  </div>
                </div>
              </div>

              <div class="consultant-editor-grid">
                <label>
                  <span>Countries / regions</span>
                  <div class="tag-input-wrap">
                    <div class="tag-chips">
                      <span v-for="area in countryList(consultant)" :key="area" class="tag-chip">
                        {{ area }}
                        <button type="button" @click="removeCountry(consultant, area)" class="tag-chip-x">&times;</button>
                      </span>
                    </div>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Type a country and press Enter..."
                      @keydown="handleCountryInputKeydown(consultant, $event)"
                      @blur="addCountryFromInput(consultant, $event)"
                    />
                  </div>
                  <small class="muted">Press Enter or comma to add a region.</small>
                </label>
                <label>
                  <span>Public bio</span>
                  <textarea
                    class="form-control"
                    rows="5"
                    maxlength="420"
                    :value="consultant.consultantBio || ''"
                    placeholder="Short introduction shown to students before booking."
                    @change="saveBio(consultant.id, $event.target.value)"
                  ></textarea>
                  <small class="muted">Shown on the student consultation page.</small>
                </label>
              </div>

              <div class="consultant-admin-footer">
                <span>{{ consultant.assignedConsultations?.length || 0 }} assigned consultations</span>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="confirmDemote(consultant)">
                  <i class="bi bi-arrow-down-circle me-1"></i>Make student
                </button>
              </div>
            </article>
          </div>
        </div>
        </section>

        <section v-if="activeTab === 'programs'" class="program-workspace">
          <aside class="panel">
            <div class="panel-heading">
              <h2>{{ editingProgramId ? 'Edit program' : 'Add program' }}</h2>
              <button v-if="editingProgramId" class="text-button" type="button" @click="resetProgramForm">
                New
              </button>
            </div>
            <form class="program-form" @submit.prevent="saveProgram">
              <div class="form-grid">
                <label><span>Title</span><input v-model="programForm.title" class="form-control" required /></label>
                <label><span>Institution</span><input v-model="programForm.institution" class="form-control" required /></label>
                <label><span>Country</span><input v-model="programForm.country" class="form-control" required /></label>
                <label><span>City</span><input v-model="programForm.city" class="form-control" /></label>
                <label><span>Type</span><input v-model="programForm.type" class="form-control" required /></label>
                <label><span>Duration</span><input v-model="programForm.durationMonths" class="form-control" type="number" /></label>
                <label><span>Tuition</span><input v-model="programForm.tuitionFee" class="form-control" type="number" step="0.01" /></label>
                <label><span>Currency</span><input v-model="programForm.currency" class="form-control" maxlength="3" /></label>
              </div>
              <label><span>Specialization</span><textarea v-model="programForm.specialization" class="form-control" rows="2"></textarea></label>
              <label><span>Description</span><textarea v-model="programForm.description" class="form-control" rows="3"></textarea></label>
              <label><span>Website</span><input v-model="programForm.websiteUrl" class="form-control" type="url" /></label>
              <div class="color-picker-field">
                <label>
                  <span>Card Color</span>
                  <div class="color-picker-row">
                    <input type="color" v-model="programForm.cardColor" class="color-input" />
                    <input type="text" v-model="programForm.cardColor" class="form-control form-control-sm" placeholder="#1a3a5c" maxlength="7" style="flex:1" />
                    <button v-if="programForm.cardColor" type="button" class="btn btn-sm btn-outline-secondary" @click="programForm.cardColor = ''" title="Use country default">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                  <small class="muted">Leave empty to use country-based color.</small>
                </label>
              </div>
              <button class="btn btn-gpe-primary w-100" type="submit" :disabled="programSaving">
                {{ programSaving ? 'Saving...' : editingProgramId ? 'Update program' : 'Create program' }}
              </button>
            </form>
          </aside>

          <div class="grid-list-wrapper" style="min-width: 0;">
            <div class="mb-3 position-relative">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 1rem;"></i>
              <input v-model="adminProgramSearch" type="text" class="form-control" placeholder="Search programs by title or institution..." style="padding-left: 2.5rem; border-radius: 10px;" />
            </div>
            <div class="grid-list scrollable-list">
              <article v-for="program in filteredAdminPrograms" :key="program.id" class="panel program-row">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <div v-if="program.cardColor" class="program-color-swatch" :style="{ background: program.cardColor }"></div>
                  <h2>{{ program.title }}</h2>
                </div>
                <p>{{ program.institution }} - {{ program.country }}</p>
                <small>{{ program.type }} / {{ program.durationMonths || '-' }} months</small>
              </div>
              <div class="row-actions">
                <button class="btn btn-sm btn-outline-primary" type="button" @click="editProgram(program)">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteProgram(program.id)">
                  Delete
                </button>
              </div>
            </article>
            </div>
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
const activeTab = ref('overview')
const dashboard = ref({})
const consultations = ref([])
const students = ref([])
const consultants = ref([])
const programs = ref([])
const promoteUserId = ref('')
const promoteSearch = ref('')
const adminConsultantSearch = ref('')
const adminConsultationSearch = ref('')
const adminStudentSearch = ref('')
const adminProgramSearch = ref('')
const editingProgramId = ref(null)
const programSaving = ref(false)
const statuses = ['pending', 'confirmed', 'completed', 'cancelled']

const emptyProgramForm = {
  title: '',
  institution: '',
  city: '',
  stateProvince: '',
  country: '',
  type: 'Master',
  durationMonths: '',
  tuitionFee: '',
  currency: 'AUD',
  feeBasis: 'total',
  language: 'English',
  specialization: '',
  websiteUrl: '',
  description: '',
  cardColor: '',
  notes: '',
}
const programForm = ref({ ...emptyProgramForm })

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2' },
  { key: 'consultations', label: 'Consultations', icon: 'bi bi-calendar-check' },
  { key: 'students', label: 'Students', icon: 'bi bi-people' },
  { key: 'consultants', label: 'Consultants', icon: 'bi bi-person-badge' },
  { key: 'programs', label: 'Programs', icon: 'bi bi-mortarboard' },
]

onMounted(async () => {
  await fetchAll()
  loading.value = false
})

async function fetchAll() {
  await Promise.all([
    fetchDashboard(),
    fetchConsultations(),
    fetchStudents(),
    fetchConsultants(),
    fetchPrograms(),
  ])
}

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

async function updateConsultation(id, payload) {
  const { data } = await api.patch(`/api/admin/consultations/${id}`, payload)
  consultations.value = consultations.value.map((item) => (item.id === id ? data : item))
}

async function promoteConsultant() {
  await api.patch(`/api/admin/users/${promoteUserId.value}/role`, { role: 'consultant' })
  promoteUserId.value = ''
  promoteSearch.value = ''
  await Promise.all([fetchStudents(), fetchConsultants(), fetchDashboard()])
}

function confirmDemote(consultant) {
  const name = userName(consultant)
  if (!confirm(`Demote ${name} from consultant to student?\n\nTheir ${consultant.assignedConsultations?.length || 0} assigned consultations will remain but they will lose consultant access.`)) return
  demoteConsultant(consultant.id)
}

async function demoteConsultant(id) {
  await api.patch(`/api/admin/users/${id}/role`, { role: 'student' })
  await Promise.all([fetchStudents(), fetchConsultants(), fetchDashboard()])
}

const filteredAdminConsultants = computed(() => {
  const query = adminConsultantSearch.value.trim().toLowerCase()
  if (!query) return consultants.value
  return consultants.value.filter((c) => {
    return (
      userName(c).toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      countryList(c).some((area) => area.toLowerCase().includes(query))
    )
  })
})

const filteredAdminConsultations = computed(() => {
  const query = adminConsultationSearch.value.trim().toLowerCase()
  if (!query) return consultations.value
  return consultations.value.filter((c) => {
    return (
      (c.fullName || '').toLowerCase().includes(query) ||
      (c.program?.title || '').toLowerCase().includes(query) ||
      (c.program?.institution || '').toLowerCase().includes(query)
    )
  })
})

const filteredAdminStudents = computed(() => {
  const query = adminStudentSearch.value.trim().toLowerCase()
  if (!query) return students.value
  return students.value.filter((s) => {
    const name = userName(s).toLowerCase()
    const email = (s.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

const filteredAdminPrograms = computed(() => {
  const query = adminProgramSearch.value.trim().toLowerCase()
  if (!query) return programs.value
  return programs.value.filter((p) => {
    return (
      (p.title || '').toLowerCase().includes(query) ||
      (p.institution || '').toLowerCase().includes(query) ||
      (p.country || '').toLowerCase().includes(query)
    )
  })
})

function statusClass(status) {
  return {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }[normalizeStatus(status)]
}

const filteredStudents = computed(() => {
  const q = promoteSearch.value.trim().toLowerCase()
  if (!q) return students.value.slice(0, 10)
  return students.value.filter((s) => {
    const name = userName(s).toLowerCase()
    const email = (s.email || '').toLowerCase()
    return name.includes(q) || email.includes(q)
  })
})

async function addCountryFromInput(consultant, event) {
  const input = event.target
  const rawValue = input.value || ''
  const pieces = rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!pieces.length) return

  input.value = ''

  const existing = consultant.consultantCountries?.map((c) => c.country) || []
  const nextCountries = [...existing]

  pieces.forEach((country) => {
    if (!nextCountries.some((item) => item.toLowerCase() === country.toLowerCase())) {
      nextCountries.push(country)
    }
  })

  if (nextCountries.length === existing.length) return

  const { data } = await api.patch(`/api/admin/consultants/${consultant.id}/countries`, {
    countries: nextCountries,
  })
  consultants.value = consultants.value.map((item) => (item.id === consultant.id ? data : item))
}

function handleCountryInputKeydown(consultant, event) {
  if (event.key !== 'Enter' && event.key !== ',') return
  event.preventDefault()
  addCountryFromInput(consultant, event)
}

async function removeCountry(consultant, area) {
  const existing = consultant.consultantCountries?.map((c) => c.country) || []
  const countries = existing.filter((c) => c !== area)
  const { data } = await api.patch(`/api/admin/consultants/${consultant.id}/countries`, { countries })
  consultants.value = consultants.value.map((item) => (item.id === consultant.id ? data : item))
}

async function saveBio(id, consultantBio) {
  const { data } = await api.patch(`/api/admin/consultants/${id}/profile`, { consultantBio })
  consultants.value = consultants.value.map((item) => (item.id === id ? data : item))
}

// Keep legacy names for any remaining references
const updateConsultantCountries = (id, value) => {
  const countries = value.split(',').map((c) => c.trim()).filter(Boolean)
  return api.patch(`/api/admin/consultants/${id}/countries`, { countries })
}
const updateConsultantBio = saveBio

async function deleteStudent(id) {
  if (!confirm('Delete this student from the database?')) return
  await api.delete(`/api/admin/students/${id}`)
  students.value = students.value.filter((student) => student.id !== id)
  await fetchDashboard()
}

async function saveProgram() {
  programSaving.value = true
  try {
    const payload = { ...programForm.value, currency: programForm.value.currency?.toUpperCase() }
    if (editingProgramId.value) {
      const { data } = await api.patch(`/api/admin/programs/${editingProgramId.value}`, payload)
      programs.value = programs.value.map((program) => (program.id === data.id ? data : program))
    } else {
      const { data } = await api.post('/api/admin/programs', payload)
      programs.value = [data, ...programs.value]
    }
    resetProgramForm()
    await fetchDashboard()
  } finally {
    programSaving.value = false
  }
}

function editProgram(program) {
  editingProgramId.value = program.id
  programForm.value = {
    ...emptyProgramForm,
    ...program,
    durationMonths: program.durationMonths ?? '',
    tuitionFee: program.tuitionFee ?? '',
    currency: program.currency || 'AUD',
    cardColor: program.cardColor || '',
  }
}

async function deleteProgram(id) {
  if (!confirm('Delete this program?')) return
  await api.delete(`/api/admin/programs/${id}`)
  programs.value = programs.value.filter((program) => program.id !== id)
  await fetchDashboard()
}

function resetProgramForm() {
  editingProgramId.value = null
  programForm.value = { ...emptyProgramForm }
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

function countryList(consultant) {
  const countries = consultant.consultantCountries?.map((item) => item.country).filter(Boolean) || []
  return countries.length ? countries : ['Unassigned']
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
}

function statusLabel(status) {
  return settingsStore.t(`common.status.${normalizeStatus(status)}`)
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
.compact-row,
.user-card,
.program-row {
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
  font-size: 0.86rem;
  font-weight: 850;
  gap: 0.45rem;
  justify-content: center;
  padding: 0.7rem;
}

.workspace-tab.active {
  background: #f4a41b;
  color: #0f172a;
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
.two-col,
.program-workspace {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1rem;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.program-workspace {
  grid-template-columns: 380px minmax(0, 1fr);
}

.consultant-admin-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: 340px minmax(0, 1fr);
}

.promote-panel {
  align-self: start;
  display: grid;
  gap: 0.85rem;
  position: sticky;
  top: 6rem;
}

.promote-panel p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.promote-note {
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.55;
  padding: 0.75rem;
}

.promote-search-wrap {
  position: relative;
  margin-bottom: 0.5rem;
}

.promote-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}

.promote-user-list {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  padding: 0.3rem;
}

.promote-user-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
}

.promote-user-option:hover {
  background: #f0f6ff;
}

.promote-user-option.selected {
  background: #eff6ff;
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.promote-user-avatar {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 850;
}

.promote-user-info {
  min-width: 0;
  flex: 1;
}

.promote-user-info strong {
  display: block;
  font-size: 0.84rem;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promote-user-info small {
  display: block;
  color: #94a3b8;
  font-size: 0.76rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promote-empty {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.84rem;
}

/* Tag-based country input */
.tag-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #0f4d85;
  font-size: 0.76rem;
  font-weight: 700;
}

.tag-chip-x {
  background: none;
  border: 0;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  transition: color 0.15s ease;
}

.tag-chip-x:hover {
  color: #dc2626;
}

.consultant-admin-list {
  display: grid;
  gap: 1rem;
}

.consultant-admin-card {
  display: grid;
  gap: 1rem;
}

.consultant-admin-top,
.consultant-admin-footer {
  align-items: flex-start;
  display: flex;
  gap: 0.85rem;
  justify-content: space-between;
}

.consultant-admin-top {
  border-bottom: 1px solid #eef2f7;
  justify-content: flex-start;
  padding-bottom: 0.9rem;
}

.consultant-admin-avatar {
  align-items: center;
  background: #0f172a;
  border-radius: 999px;
  color: #fff;
  display: flex;
  flex: 0 0 46px;
  font-size: 0.88rem;
  font-weight: 850;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.consultant-admin-top p {
  color: #64748b;
  margin: 0.15rem 0 0.45rem;
}

.area-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.area-chip-row span {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #0f4d85;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 0.24rem 0.5rem;
}

.consultant-editor-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
}

.consultant-admin-footer {
  align-items: center;
  border-top: 1px solid #eef2f7;
  color: #64748b;
  font-size: 0.84rem;
  padding-top: 0.85rem;
}

.stat-card span,
.muted,
.compact-row span,
.compact-row small,
.user-card p,
.user-card small,
.program-row p,
.program-row small {
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

.panel h2,
.user-card h2,
.program-row h2 {
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
.grid-list,
.program-form,
.todo-list {
  display: grid;
  gap: 0.85rem;
}

.compact-row {
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.compact-row:first-child {
  border-top: 0;
}

.table-wrap {
  overflow-x: auto;
}

.scrollable-list {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar for scrollable lists */
.scrollable-list::-webkit-scrollbar {
  width: 6px;
}
.scrollable-list::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable-list::-webkit-scrollbar-thumb {
  background-color: rgba(15, 23, 42, 0.1);
  border-radius: 10px;
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

td strong,
td small {
  display: block;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label span {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  font-weight: 850;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.color-picker-field {
  grid-column: 1 / -1;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 40px;
  height: 36px;
  padding: 2px;
  border: 1px solid #dbe5f0;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.program-color-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex: 0 0 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.row-actions {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

@media (max-width: 991.98px) {
  .admin-header,
  .panel-heading,
  .compact-row,
  .user-card,
  .program-row {
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
  .two-col,
  .program-workspace,
  .consultant-admin-layout,
  .consultant-editor-grid {
    grid-template-columns: 1fr;
  }

  .promote-panel {
    position: static;
  }

  .consultant-admin-footer,
  .consultant-admin-top {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 575.98px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
