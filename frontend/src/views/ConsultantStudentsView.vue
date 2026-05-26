<template>
  <div class="consultant-page">
    <div class="container">
      <header class="consultant-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('consultant.kicker') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('consultant.students.title') }}</h1>
          <p class="section-subheading mb-0">{{ settingsStore.t('consultant.students.subtitle') }}</p>
        </div>
        <RouterLink to="/consultant" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>{{ settingsStore.t('consultant.tab.overview') }}
        </RouterLink>
      </header>

      <section class="panel">
        <div class="toolbar">
          <div class="filter-tabs">
            <button
              v-for="tab in studentFilterTabs"
              :key="tab.value"
              type="button"
              class="filter-tab"
              :class="{ active: studentFilter === tab.value }"
              @click="studentFilter = tab.value"
            >
              {{ settingsStore.t(tab.labelKey) }}
              <span>{{ studentFilterCount(tab.value) }}</span>
            </button>
          </div>
          <input
            v-model="studentSearch"
            class="form-control search-input"
            type="search"
            :placeholder="settingsStore.t('consultant.students.searchPlaceholder')"
          />
        </div>

        <div v-if="loading" class="loading-panel">{{ settingsStore.t('consultant.loading') }}</div>

        <div v-else class="student-grid">
          <article v-for="student in filteredStudents" :key="student.id" class="student-card">
            <div class="student-card-top">
              <div>
                <h3>{{ studentName(student) }}</h3>
                <p>{{ student.email }}</p>
              </div>
              <span>{{ settingsStore.t('consultant.students.requests', { count: student.consultations?.length || 0 }) }}</span>
            </div>
            <dl class="profile-list">
              <div><dt>{{ settingsStore.t('consultant.students.nationality') }}</dt><dd>{{ student.nationality || '-' }}</dd></div>
              <div><dt>{{ settingsStore.t('consultant.students.currentEducation') }}</dt><dd>{{ profileValue(student.currentEducationLevel) }}</dd></div>
              <div><dt>{{ settingsStore.t('consultant.students.preferredLevel') }}</dt><dd>{{ profileValue(student.preferredStudyLevel) }}</dd></div>
              <div><dt>{{ settingsStore.t('consultant.students.destination') }}</dt><dd>{{ student.preferredDestination || '-' }}</dd></div>
              <div><dt>{{ settingsStore.t('profile.budget') }}</dt><dd>{{ formatBudget(student) }}</dd></div>
            </dl>
            <div class="student-card-tags">
              <span v-if="student.preferredDestination">{{ student.preferredDestination }}</span>
              <span v-if="student.preferredStudyLevel">{{ profileValue(student.preferredStudyLevel) }}</span>
              <span v-if="student.currentEducationLevel">{{ profileValue(student.currentEducationLevel) }}</span>
              <span v-if="student.maxBudget">{{ formatBudget(student) }}</span>
            </div>
            <div class="student-footer">
              <span>{{ settingsStore.t('consultant.students.savedPrograms', { count: student.bookmarks?.length || 0 }) }}</span>
              <small>{{ settingsStore.t('consultant.students.joined', { date: formatDate(student.createdAt) }) }}</small>
            </div>
          </article>
        </div>

        <div v-if="!loading && filteredStudents.length === 0" class="empty-state">
          No students match your filters.
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
const studentSearch = ref('')
const studentFilter = ref('all')
const studentFilterTabs = [
  { value: 'all', labelKey: 'consultant.filter.all' },
  { value: 'profile-ready', labelKey: 'consultant.overview.profileReady' },
  { value: 'needs-followup', labelKey: 'consultant.overview.needsFollowupShort' },
  { value: 'bookmarked', labelKey: 'consultant.overview.bookmarked' },
]

