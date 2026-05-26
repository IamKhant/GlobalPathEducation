<template>
  <div class="consultant-page">
    <div class="container">
      <header class="consultant-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('consultant.kicker') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('consultant.consultations.title') }}</h1>
          <p class="section-subheading mb-0">{{ settingsStore.t('consultant.consultations.subtitle') }}</p>
        </div>
        <RouterLink to="/consultant" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>{{ settingsStore.t('consultant.tab.overview') }}
        </RouterLink>
      </header>

      <section class="panel">
        <div class="toolbar">
          <div class="status-tabs">
            <button
              v-for="tab in statusTabs"
              :key="tab.value"
              type="button"
              class="status-tab"
              :class="[`status-tab-${tab.value}`, { active: activeStatus === tab.value }]"
              @click="activeStatus = tab.value"
            >
              {{ settingsStore.t(tab.labelKey) }}
              <span>{{ statusCount(tab.value) }}</span>
            </button>
          </div>
          <input
            v-model="consultationSearch"
            class="form-control search-input"
            type="search"
            :placeholder="settingsStore.t('consultant.consultations.searchPlaceholder')"
          />
        </div>

        <div v-if="loading" class="loading-panel">{{ settingsStore.t('consultant.loading') }}</div>
        <div v-else-if="filteredConsultations.length === 0" class="empty-state">
          <h5>{{ settingsStore.t('consultant.consultations.emptyTitle') }}</h5>
          <p class="text-muted mb-0">{{ settingsStore.t('consultant.consultations.emptySubtitle') }}</p>
        </div>

        <div v-else class="consultation-list">
          <article v-for="consultation in filteredConsultations" :key="consultation.id" class="consultation-card">
            <div class="consultation-main">
              <div class="consultation-top">
                <div>
                  <h2>{{ consultation.fullName }}</h2>
                  <div class="consultation-contact">
                    <span><i class="bi bi-envelope"></i>{{ consultation.email }}</span>
                    <span v-if="consultation.phone"><i class="bi bi-telephone"></i>{{ consultation.phone }}</span>
                  </div>
                </div>
                <span class="status-badge" :class="statusClass(consultation.status)">
                  {{ statusLabel(consultation.status) }}
                </span>
              </div>

              <div class="consultation-program">
                <span>{{ settingsStore.t('consultant.consultations.program') }}</span>
                <strong>{{ consultation.program?.title || settingsStore.t('consultant.consultations.generalInquiry') }}</strong>
                <small v-if="consultation.program">{{ consultation.program.institution }} - {{ consultation.program.country }}</small>
              </div>

              <p v-if="consultation.message" class="consultation-message">{{ consultation.message }}</p>

              <div class="consultation-meta-row">
                <span><i class="bi bi-geo-alt"></i>{{ consultation.user?.preferredDestination || consultation.preferredCountry || settingsStore.t('consultant.overview.noDestination') }}</span>
                <span><i class="bi bi-calendar-event"></i>{{ formatDate(consultation.createdAt) }}</span>
              </div>

              <div class="status-actions">
                <div class="dropdown">
                  <button class="btn btn-sm dropdown-toggle status-badge" :class="statusClass(consultation.status)" type="button" data-bs-toggle="dropdown" aria-expanded="false" :disabled="updatingId === consultation.id">
                    <span v-if="updatingId === consultation.id" class="spinner-border spinner-border-sm me-1"></span>
                    {{ statusLabel(consultation.status) }}
                  </button>
                  <ul class="dropdown-menu shadow-sm">
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
                <div><dt>{{ settingsStore.t('consultant.students.nationality') }}</dt><dd>{{ consultation.user?.nationality || '-' }}</dd></div>
                <div><dt>{{ settingsStore.t('consultant.students.currentEducation') }}</dt><dd>{{ profileValue(consultation.user?.currentEducationLevel) }}</dd></div>
                <div><dt>{{ settingsStore.t('consultant.students.preferredLevel') }}</dt><dd>{{ profileValue(consultation.user?.preferredStudyLevel) }}</dd></div>
                <div><dt>{{ settingsStore.t('consultant.students.destination') }}</dt><dd>{{ consultation.user?.preferredDestination || consultation.preferredCountry || '-' }}</dd></div>
                <div><dt>{{ settingsStore.t('profile.budget') }}</dt><dd>{{ formatBudget(consultation.user) }}</dd></div>
                <div><dt>{{ settingsStore.t('consultant.consultations.requested') }}</dt><dd>{{ formatDate(consultation.createdAt) }}</dd></div>
              </dl>
            </aside>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import api from '@/api'
import { useSettingsStore } from '@/stores/settings'

const route = useRoute()
const settingsStore = useSettingsStore()
const loading = ref(true)
const updatingId = ref(null)
const consultations = ref([])
const activeStatus = ref(typeof route.query.status === 'string' ? route.query.status : 'all')
const consultationSearch = ref('')
const statusTabs = [
  { value: 'all', labelKey: 'consultant.filter.all' },
  { value: 'pending', labelKey: 'consultant.filter.pending' },
  { value: 'confirmed', labelKey: 'consultant.filter.confirmed' },
  { value: 'completed', labelKey: 'consultant.filter.completed' },
  { value: 'cancelled', labelKey: 'consultant.filter.cancelled' },
]
const actionStatuses = ['pending', 'confirmed', 'completed', 'cancelled']

