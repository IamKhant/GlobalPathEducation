<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('admin.workspace') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('adminAdmins.title') }}</h1>
          <p class="section-subheading mb-0">{{ settingsStore.t('adminAdmins.subtitle') }}</p>
        </div>
        <RouterLink to="/admin" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>{{ settingsStore.t('admin.common.overview') }}
        </RouterLink>
      </header>

      <div class="toolbar">
        <div class="search-wrap">
          <i class="bi bi-search"></i>
          <input v-model="search" type="text" class="form-control" :placeholder="settingsStore.t('adminAdmins.searchPlaceholder')" />
        </div>
        <span class="count-pill">{{ settingsStore.t('adminAdmins.count', { count: filteredAdmins.length }) }}</span>
      </div>

      <div v-if="loading" class="panel loading-panel">{{ settingsStore.t('adminAdmins.loading') }}</div>
      <div v-else class="grid-list">
        <article v-for="admin in filteredAdmins" :key="admin.id" class="panel user-card">
          <div>
            <div class="staff-head">
              <span class="role-badge">admin</span>
              <span v-if="admin.id === currentAdminId" class="self-badge">{{ settingsStore.t('adminAdmins.currentSession') }}</span>
            </div>
            <h2>{{ userName(admin) }}</h2>
            <p>{{ admin.email }}</p>
            <small>{{ settingsStore.t('adminAdmins.activity', { consultations: admin.consultations?.length || 0, assigned: admin.assignedConsultations?.length || 0 }) }}</small>
          </div>
          <div class="row-actions">
            <button class="btn btn-sm btn-outline-primary" type="button" :disabled="admin.id === currentAdminId" @click="changeUserRole(admin, 'consultant')">{{ settingsStore.t('adminUsers.makeConsultant') }}</button>
            <button class="btn btn-sm btn-outline-secondary" type="button" :disabled="admin.id === currentAdminId" @click="changeUserRole(admin, 'student')">{{ settingsStore.t('adminUsers.makeStudent') }}</button>
          </div>
        </article>
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
const admins = ref([])
const currentAdminId = ref(null)
const search = ref('')

const filteredAdmins = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return admins.value
  return admins.value.filter((admin) => {
    const name = userName(admin).toLowerCase()
    const email = (admin.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

onMounted(async () => {
  await Promise.all([fetchAdminMe(), fetchAdmins()])
  loading.value = false
})

async function fetchAdminMe() {
  const { data } = await api.get('/api/admin/me')
  currentAdminId.value = data.user?.id || null
}

async function fetchAdmins() {
  const { data } = await api.get('/api/admin/admins')
  admins.value = data
}

async function changeUserRole(user, role) {
  const name = userName(user)
  if (!confirm(settingsStore.t('adminUsers.confirmRole', { name, role }))) return

  await api.patch(`/api/admin/users/${user.id}/role`, { role })
  await fetchAdmins()
}

function userName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}
</script>

<style scoped>
.admin-page { background: #f8fafc; min-height: 70vh; padding: 2rem 0 3rem; }
.admin-header, .toolbar, .user-card { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.admin-header, .toolbar { margin-bottom: 1rem; }
.eyebrow { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.section-heading { color: #0f172a; font-weight: 850; }
.section-subheading, .user-card p, .user-card small { color: #64748b; }
.panel { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); padding: 1rem; }
.grid-list { display: grid; gap: 0.85rem; }
.user-card h2 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0.4rem 0 0; }
.user-card p { margin: 0.25rem 0; }
.staff-head, .row-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.row-actions { justify-content: flex-end; }
.role-badge { background: #0f172a; border-radius: 999px; color: #fff; font-size: 0.72rem; font-weight: 850; padding: 0.3rem 0.55rem; }
.self-badge { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 999px; color: #c2410c; font-size: 0.72rem; font-weight: 850; padding: 0.25rem 0.55rem; }
.search-wrap { max-width: 360px; position: relative; width: 100%; }
.search-wrap i { color: #94a3b8; left: 1rem; position: absolute; top: 50%; transform: translateY(-50%); }
.search-wrap input { border-radius: 10px; padding-left: 2.5rem; }
.count-pill { background: #fff; border: 1px solid #e5edf7; border-radius: 999px; color: #64748b; font-size: 0.82rem; font-weight: 800; padding: 0.55rem 0.8rem; }
.loading-panel { text-align: center; }
@media (max-width: 767.98px) { .admin-header, .toolbar, .user-card { align-items: stretch; flex-direction: column; } }
</style>
