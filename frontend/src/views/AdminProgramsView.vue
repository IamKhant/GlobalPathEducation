<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('adminPrograms.kicker') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('adminPrograms.title') }}</h1>
          <p class="section-subheading mb-0">
            {{ settingsStore.t('adminPrograms.subtitle') }}
          </p>
        </div>
        <RouterLink to="/admin" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>{{ settingsStore.t('admin.common.overview') }}
        </RouterLink>
      </header>

      <div v-if="loading" class="panel loading-panel">{{ settingsStore.t('adminPrograms.loading') }}</div>

      <section v-else class="program-workspace">
        <aside class="panel program-editor-panel">
          <div class="panel-heading">
            <div>
              <h2>{{ editingProgramId ? settingsStore.t('adminPrograms.editProgram') : settingsStore.t('adminPrograms.addProgram') }}</h2>
              <p class="panel-note">{{ settingsStore.t('adminPrograms.panelNote') }}</p>
            </div>
            <button v-if="editingProgramId" class="text-button" type="button" @click="resetProgramForm">
              {{ settingsStore.t('adminPrograms.new') }}
            </button>
          </div>

          <form class="program-form" @submit.prevent="saveProgram">
            <div class="form-grid">
              <label><span>{{ settingsStore.t('adminPrograms.field.title') }}</span><input v-model="programForm.title" class="form-control" required /></label>
              <label><span>{{ settingsStore.t('adminPrograms.field.institution') }}</span><input v-model="programForm.institution" class="form-control" required /></label>
              <label><span>{{ settingsStore.t('adminPrograms.field.country') }}</span><input v-model="programForm.country" class="form-control" required /></label>
              <label><span>{{ settingsStore.t('adminPrograms.field.city') }}</span><input v-model="programForm.city" class="form-control" /></label>
              <label>
                <span>{{ settingsStore.t('adminPrograms.field.type') }}</span>
                <select v-model="programForm.type" class="form-select" required>
                  <option v-for="type in programTypes" :key="type" :value="type">{{ type }}</option>
                </select>
              </label>
              <label><span>{{ settingsStore.t('adminPrograms.field.duration') }}</span><input v-model="programForm.durationMonths" class="form-control" type="number" /></label>
              <label><span>{{ settingsStore.t('adminPrograms.field.tuition') }}</span><input v-model="programForm.tuitionFee" class="form-control" type="number" step="0.01" /></label>
              <label><span>{{ settingsStore.t('adminPrograms.field.currency') }}</span><input v-model="programForm.currency" class="form-control" maxlength="3" /></label>
            </div>

            <label>
              <span>{{ settingsStore.t('adminPrograms.field.specialization') }}</span>
              <textarea v-model="programForm.specialization" class="form-control" rows="2"></textarea>
            </label>
            <label>
              <span>{{ settingsStore.t('adminPrograms.field.description') }}</span>
              <textarea v-model="programForm.description" class="form-control" rows="3"></textarea>
            </label>
            <label><span>{{ settingsStore.t('adminPrograms.field.website') }}</span><input v-model="programForm.websiteUrl" class="form-control" type="url" /></label>

            <div class="color-picker-field">
              <label>
                <span>{{ settingsStore.t('adminPrograms.field.cardColor') }}</span>
                <div class="color-picker-row">
                  <input type="color" v-model="programForm.cardColor" class="color-input" />
                  <input type="text" v-model="programForm.cardColor" class="form-control form-control-sm" placeholder="#1a3a5c" maxlength="7" />
                  <button v-if="programForm.cardColor" type="button" class="btn btn-sm btn-outline-secondary" @click="programForm.cardColor = ''" :title="settingsStore.t('adminPrograms.useCountryDefault')">
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
                <small class="muted">{{ settingsStore.t('adminPrograms.cardColorNote') }}</small>
              </label>
            </div>

            <button class="btn btn-gpe-primary w-100" type="submit" :disabled="programSaving">
              {{ programSaving ? settingsStore.t('common.saving') : editingProgramId ? settingsStore.t('adminPrograms.updateProgram') : settingsStore.t('adminPrograms.createProgram') }}
            </button>
          </form>

        </aside>

        <div class="program-list-panel">
          <div class="program-list-toolbar">
            <div class="position-relative flex-grow-1">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 1rem;"></i>
              <input v-model="adminProgramSearch" type="text" class="form-control" :placeholder="settingsStore.t('adminPrograms.searchPlaceholder')" style="padding-left: 2.5rem; border-radius: 10px;" />
            </div>
            <span class="program-count">{{ settingsStore.t('adminPrograms.programCount', { count: filteredAdminPrograms.length }) }}</span>
          </div>

          <div class="grid-list scrollable-list">
            <article v-for="program in filteredAdminPrograms" :key="program.id" class="panel program-row">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <div v-if="program.cardColor" class="program-color-swatch" :style="{ background: program.cardColor }"></div>
                  <h2>{{ program.title }}</h2>
                </div>
                <p>{{ program.institution }} - {{ program.country }}</p>
                <small>{{ program.type }} / {{ program.durationMonths || '-' }} {{ settingsStore.t('programCard.monthShort') }}</small>
              </div>
              <div class="row-actions">
                <button class="btn btn-sm btn-outline-primary" type="button" @click="editProgram(program)">{{ settingsStore.t('common.edit') }}</button>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteProgram(program.id)">{{ settingsStore.t('common.delete') }}</button>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section v-if="promotionProgram" class="program-promotion-panel">
        <div class="promotion-panel-head">
          <div>
            <span class="promotion-kicker">{{ settingsStore.t('adminPrograms.promotion.kicker') }}</span>
            <h3>{{ settingsStore.t('adminPrograms.promotion.title') }}</h3>
            <p>{{ settingsStore.t('adminPrograms.promotion.subtitle') }} <strong>{{ promotionProgram.title }}</strong></p>
          </div>
          <button type="button" class="text-button" @click="clearPromotionSuggestions">{{ settingsStore.t('common.clear') }}</button>
        </div>

        <div v-if="promotionMatches.length" class="promotion-match-list">
          <div v-if="promotionAutoSummary" class="promotion-auto-summary">
            <i class="bi bi-lightning-charge-fill"></i>
            <span>
              {{ settingsStore.t('adminPrograms.promotion.autoSummary', {
                sent: promotionAutoSummary.sent,
                skipped: promotionAutoSummary.skipped,
                failed: promotionAutoSummary.failed,
                threshold: promotionAutoSummary.threshold,
              }) }}
            </span>
          </div>
          <article v-for="match in promotionMatches" :key="match.student.id" class="promotion-match-card">
            <div class="promotion-match-top">
              <div class="promotion-avatar">{{ initials(match.student) }}</div>
              <div>
                <strong>{{ userName(match.student) }}</strong>
                <small>{{ match.student.email }}</small>
              </div>
              <span class="promotion-score">{{ match.score }}%</span>
            </div>
            <div class="promotion-reasons">
              <span v-for="reason in match.reasons" :key="reason">{{ reason }}</span>
            </div>
            <div class="promotion-student-meta">
              <span>{{ match.student.preferredDestination || settingsStore.t('adminPrograms.promotion.noDestination') }}</span>
              <span>{{ studentLevelLabel(match.student.preferredStudyLevel) }}</span>
              <span>{{ formatBudget(match.student) }}</span>
            </div>
            <button
              class="btn btn-sm w-100"
              :class="isPromotionSent(match.student) ? 'btn-success' : 'btn-outline-primary'"
              type="button"
              :disabled="isPromotionSending(match.student) || isPromotionSent(match.student)"
              @click="sendPromotionEmail(match)"
            >
              <span v-if="isPromotionSending(match.student)" class="spinner-border spinner-border-sm me-1"></span>
              <i v-else class="bi bi-envelope me-1"></i>
              {{ promotionButtonLabel(match.student) }}
            </button>
          </article>
        </div>

        <div v-else class="promotion-empty">
          {{ settingsStore.t('adminPrograms.promotion.empty') }}
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const loading = ref(true)
const students = ref([])
const programs = ref([])
const adminProgramSearch = ref('')
const editingProgramId = ref(null)
const programSaving = ref(false)
const promotionProgram = ref(null)
const promotionMatches = ref([])
const promotionAutoSummary = ref(null)
const promotionSendingKeys = ref([])
const promotionSentKeys = ref([])
const programTypes = ['Bachelor', 'Diploma', 'Master', 'Bootcamp']

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

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchPrograms()])
  loading.value = false
})

