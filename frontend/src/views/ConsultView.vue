<template>
  <div class="consult-page">
    <!-- Hero banner -->
    <section class="consult-hero">
      <div class="consult-hero-blob"></div>
      <div class="container text-center" style="position: relative; z-index: 1;">
        <div class="consult-hero-icon animate-in"><i class="bi bi-calendar-check"></i></div>
        <h1 class="fw-bold mb-2 animate-in animate-in-delay-1">{{ settingsStore.t('consult.title') }}</h1>
        <p class="lead mb-0 animate-in animate-in-delay-2" style="opacity: 0.88">
          {{ settingsStore.t('consult.subtitle') }}
        </p>
      </div>
    </section>

    <div class="container consult-content">
      <div class="consult-layout">
        <aside class="consult-sidebar">
          <RouterLink to="/consultants" class="consultants-directory-link">
            <div class="directory-link-icon"><i class="bi bi-people-fill"></i></div>
            <div>
              <strong>{{ settingsStore.t('consult.meetConsultants') }}</strong>
              <span>{{ settingsStore.t('consult.browseTeam') }}</span>
            </div>
            <i class="bi bi-arrow-right directory-link-arrow"></i>
          </RouterLink>

          <div class="consult-info-panel">
            <div class="info-panel-head">
              <span class="info-kicker">{{ settingsStore.t('consult.supportKicker') }}</span>
              <h2>{{ settingsStore.t('consult.supportTitle') }}</h2>
              <p>{{ settingsStore.t('consult.supportText') }}</p>
            </div>

            <div class="support-list">
              <div class="support-item">
                <i class="bi bi-search"></i>
                <div>
                  <strong>{{ settingsStore.t('consult.support.programTitle') }}</strong>
                  <span>{{ settingsStore.t('consult.support.programText') }}</span>
                </div>
              </div>
              <div class="support-item">
                <i class="bi bi-cash-coin"></i>
                <div>
                  <strong>{{ settingsStore.t('consult.support.budgetTitle') }}</strong>
                  <span>{{ settingsStore.t('consult.support.budgetText') }}</span>
                </div>
              </div>
              <div class="support-item">
                <i class="bi bi-person-check"></i>
                <div>
                  <strong>{{ settingsStore.t('consult.support.matchTitle') }}</strong>
                  <span>{{ settingsStore.t('consult.support.matchText') }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="booking-summary-panel">
            <h3>{{ settingsStore.t('consult.summaryTitle') }}</h3>
            <div class="summary-row">
              <span>{{ settingsStore.t('consult.summaryProgram') }}</span>
              <strong>{{ selectedProgram ? selectedProgram.title : settingsStore.t('consult.summaryNotSure') }}</strong>
            </div>
            <div class="summary-row">
              <span>{{ settingsStore.t('consult.consultant') }}</span>
              <strong>{{ selectedConsultant ? consultantName(selectedConsultant) : settingsStore.t('consult.noPreference') }}</strong>
            </div>
            <div class="summary-row">
              <span>{{ settingsStore.t('consult.date') }}</span>
              <strong>{{ form.preferredDate || settingsStore.t('consult.flexible') }}</strong>
            </div>
          </div>
        </aside>

        <main>
          <div id="consultation-form" class="form-panel">
            <!-- Success state -->
            <div v-if="success" class="text-center py-4">
              <div class="fs-1 mb-3">✅</div>
              <h4 class="fw-bold mb-2">{{ settingsStore.t('consult.successTitle') }}</h4>
              <p class="text-muted mb-4">
                {{ settingsStore.t('consult.successMessage', { name: form.name, email: form.email }) }}
              </p>
              <div class="d-flex justify-content-center gap-3">
                <button class="btn btn-gpe-outline" @click="reset">{{ settingsStore.t('consult.bookAnother') }}</button>
                <RouterLink to="/dashboard" class="btn btn-gpe-primary">{{ settingsStore.t('consult.viewDashboard') }}</RouterLink>
              </div>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="submit">
              <h5 class="fw-bold mb-4" style="color: var(--gpe-primary)">{{ settingsStore.t('consult.yourDetails') }}</h5>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">{{ settingsStore.t('consult.fullName') }}</label>
                  <input type="text" class="form-control" v-model="form.name" required :placeholder="settingsStore.t('consult.namePlaceholder')" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">{{ settingsStore.t('consult.email') }}</label>
                  <input type="email" class="form-control" v-model="form.email" required :placeholder="settingsStore.t('consult.emailPlaceholder')" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">{{ settingsStore.t('consult.phone') }}</label>
                  <input type="tel" class="form-control" v-model="form.phone" placeholder="+1 234 567 8900" />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">{{ settingsStore.t('consult.date') }}</label>
                  <input type="date" class="form-control" v-model="form.preferredDate" :min="today" />
                </div>

                <!-- Program picker -->
                <div class="col-12">
                  <label class="form-label fw-semibold small">{{ settingsStore.t('consult.program') }}</label>
                  <div class="program-picker">
                    <div class="position-relative">
                      <i class="bi bi-search program-picker-icon"></i>
                      <input v-model="programSearch" type="text" class="form-control program-picker-input" :placeholder="settingsStore.t('consult.programSearch')" />
                    </div>
                    <div v-if="selectedProgram" class="selected-chip">
                      <div>
                        <span class="chip-label">{{ settingsStore.t('consult.selectedProgram') }}</span>
                        <strong>{{ selectedProgram.institution }} — {{ selectedProgram.title }}</strong>
                      </div>
                      <button type="button" class="chip-clear" @click="clearProgram"><i class="bi bi-x-lg"></i></button>
                    </div>
                    <div v-else class="picker-option-list">
                      <button type="button" class="picker-option active" @click="selectProgram('')">
                        {{ settingsStore.t('consult.notSure') }}
                      </button>
                      <button v-for="p in filteredPrograms" :key="p.id" type="button" class="picker-option" @click="selectProgram(p.id)">
                        <strong>{{ p.title }}</strong>
                        <span>{{ p.institution }} · {{ p.country }}</span>
                      </button>
                      <div v-if="filteredPrograms.length === 0" class="picker-empty">
                        {{ settingsStore.t('consult.noProgramResults') }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Consultant picker (NEW) -->
                <div class="col-12">
                  <label class="form-label fw-semibold small">{{ settingsStore.t('consult.consultant') }}</label>
                  <div v-if="selectedConsultant" class="selected-chip">
                    <div class="d-flex align-items-center gap-3">
                      <div class="chip-avatar">
                        <img v-if="selectedConsultant.profileImageUrl" :src="selectedConsultant.profileImageUrl" :alt="consultantName(selectedConsultant)" class="chip-avatar-photo" />
                        <span v-else>{{ consultantInitials(selectedConsultant) }}</span>
                      </div>
                      <div>
                        <span class="chip-label">{{ settingsStore.t('consult.selectedConsultant') }}</span>
                        <strong>{{ consultantName(selectedConsultant) }}</strong>
                        <small class="chip-meta">{{ consultantAreas(selectedConsultant) }}</small>
                      </div>
                    </div>
                    <button type="button" class="chip-clear" @click="clearConsultant"><i class="bi bi-x-lg"></i></button>
                  </div>
                  <div v-else class="consultant-picker">
                    <div class="position-relative">
                      <i class="bi bi-people consultant-picker-icon"></i>
                      <input v-model="consultantSearch" type="text" class="form-control consultant-picker-input" :placeholder="settingsStore.t('consult.consultantSearch')" />
                    </div>
                    <div v-if="consultantsLoading" class="picker-empty">{{ settingsStore.t('consult.loadingConsultants') }}</div>
                    <div v-else-if="filteredConsultants.length === 0 && consultants.length === 0" class="picker-empty">
                      {{ settingsStore.t('consult.noConsultants') }}
                    </div>
                    <div v-else class="picker-option-list consultant-option-list">
                      <button type="button" class="picker-option active" @click="selectConsultant(null)">
                        <strong>{{ settingsStore.t('consult.noPreference') }}</strong>
                        <span>{{ settingsStore.t('consult.bestAvailable') }}</span>
                      </button>
                      <button
                        v-for="c in filteredConsultants"
                        :key="c.id"
                        type="button"
                        class="picker-option consultant-option"
                        @click="selectConsultant(c)"
                      >
                        <div class="consultant-option-row">
                          <div class="consultant-option-avatar">
                            <img v-if="c.profileImageUrl" :src="c.profileImageUrl" :alt="consultantName(c)" class="consultant-option-photo" />
                            <span v-else>{{ consultantInitials(c) }}</span>
                          </div>
                          <div class="consultant-option-info">
                            <strong>{{ consultantName(c) }}</strong>
                            <span>{{ consultantAreas(c) }}</span>
                          </div>
                        </div>
                      </button>
                      <div v-if="filteredConsultants.length === 0 && consultantSearch" class="picker-empty">
                        {{ settingsStore.t('consult.noConsultantMatch', { query: consultantSearch }) }}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <label class="form-label fw-semibold small">{{ settingsStore.t('consult.message') }}</label>
                  <textarea class="form-control" rows="4" v-model="form.message" required :placeholder="settingsStore.t('consult.messagePlaceholder')"></textarea>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger mt-3 small">{{ error }}</div>

              <button type="submit" class="btn btn-gpe-primary w-100 mt-4 py-2 fw-bold" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? settingsStore.t('consult.booking') : settingsStore.t('consult.submit') }}
              </button>
              <p class="text-muted text-center mt-2 small">
                {{ settingsStore.t('consult.note') }}
              </p>
            </form>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useUser } from '@clerk/vue'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api'

