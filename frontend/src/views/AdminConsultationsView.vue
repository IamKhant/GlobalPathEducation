<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">Admin Workspace</p>
          <h1 class="section-heading mb-1">Manage consultations</h1>
          <p class="section-subheading mb-0">Review requests, update statuses, and assign consultants.</p>
        </div>
        <RouterLink to="/admin" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>Admin overview
        </RouterLink>
      </header>

      <section class="panel">
        <div class="panel-heading">
          <h2>All consultations</h2>
          <div class="search-wrap">
            <i class="bi bi-search"></i>
            <input v-model="search" type="text" class="form-control form-control-sm" placeholder="Search by student or program..." />
          </div>
        </div>

        <div class="status-tabs">
          <button
            v-for="tab in statusTabs"
            :key="tab.value"
            type="button"
            class="status-tab"
            :class="[`status-tab-${tab.value}`, { active: selectedStatus === tab.value }]"
            @click="selectedStatus = tab.value"
          >
            {{ tab.label }}
            <span>{{ statusCount(tab.value) }}</span>
          </button>
        </div>

        <div v-if="loading" class="loading-panel">Loading consultations...</div>
        <div v-else class="table-wrap">
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
              <tr v-for="item in filteredConsultations" :key="item.id">
                <td>
                  <strong>{{ item.fullName }}</strong>
                  <small>{{ item.email }}</small>
                </td>
                <td>{{ item.program?.title || 'General inquiry' }}</td>
                <td>
                  <select class="form-select form-select-sm" :value="normalizeStatus(item.status)" @change="updateConsultation(item.id, { status: $event.target.value })">
                    <option v-for="status in statuses" :key="status" :value="status">{{ statusLabel(status) }}</option>
                  </select>
                </td>
                <td>
                  <select class="form-select form-select-sm" :value="item.consultantId || ''" @change="updateConsultation(item.id, { consultantId: $event.target.value || null })">
                    <option value="">Unassigned</option>
                    <option v-for="consultant in consultants" :key="consultant.id" :value="consultant.id">
                      {{ userName(consultant) }}
                    </option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="filteredConsultations.length === 0" class="empty-state">No consultations match your filters.</div>
        </div>
      </section>
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
const consultations = ref([])
const consultants = ref([])
const search = ref('')
const selectedStatus = ref('all')
const statuses = ['pending', 'confirmed', 'completed', 'cancelled']
const statusTabs = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const filteredConsultations = computed(() => {
  let list = consultations.value
  if (selectedStatus.value !== 'all') {
    list = list.filter((item) => normalizeStatus(item.status) === selectedStatus.value)
  }

  const query = search.value.trim().toLowerCase()
  if (!query) return list

  return list.filter((item) =>
    [item.fullName, item.email, item.program?.title, item.program?.institution]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

onMounted(async () => {
  await Promise.all([fetchConsultations(), fetchConsultants()])
  loading.value = false
})

async function fetchConsultations() {
  const { data } = await api.get('/api/admin/consultations')
  consultations.value = data
}

async function fetchConsultants() {
  const { data } = await api.get('/api/admin/consultants')
  consultants.value = data
}

async function updateConsultation(id, payload) {
  const { data } = await api.patch(`/api/admin/consultations/${id}`, payload)
  consultations.value = consultations.value.map((item) => (item.id === id ? data : item))
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
}

function statusLabel(status) {
  return settingsStore.t(`common.status.${normalizeStatus(status)}`)
}

function statusCount(status) {
  if (status === 'all') return consultations.value.length
  return consultations.value.filter((item) => normalizeStatus(item.status) === status).length
}

function userName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}
</script>

<style scoped>
.admin-page { background: #f8fafc; min-height: 70vh; padding: 2rem 0 3rem; }
.admin-header, .panel-heading { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.admin-header { margin-bottom: 1rem; }
.eyebrow { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.section-heading { color: #0f172a; font-weight: 850; }
.section-subheading, td small, .empty-state { color: #64748b; }
.panel { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); padding: 1rem; }
.panel h2 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0; }
.search-wrap { max-width: 320px; position: relative; width: 100%; }
.search-wrap i { color: #94a3b8; left: 0.8rem; position: absolute; top: 50%; transform: translateY(-50%); }
.search-wrap input { padding-left: 2.1rem; border-radius: 8px; }
.status-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 1rem 0; }
.status-tab { align-items: center; background: #fff; border: 1px solid #dbe3ef; border-radius: 999px; color: #334155; display: inline-flex; font-size: 0.82rem; font-weight: 800; gap: 0.45rem; padding: 0.45rem 0.75rem; }
.status-tab span { background: rgba(255, 255, 255, 0.72); border-radius: 999px; color: inherit; min-width: 1.45rem; padding: 0.1rem 0.35rem; text-align: center; }
.status-tab-all { background: #f8fafc; border-color: #cbd5e1; color: #334155; }
.status-tab-pending { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
.status-tab-confirmed { background: #ecfdf3; border-color: #bbf7d0; color: #15803d; }
.status-tab-completed { background: #f1f5f9; border-color: #cbd5e1; color: #475569; }
.status-tab-cancelled { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.status-tab.active { box-shadow: 0 0 0 3px rgba(15, 23, 42, 0.08); transform: translateY(-1px); }
.status-tab-all.active { background: #0f172a; border-color: #0f172a; color: #fff; }
.status-tab-pending.active { background: #f97316; border-color: #f97316; color: #fff; }
.status-tab-confirmed.active { background: #16a34a; border-color: #16a34a; color: #fff; }
.status-tab-completed.active { background: #64748b; border-color: #64748b; color: #fff; }
.status-tab-cancelled.active { background: #dc2626; border-color: #dc2626; color: #fff; }
.table-wrap { overflow-x: auto; }
td strong, td small { display: block; }
.loading-panel, .empty-state { padding: 2rem; text-align: center; }
@media (max-width: 767.98px) { .admin-header, .panel-heading { align-items: stretch; flex-direction: column; } }
</style>