const filteredConsultations = computed(() => {
  let list = consultations.value
  if (activeStatus.value !== 'all') list = list.filter((item) => normalizeStatus(item.status) === activeStatus.value)
  const query = consultationSearch.value.trim().toLowerCase()
  if (!query) return list
  return list.filter((item) =>
    [item.fullName, item.email, item.program?.title, item.program?.institution, item.user?.preferredDestination, item.preferredCountry]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

onMounted(async () => {
  await fetchConsultations()
  loading.value = false
})

async function fetchConsultations() {
  const { data } = await api.get('/api/consultant/consultations')
  consultations.value = data
}

function statusCount(status) {
  if (status === 'all') return consultations.value.length
  return consultations.value.filter((item) => normalizeStatus(item.status) === status).length
}

async function updateStatus(id, status) {
  updatingId.value = id
  try {
    const { data } = await api.patch(`/api/consultant/consultations/${id}/status`, { status })
    consultations.value = consultations.value.map((item) => (item.id === id ? data : item))
  } finally {
    updatingId.value = null
  }
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
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
.consultant-header, .toolbar, .consultation-top { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.consultant-header { margin-bottom: 1rem; }
.eyebrow { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.panel, .loading-panel, .empty-state, .consultation-card { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); }
.panel { padding: 1rem; }
.loading-panel, .empty-state { padding: 2.5rem 1rem; text-align: center; }
.toolbar { margin-bottom: 1rem; }
.search-input { max-width: 300px; }
.status-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.status-tab { align-items: center; background: #fff; border: 1px solid #dbe3ef; border-radius: 999px; color: #334155; display: inline-flex; font-size: 0.85rem; font-weight: 850; gap: 0.45rem; padding: 0.45rem 0.75rem; }
.status-tab span { background: rgba(255,255,255,0.72); border-radius: 999px; color: inherit; min-width: 1.45rem; padding: 0.1rem 0.35rem; text-align: center; }
.status-tab-all { background: #f8fafc; border-color: #cbd5e1; color: #334155; }
.status-tab-pending { background: #fff7ed; border-color: #fed7aa; color: #c2410c; }
.status-tab-confirmed { background: #ecfdf3; border-color: #bbf7d0; color: #15803d; }
.status-tab-completed { background: #f1f5f9; border-color: #cbd5e1; color: #475569; }
.status-tab-cancelled { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.status-tab.active { box-shadow: 0 0 0 3px rgba(15,23,42,0.08); transform: translateY(-1px); }
.status-tab-all.active { background: #0f172a; border-color: #0f172a; color: #fff; }
.status-tab-pending.active { background: #f97316; border-color: #f97316; color: #fff; }
.status-tab-confirmed.active { background: #16a34a; border-color: #16a34a; color: #fff; }
.status-tab-completed.active { background: #64748b; border-color: #64748b; color: #fff; }
.status-tab-cancelled.active { background: #dc2626; border-color: #dc2626; color: #fff; }
.consultation-list { display: grid; gap: 0.85rem; }
.consultation-card { display: grid; gap: 1.25rem; grid-template-columns: minmax(0, 1fr) 280px; padding: 1.25rem; }
.consultation-top h2 { color: #0f172a; font-size: 1.05rem; font-weight: 850; margin: 0 0 0.35rem; }
.consultation-contact, .consultation-meta-row { color: #64748b; display: flex; flex-wrap: wrap; font-size: 0.84rem; gap: 0.8rem; }
.consultation-contact i, .consultation-meta-row i { margin-right: 0.35rem; }
.status-badge { border: 0; border-radius: 999px; font-size: 0.75rem; font-weight: 850; padding: 0.35rem 0.65rem; white-space: nowrap; }
.status-pending { background: #fff7ed; color: #c2410c; }
.status-confirmed { background: #ecfdf3; color: #15803d; }
.status-completed { background: #f1f5f9; color: #475569; }
.status-cancelled { background: #fef2f2; color: #b91c1c; }
.consultation-program { background: #f8fafc; border-radius: 8px; margin-top: 1rem; padding: 0.75rem; }
.consultation-program span, .student-profile dt { color: #64748b; display: block; font-size: 0.72rem; font-weight: 850; margin-bottom: 0.25rem; text-transform: uppercase; }
.consultation-program strong, .consultation-program small { display: block; }
.consultation-message { color: #475569; font-size: 0.9rem; line-height: 1.65; margin: 1rem 0 0; }
.consultation-meta-row { margin-top: 0.9rem; }
.status-actions { margin-top: 1rem; }
.student-profile { border-left: 1px solid #eef2f7; padding-left: 1.25rem; }
.student-profile h3 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0 0 0.85rem; }
.student-profile dl { display: grid; gap: 0.65rem; margin: 0; }
.student-profile dd { color: #0f172a; font-size: 0.88rem; font-weight: 700; margin: 0; }
@media (max-width: 991.98px) {
  .consultant-header, .toolbar, .consultation-top { align-items: stretch; flex-direction: column; }
  .search-input { max-width: none; }
  .consultation-card { grid-template-columns: 1fr; }
  .student-profile { border-left: 0; border-top: 1px solid #eef2f7; padding-left: 0; padding-top: 1rem; }
}
</style>