async function fetchStudents() {
  const { data } = await api.get('/api/admin/students')
  students.value = data
}

async function fetchPrograms() {
  const { data } = await api.get('/api/admin/programs')
  programs.value = data
}

async function saveProgram() {
  programSaving.value = true
  try {
    const payload = { ...programForm.value, currency: programForm.value.currency?.toUpperCase() }
    let savedProgram = null

    if (editingProgramId.value) {
      const { data } = await api.patch(`/api/admin/programs/${editingProgramId.value}`, payload)
      programs.value = programs.value.map((program) => (program.id === data.id ? data : program))
      savedProgram = data
    } else {
      const { data } = await api.post('/api/admin/programs', payload)
      programs.value = [data, ...programs.value]
      savedProgram = data
    }

    resetProgramForm()
    showPromotionSuggestions(savedProgram)
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
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deleteProgram(id) {
  if (!confirm(settingsStore.t('adminPrograms.confirmDelete'))) return
  await api.delete(`/api/admin/programs/${id}`)
  programs.value = programs.value.filter((program) => program.id !== id)
}

function resetProgramForm() {
  editingProgramId.value = null
  programForm.value = { ...emptyProgramForm }
}

function clearPromotionSuggestions() {
  promotionProgram.value = null
  promotionMatches.value = []
  promotionAutoSummary.value = null
  promotionSendingKeys.value = []
  promotionSentKeys.value = []
}

function showPromotionSuggestions(program) {
  promotionProgram.value = program
  promotionAutoSummary.value = program.autoPromotions || null
  promotionSendingKeys.value = []
  promotionMatches.value = students.value
    .map((student) => scoreStudentForProgram(student, program))
    .filter((match) => match.score >= 50)
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, 8)
  promotionSentKeys.value = [
    ...new Set([
      ...(program.autoPromotions?.sentStudentIds || []),
      ...(program.autoPromotions?.skippedStudentIds || []),
    ].map((studentId) => `${program.id}:${studentId}`)),
  ]
}

function promotionKey(student, program = promotionProgram.value) {
  return `${program?.id || 'program'}:${student.id}`
}

function isPromotionSending(student) {
  return promotionSendingKeys.value.includes(promotionKey(student))
}

function isPromotionSent(student) {
  return promotionSentKeys.value.includes(promotionKey(student))
}

function promotionButtonLabel(student) {
  if (isPromotionSending(student)) return settingsStore.t('adminPrograms.promotion.sending')
  if (isPromotionSent(student)) return settingsStore.t('adminPrograms.promotion.sent')
  return settingsStore.t('adminPrograms.promotion.sendEmail')
}

async function sendPromotionEmail(match) {
  if (!promotionProgram.value) return

  const key = promotionKey(match.student)
  promotionSendingKeys.value = [...promotionSendingKeys.value, key]

  try {
    await api.post('/api/admin/program-promotions/send', {
      programId: promotionProgram.value.id,
      studentId: match.student.id,
      matchScore: match.score,
      matchReasons: match.reasons,
    })

    promotionSentKeys.value = [...promotionSentKeys.value, key]
  } catch (error) {
    console.error(error)
    alert(error.response?.data?.message || settingsStore.t('adminPrograms.promotion.sendFailed'))
  } finally {
    promotionSendingKeys.value = promotionSendingKeys.value.filter((item) => item !== key)
  }
}

function scoreStudentForProgram(student, program) {
  const reasons = []
  let rawScore = 25

  if (sameText(student.preferredDestination, program.country)) {
    rawScore += 30
    reasons.push(settingsStore.t('dashboard.recommendations.reasonDestination'))
  }

  const preferredType = studyLevelToProgramType(student.preferredStudyLevel)
  if (preferredType && sameText(preferredType, program.type)) {
    rawScore += 28
    reasons.push(settingsStore.t('dashboard.recommendations.reasonLevel'))
  }

  const budgetScore = programBudgetScore(student, program)
  if (budgetScore === 'within') {
    rawScore += 24
    reasons.push(settingsStore.t('dashboard.recommendations.reasonBudget'))
  } else if (budgetScore === 'near') {
    rawScore += 12
    reasons.push(settingsStore.t('dashboard.recommendations.reasonNearBudget'))
  }

  if (reasons.length === 0 && hasCompletePromotionProfile(student)) {
    reasons.push(settingsStore.t('adminPrograms.promotion.profileComplete'))
  }

  return {
    student,
    rawScore,
    score: Math.min(99, Math.max(40, rawScore)),
    reasons: reasons.slice(0, 3),
  }
}

function programBudgetScore(student, program) {
  const budget = Number(student.maxBudget)
  const tuition = Number(program.tuitionFee)

  if (!budget || !tuition || !student.budgetCurrency || !program.currency) return null
  if (!sameText(student.budgetCurrency, program.currency)) return null

  if (tuition <= budget) return 'within'
  if (tuition <= budget * 1.15) return 'near'
  return 'over'
}

function hasCompletePromotionProfile(student) {
  return Boolean(
    student.preferredDestination &&
      student.preferredStudyLevel &&
      student.maxBudget &&
      student.budgetCurrency,
  )
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

function studentLevelLabel(levelKey) {
  return levelKey ? settingsStore.t(levelKey) : settingsStore.t('adminPrograms.promotion.noLevel')
}

function normalizeText(value) {
  return String(value || '').trim().toLowerCase()
}

function sameText(a, b) {
  return normalizeText(a) === normalizeText(b)
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

function formatBudget(user) {
  if (!user?.maxBudget) return '-'

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: user.budgetCurrency || 'AUD',
    maximumFractionDigits: 0,
  }).format(Number(user.maxBudget))
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

.section-heading {
  color: #0f172a;
  font-weight: 850;
}

.section-subheading,
.panel-note,
.muted,
.program-row p,
.program-row small {
  color: #64748b;
}

.panel {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

.loading-panel {
  text-align: center;
}

.program-workspace {
  display: grid;
  gap: 1rem;
  grid-template-columns: 400px minmax(0, 1fr);
}

.program-editor-panel {
  align-self: start;
  position: sticky;
  top: 6rem;
}

.program-form,
.grid-list {
  display: grid;
  gap: 0.85rem;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.program-form label {
  display: grid;
  gap: 0.35rem;
}

.program-form label > span {
  color: #334155;
  font-size: 0.78rem;
  font-weight: 850;
}

.color-picker-row {
  align-items: center;
  display: flex;
  gap: 0.5rem;
}

.color-input {
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  height: 34px;
  padding: 2px;
  width: 48px;
}

.program-list-toolbar {
  align-items: center;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.program-count {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 999px;
  color: #64748b;
  flex: 0 0 auto;
  font-size: 0.82rem;
  font-weight: 800;
  padding: 0.45rem 0.75rem;
}

.scrollable-list {
  max-height: 900px;
  overflow-y: auto;
  padding-right: 0.2rem;
}

.program-row h2 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 850;
  margin: 0;
}

.program-row p {
  margin: 0.25rem 0;
}

.program-color-swatch {
  border: 2px solid #ffffff;
  border-radius: 999px;
  box-shadow: 0 0 0 1px #dbe3ef;
  flex: 0 0 16px;
  height: 16px;
  width: 16px;
}

.row-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: flex-end;
}

.text-button {
  background: transparent;
  border: 0;
  color: #0a82d3;
  font-weight: 850;
}

.program-promotion-panel {
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  border-radius: 12px;
  margin-top: 1rem;
  padding: 0.95rem;
}

.promotion-match-list {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.promotion-panel-head {
  align-items: flex-start;
  border-bottom: 1px solid #e5edf7;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  margin-bottom: 0.85rem;
  padding-bottom: 0.85rem;
}

.promotion-kicker {
  color: #f4a41b;
  display: block;
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
}

.promotion-panel-head h3 {
  color: #0f172a;
  font-size: 0.98rem;
  font-weight: 850;
  margin: 0;
}

.promotion-panel-head p {
  color: #64748b;
  font-size: 0.82rem;
  margin: 0.25rem 0 0;
}

.promotion-match-card {
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  padding: 0.85rem;
}

.promotion-auto-summary {
  align-items: flex-start;
  background: #fff7ed;
  border: 1px solid #fed7aa;
  border-radius: 10px;
  color: #9a3412;
  display: flex;
  font-size: 0.82rem;
  font-weight: 800;
  gap: 0.55rem;
  line-height: 1.45;
  padding: 0.75rem 0.85rem;
  grid-column: 1 / -1;
}

.promotion-auto-summary i {
  color: #f97316;
  flex: 0 0 auto;
}

.promotion-match-top {
  align-items: center;
  display: grid;
  gap: 0.65rem;
  grid-template-columns: auto minmax(0, 1fr) auto;
}

.promotion-avatar {
  align-items: center;
  background: #0f172a;
  border-radius: 10px;
  color: #ffffff;
  display: inline-flex;
  font-size: 0.78rem;
  font-weight: 850;
  height: 34px;
  justify-content: center;
  width: 34px;
}

.promotion-match-top strong,
.promotion-match-top small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.promotion-match-top strong {
  color: #0f172a;
  font-size: 0.86rem;
}

.promotion-match-top small {
  color: #64748b;
  font-size: 0.75rem;
}

.promotion-score {
  background: #ecfdf5;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  color: #15803d;
  font-size: 0.74rem;
  font-weight: 850;
  padding: 0.25rem 0.45rem;
}

.promotion-reasons,
.promotion-student-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.7rem;
}

.promotion-reasons span {
  background: #eff6ff;
  border-radius: 999px;
  color: #2563eb;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 0.25rem 0.48rem;
}

.promotion-student-meta span {
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 750;
}

.promotion-empty {
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.45;
}

@media (max-width: 991.98px) {
  .admin-header,
  .panel-heading,
  .program-row,
  .program-list-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .program-workspace {
    grid-template-columns: 1fr;
  }

  .program-editor-panel {
    position: static;
  }

  .promotion-match-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 575.98px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .promotion-match-list {
    grid-template-columns: 1fr;
  }
}
</style>
