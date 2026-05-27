<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('admin.workspace') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('adminStudents.title') }}</h1>
          <p class="section-subheading mb-0">{{ settingsStore.t('adminStudents.subtitle') }}</p>
        </div>
        <RouterLink to="/admin" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>{{ settingsStore.t('admin.common.overview') }}
        </RouterLink>
      </header>

      <div class="toolbar">
        <div class="search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="search" type="text" class="form-control" :placeholder="settingsStore.t('adminStudents.searchPlaceholder')" />
        </div>
        <span class="count-pill">{{ settingsStore.t('adminStudents.count', { count: filteredStudents.length }) }}</span>
      </div>

      <div v-if="loading" class="panel loading-panel">{{ settingsStore.t('adminStudents.loading') }}</div>
      <div v-else class="grid-list">
        <article v-for="student in filteredStudents" :key="student.id" class="panel user-card">
          <div>
            <h2>{{ userName(student) }}</h2>
            <p>{{ student.email }}</p>
            <small>{{ settingsStore.t('adminStudents.activity', { consultations: student.consultations?.length || 0, saved: student.bookmarks?.length || 0 }) }}</small>
            <small v-if="student.preferredDestination" class="d-block mt-1">
              {{ settingsStore.t('adminStudents.goal') }}: {{ student.preferredDestination }} / {{ studentLevelLabel(student.preferredStudyLevel) }}
            </small>
            <small v-if="student.maxBudget" class="d-block mt-1">{{ settingsStore.t('profile.budget') }}: {{ formatBudget(student) }}</small>
          </div>
          <div class="row-actions">
            <button class="btn btn-sm btn-outline-primary" type="button" @click="changeUserRole(student, 'consultant')">{{ settingsStore.t('adminUsers.makeConsultant') }}</button>
            <button class="btn btn-sm btn-outline-dark" type="button" @click="changeUserRole(student, 'admin')">{{ settingsStore.t('adminUsers.makeAdmin') }}</button>
            <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteStudent(student.id)">{{ settingsStore.t('common.delete') }}</button>
          </div>
        </article>
        <div v-if="filteredStudents.length === 0" class="panel empty-state">{{ settingsStore.t('adminStudents.empty') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api'

const settingsStore = useSettingsStore()
const loading = ref(true)
const students = ref([])
const search = ref('')

const filteredStudents = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return students.value
  return students.value.filter((student) => {
    const name = userName(student).toLowerCase()
    const email = (student.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

onMounted(async () => {
  await fetchStudents()
  loading.value = false
})

async function fetchStudents() {
  const { data } = await api.get('/api/admin/students')
  students.value = data
}

async function changeUserRole(user, role) {
  const name = userName(user)
  const roleLabel = role === 'admin' ? 'admin' : 'consultant'
  if (!confirm(settingsStore.t('adminUsers.confirmRole', { name, role: roleLabel }))) return

  await api.patch(`/api/admin/users/${user.id}/role`, { role })
  await fetchStudents()
}

async function deleteStudent(id) {
  if (!confirm(settingsStore.t('adminStudents.confirmDelete'))) return
  await api.delete(`/api/admin/students/${id}`)
  students.value = students.value.filter((student) => student.id !== id)
}

function userName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

function studentLevelLabel(levelKey) {
  return levelKey ? settingsStore.t(levelKey) : settingsStore.t('adminPrograms.promotion.noLevel')
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
.admin-page { background: #f8fafc; min-height: 70vh; padding: 2rem 0 3rem; }
.admin-header, .toolbar, .user-card { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.admin-header, .toolbar { margin-bottom: 1rem; }
.eyebrow { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.section-heading { color: #0f172a; font-weight: 850; }
.section-subheading, .user-card p, .user-card small, .empty-state { color: #64748b; }
.panel { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); padding: 1rem; }
.grid-list { display: grid; gap: 0.85rem; }
.user-card h2 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0; }
.user-card p { margin: 0.25rem 0; }
.row-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: flex-end; }
.search-wrap { max-width: 360px; position: relative; width: 100%; }
.search-wrap i { color: #94a3b8; left: 1rem; position: absolute; top: 50%; transform: translateY(-50%); }
.search-wrap input { border-radius: 10px; padding-left: 2.5rem; }
.count-pill { background: #fff; border: 1px solid #e5edf7; border-radius: 999px; color: #64748b; font-size: 0.82rem; font-weight: 800; padding: 0.55rem 0.8rem; }
.loading-panel, .empty-state { text-align: center; }
@media (max-width: 767.98px) { .admin-header, .toolbar, .user-card { align-items: stretch; flex-direction: column; } }
</style>