const filteredStudents = computed(() => {
  let list = students.value
  if (studentFilter.value === 'profile-ready') list = list.filter((student) => hasProfileContext(student))
  else if (studentFilter.value === 'needs-followup') list = list.filter((student) => !hasProfileContext(student))
  else if (studentFilter.value === 'bookmarked') list = list.filter((student) => (student.bookmarks?.length || 0) > 0)

  const query = studentSearch.value.trim().toLowerCase()
  if (!query) return list
  return list.filter((student) =>
    [
      studentName(student),
      student.email,
      student.nationality,
      student.preferredDestination,
      student.maxBudget,
      student.budgetCurrency,
      student.currentEducationLevel,
      student.preferredStudyLevel,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

onMounted(async () => {
  const { data } = await api.get('/api/consultant/students')
  students.value = data
  loading.value = false
})

function studentName(student) {
  return [student.firstName, student.lastName].filter(Boolean).join(' ') || student.email
}

function profileValue(value) {
  if (!value) return '-'
  return value.startsWith('profile.') ? settingsStore.t(value) : value
}

function hasProfileContext(student) {
  return Boolean(
    student.preferredDestination ||
      student.preferredStudyLevel ||
      student.currentEducationLevel ||
      student.maxBudget,
  )
}

function studentFilterCount(filter) {
  if (filter === 'all') return students.value.length
  if (filter === 'profile-ready') return students.value.filter((student) => hasProfileContext(student)).length
  if (filter === 'needs-followup') return students.value.filter((student) => !hasProfileContext(student)).length
  if (filter === 'bookmarked') return students.value.filter((student) => (student.bookmarks?.length || 0) > 0).length
  return 0
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatBudget(student) {
  if (!student?.maxBudget) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: student.budgetCurrency || 'AUD',
    maximumFractionDigits: 0,
  }).format(Number(student.maxBudget))
}
</script>

<style scoped>
.consultant-page { background: #f8fafc; min-height: 70vh; padding: 2rem 0 3rem; }
.consultant-header, .toolbar, .student-card-top { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.consultant-header { margin-bottom: 1rem; }
.eyebrow { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.panel, .student-card, .loading-panel, .empty-state { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); }
.panel { padding: 1rem; }
.loading-panel, .empty-state { padding: 2.5rem 1rem; text-align: center; }
.toolbar { margin-bottom: 1rem; }
.search-input { max-width: 300px; }
.filter-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.filter-tab { align-items: center; background: #fff; border: 1px solid #dbe3ef; border-radius: 999px; color: #334155; display: inline-flex; font-size: 0.85rem; font-weight: 850; gap: 0.45rem; padding: 0.45rem 0.75rem; }
.filter-tab span { background: #f1f5f9; border-radius: 999px; color: #64748b; min-width: 1.45rem; padding: 0.1rem 0.35rem; text-align: center; }
.filter-tab.active { background: #f4a41b; border-color: #f4a41b; color: #0f172a; }
.filter-tab.active span { background: rgba(255,255,255,0.65); color: #0f172a; }
.student-grid { display: grid; gap: 0.85rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.student-card { padding: 1rem; }
.student-card-top { border-bottom: 1px solid #eef2f7; margin-bottom: 0.85rem; padding-bottom: 0.85rem; }
.student-card h3 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0; }
.student-card p, .student-footer { color: #64748b; }
.student-card-top span { background: #f1f5f9; border-radius: 999px; color: #475569; font-size: 0.75rem; font-weight: 850; padding: 0.35rem 0.6rem; }
.profile-list { display: grid; gap: 0.65rem; margin: 0; }
.profile-list dt { color: #64748b; display: block; font-size: 0.72rem; font-weight: 850; margin-bottom: 0.25rem; text-transform: uppercase; }
.profile-list dd { color: #0f172a; font-size: 0.88rem; font-weight: 700; margin: 0; }
.student-card-tags { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.85rem; }
.student-card-tags span { background: #eff6ff; border: 1px solid #dbeafe; border-radius: 999px; color: #0f4d85; font-size: 0.74rem; font-weight: 800; padding: 0.24rem 0.5rem; }
.student-footer { border-top: 1px solid #eef2f7; display: flex; font-size: 0.8rem; justify-content: space-between; margin-top: 0.85rem; padding-top: 0.85rem; }
@media (max-width: 991.98px) {
  .consultant-header, .toolbar, .student-card-top { align-items: stretch; flex-direction: column; }
  .search-input { max-width: none; }
  .student-grid { grid-template-columns: 1fr; }
}
</style>