const route = useRoute()
const { user } = useUser()
const settingsStore = useSettingsStore()

const programs = ref([])
const consultants = ref([])
const programSearch = ref('')
const consultantSearch = ref('')
const form = ref({
  name: '',
  email: '',
  phone: '',
  preferredDate: '',
  programId: '',
  consultantId: '',
  message: '',
})
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const consultantsLoading = ref(true)
const today = new Date().toISOString().split('T')[0]

onMounted(async () => {
  const [{ data }, consultantsResponse] = await Promise.all([
    api.get('/api/programs', { params: { limit: 100 } }),
    api.get('/api/consultants'),
  ])
  programs.value = data.data || data.programs || []
  consultants.value = consultantsResponse.data || []
  consultantsLoading.value = false
  if (route.query.programId) form.value.programId = parseInt(route.query.programId)
  if (route.query.consultantId) form.value.consultantId = parseInt(route.query.consultantId)
  if (user.value) {
    form.value.name = `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
    form.value.email = user.value.primaryEmailAddress?.emailAddress || ''
  }
})

const selectedProgram = computed(() => {
  if (!form.value.programId) return null
  return programs.value.find((program) => program.id === Number(form.value.programId)) || null
})

const selectedConsultant = computed(() => {
  if (!form.value.consultantId) return null
  return consultants.value.find((consultant) => consultant.id === Number(form.value.consultantId)) || null
})

const filteredPrograms = computed(() => {
  const query = programSearch.value.trim().toLowerCase()
  const list = query
    ? programs.value.filter((program) => {
        return [program.title, program.institution, program.country, program.city]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      })
    : programs.value
  return list.slice(0, 8)
})

const filteredConsultants = computed(() => {
  const query = consultantSearch.value.trim().toLowerCase()
  if (!query) return consultants.value
  return consultants.value.filter((c) => {
    const name = consultantName(c).toLowerCase()
    const areas = consultantAreas(c).toLowerCase()
    return name.includes(query) || areas.includes(query)
  })
})

function selectProgram(programId) {
  form.value.programId = programId
  programSearch.value = ''
}

function clearProgram() {
  form.value.programId = ''
}

function selectConsultant(consultant) {
  form.value.consultantId = consultant ? consultant.id : ''
}

function clearConsultant() {
  form.value.consultantId = ''
  consultantSearch.value = ''
}

function consultantName(consultant) {
  return [consultant.firstName, consultant.lastName].filter(Boolean).join(' ') || 'GlobalPath Consultant'
}

function consultantInitials(consultant) {
  return consultantName(consultant)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function consultantAreas(consultant) {
  return consultantAreaList(consultant).join(', ')
}

function consultantAreaList(consultant) {
  const areas = consultant.consultantCountries?.map((item) => item.country).filter(Boolean) || []
  return areas.length ? areas : ['General consultation']
}

function consultantBio(consultant) {
  return consultant.consultantBio || 'Supports students with program selection, destination planning, and consultation preparation.'
}

async function submit() {
  submitting.value = true
  error.value = ''
  try {
    await api.post('/api/consultations', {
      ...form.value,
      programId: form.value.programId || null,
      consultantId: form.value.consultantId || null,
    })
    success.value = true
  } catch (e) {
    error.value = e.response?.data?.error || settingsStore.t('consult.error')
  } finally {
    submitting.value = false
  }
}

function reset() {
  success.value = false
  form.value = {
    name: '',
    email: '',
    phone: '',
    preferredDate: '',
    programId: '',
    consultantId: '',
    message: '',
  }
}

</script>

<style scoped>
.consult-page {
  min-height: 80vh;
  background: #f8fafc;
}

/* Hero */
.consult-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1a3a5c 60%, #1e5fa0 100%);
  color: #ffffff;
  padding: 3rem 0 2.5rem;
  position: relative;
  overflow: hidden;
}

.consult-hero-blob {
  position: absolute;
  right: -100px;
  top: -100px;
  width: 350px;
  height: 350px;
  border-radius: 999px;
  background: rgba(244, 164, 27, 0.1);
  pointer-events: none;
}

.consult-hero-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  color: #ffffff;
}

.consult-content {
  padding-bottom: 3rem;
  padding-top: 3rem;
}

.consult-layout {
  align-items: start;
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(280px, 0.85fr) minmax(0, 1.65fr);
}

.consult-sidebar {
  display: grid;
  gap: 1rem;
  position: sticky;
  top: 7rem;
}

/* Form panel */
.form-panel {
  background: #ffffff;
  padding: 1.5rem;
  border-radius: 10px;
  border: 1px solid #e5edf7;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
}

@media (min-width: 768px) {
  .form-panel {
    padding: 2rem 2.5rem;
  }
}

/* Shared picker styles */
.program-picker,
.consultant-picker {
  display: grid;
  gap: 0.6rem;
}

.program-picker-icon,
.consultant-picker-icon {
  color: #94a3b8;
  font-size: 0.86rem;
  left: 0.85rem;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.program-picker-input,
.consultant-picker-input {
  padding-left: 2.25rem;
}

/* Consultants directory link */
.consultants-directory-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 12px;
  text-decoration: none;
  color: #0f172a;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.consultants-directory-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  border-color: #bfdbfe;
}

.directory-link-icon {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.consultants-directory-link strong {
  display: block;
  font-size: 0.88rem;
  font-weight: 750;
  color: #0f172a;
}

.consultants-directory-link span {
  display: block;
  font-size: 0.78rem;
  color: #64748b;
  margin-top: 0.1rem;
}

.directory-link-arrow {
  margin-left: auto;
  color: #94a3b8;
  font-size: 0.9rem;
  transition: transform 0.2s ease, color 0.2s ease;
}

.consultants-directory-link:hover .directory-link-arrow {
  transform: translateX(4px);
  color: #2563eb;
}

.consult-info-panel,
.booking-summary-panel {
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  box-shadow: 0 14px 36px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

.info-kicker {
  color: #f4a41b;
  display: block;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.info-panel-head h2,
.booking-summary-panel h3 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 850;
  margin: 0;
}

.info-panel-head p {
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.55;
  margin: 0.45rem 0 0;
}

.support-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.support-item {
  align-items: flex-start;
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  display: flex;
  gap: 0.75rem;
  padding: 0.85rem;
}

.support-item i {
  align-items: center;
  background: #0f172a;
  border-radius: 9px;
  color: #ffffff;
  display: inline-flex;
  flex: 0 0 34px;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.support-item strong,
.summary-row strong {
  color: #0f172a;
  display: block;
  font-size: 0.88rem;
  font-weight: 850;
}

.support-item span,
.summary-row span {
  color: #64748b;
  display: block;
  font-size: 0.8rem;
  line-height: 1.45;
  margin-top: 0.15rem;
}

.booking-summary-panel {
  display: grid;
  gap: 0.75rem;
}

.summary-row {
  border-top: 1px solid #eef2f7;
  padding-top: 0.75rem;
}

.summary-row:first-of-type {
  border-top: 0;
  padding-top: 0;
}

/* Selected chip (used for both program & consultant) */
.selected-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.85rem;
  background: #f0f6ff;
  border: 1px solid #bfdbfe;
  border-radius: 10px;
  animation: fadeInUp 0.25s ease both;
}

.chip-label {
  color: #64748b;
  display: block;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.1rem;
}

.selected-chip strong {
  color: #0f172a;
  display: block;
  font-size: 0.88rem;
}

.chip-meta {
  color: #64748b;
  display: block;
  font-size: 0.78rem;
  margin-top: 0.1rem;
}

.chip-avatar {
  flex: 0 0 38px;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: #1a3a5c;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 850;
  overflow: hidden;
}

.chip-avatar-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.chip-clear {
  flex: 0 0 auto;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: #ffffff;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.72rem;
  transition: background 0.15s ease, color 0.15s ease;
}

.chip-clear:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Picker option list */
.picker-option-list {
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  max-height: 240px;
  overflow-y: auto;
  padding: 0.35rem;
}

.picker-option {
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: #0f172a;
  display: block;
  padding: 0.55rem 0.7rem;
  text-align: left;
  width: 100%;
  transition: background 0.12s ease;
}

.picker-option:hover,
.picker-option.active {
  background: #eff6ff;
}

.picker-option strong,
.picker-option span {
  display: block;
}

.picker-option strong {
  font-size: 0.86rem;
}

.picker-option span {
  color: #64748b;
  font-size: 0.78rem;
  margin-top: 0.1rem;
}

.picker-empty {
  color: #94a3b8;
  font-size: 0.84rem;
  padding: 0.8rem;
  text-align: center;
}

/* Consultant-specific option styling */
.consultant-option {
  padding: 0.6rem 0.7rem;
}

.consultant-option-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.consultant-option-avatar {
  flex: 0 0 34px;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 850;
  overflow: hidden;
}

.consultant-option-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consultant-option-info {
  min-width: 0;
}

.consultant-option-info strong {
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.consultant-option-info span {
  margin-top: 0;
}

@media (max-width: 767.98px) {
  .selected-chip {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 991.98px) {
  .consult-layout {
    grid-template-columns: 1fr;
  }

  .consult-sidebar {
    position: static;
  }
}
</style>
