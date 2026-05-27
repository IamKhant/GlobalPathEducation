<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('admin.workspace') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('adminConsultants.title') }}</h1>
          <p class="section-subheading mb-0">{{ settingsStore.t('adminConsultants.subtitle') }}</p>
        </div>
        <RouterLink to="/admin" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>{{ settingsStore.t('admin.common.overview') }}
        </RouterLink>
      </header>

      <div v-if="loading" class="panel loading-panel">{{ settingsStore.t('adminConsultants.loading') }}</div>

      <section v-else class="consultant-layout">
        <aside class="panel promote-panel">
          <div class="panel-heading">
            <div>
              <h2>{{ settingsStore.t('adminConsultants.createTitle') }}</h2>
              <p>{{ settingsStore.t('adminConsultants.createSubtitle') }}</p>
            </div>
          </div>

          <label>
            <span>{{ settingsStore.t('adminConsultants.userAccount') }}</span>
            <div class="search-wrap">
              <i class="bi bi-search"></i>
              <input v-model="promoteSearch" type="text" class="form-control" :placeholder="settingsStore.t('adminConsultants.promoteSearchPlaceholder')" />
            </div>
            <div class="promote-user-list">
              <button
                v-for="student in filteredStudents"
                :key="student.id"
                type="button"
                :class="['promote-user-option', { selected: promoteUserId === student.id }]"
                @click="promoteUserId = promoteUserId === student.id ? '' : student.id"
              >
                <div class="avatar">{{ initials(student) }}</div>
                <div class="user-info">
                  <strong>{{ userName(student) }}</strong>
                  <small>{{ student.email }}</small>
                </div>
                <i v-if="promoteUserId === student.id" class="bi bi-check-circle-fill text-success"></i>
              </button>
              <div v-if="filteredStudents.length === 0" class="empty-state">
                {{ promoteSearch ? settingsStore.t('adminConsultants.noMatchingUsers') : settingsStore.t('adminConsultants.noStudentsAvailable') }}
              </div>
            </div>
          </label>

          <button class="btn btn-gpe-primary w-100" type="button" :disabled="!promoteUserId" @click="promoteConsultant">
            {{ settingsStore.t('adminConsultants.promoteButton') }}
          </button>
          <div class="note">{{ settingsStore.t('adminConsultants.clerkNote') }}</div>
        </aside>

        <div>
          <div class="search-wrap mb-3">
            <i class="bi bi-search"></i>
            <input v-model="consultantSearch" type="text" class="form-control" :placeholder="settingsStore.t('adminConsultants.searchPlaceholder')" />
          </div>

          <div class="consultant-list">
            <article v-for="consultant in filteredConsultants" :key="consultant.id" class="panel consultant-card">
              <div class="consultant-top">
                <div class="avatar large">{{ initials(consultant) }}</div>
                <div>
                  <h2>{{ userName(consultant) }}</h2>
                  <p>{{ consultant.email }}</p>
                  <div class="area-row">
                    <span v-for="area in countryList(consultant)" :key="area">{{ area }}</span>
                  </div>
                </div>
              </div>

              <div class="editor-grid">
                <label>
                  <span>{{ settingsStore.t('adminConsultants.countries') }}</span>
                  <div class="tag-input-wrap">
                    <div class="tag-chips">
                      <span v-for="area in assignedCountryList(consultant)" :key="area" class="tag-chip">
                        {{ area }}
                        <button type="button" @click="removeCountry(consultant, area)">&times;</button>
                      </span>
                    </div>
                    <input type="text" class="form-control form-control-sm" :placeholder="settingsStore.t('adminConsultants.countryPlaceholder')" @keydown="handleCountryInputKeydown(consultant, $event)" @blur="addCountryFromInput(consultant, $event)" />
                  </div>
                  <small class="muted">{{ settingsStore.t('adminConsultants.countryHint') }}</small>
                </label>

                <label>
                  <span>{{ settingsStore.t('profile.consultantBio') }}</span>
                  <textarea class="form-control" rows="4" :value="consultant.consultantBio || ''" :placeholder="settingsStore.t('adminConsultants.bioPlaceholder')" @change="saveBio(consultant.id, $event.target.value)"></textarea>
                </label>
              </div>

              <div class="consultant-footer">
                <span>{{ settingsStore.t('adminConsultants.assignedConsultations', { count: consultant.assignedConsultations?.length || 0 }) }}</span>
                <div class="row-actions">
                  <button class="btn btn-sm btn-outline-dark" type="button" @click="changeUserRole(consultant, 'admin')">{{ settingsStore.t('adminUsers.makeAdmin') }}</button>
                  <button class="btn btn-sm btn-outline-danger" type="button" @click="changeUserRole(consultant, 'student')">{{ settingsStore.t('adminUsers.makeStudent') }}</button>
                </div>
              </div>
            </article>
          </div>
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
const students = ref([])
const consultants = ref([])
const promoteUserId = ref('')
const promoteSearch = ref('')
const consultantSearch = ref('')

const filteredStudents = computed(() => {
  const query = promoteSearch.value.trim().toLowerCase()
  const list = query ? students.value : students.value.slice(0, 10)
  return list.filter((student) => {
    const name = userName(student).toLowerCase()
    const email = (student.email || '').toLowerCase()
    return !query || name.includes(query) || email.includes(query)
  })
})

const filteredConsultants = computed(() => {
  const query = consultantSearch.value.trim().toLowerCase()
  if (!query) return consultants.value
  return consultants.value.filter((consultant) =>
    userName(consultant).toLowerCase().includes(query) ||
    (consultant.email || '').toLowerCase().includes(query) ||
    countryList(consultant).some((area) => area.toLowerCase().includes(query)),
  )
})

onMounted(async () => {
  await Promise.all([fetchStudents(), fetchConsultants()])
  loading.value = false
})

async function fetchStudents() {
  const { data } = await api.get('/api/admin/students')
  students.value = data
}

async function fetchConsultants() {
  const { data } = await api.get('/api/admin/consultants')
  consultants.value = data
}

async function promoteConsultant() {
  await api.patch(`/api/admin/users/${promoteUserId.value}/role`, { role: 'consultant' })
  promoteUserId.value = ''
  promoteSearch.value = ''
  await Promise.all([fetchStudents(), fetchConsultants()])
}

async function changeUserRole(user, role) {
  const name = userName(user)
  if (!confirm(settingsStore.t('adminUsers.confirmRole', { name, role }))) return

  await api.patch(`/api/admin/users/${user.id}/role`, { role })
  await Promise.all([fetchStudents(), fetchConsultants()])
}

async function addCountryFromInput(consultant, event) {
  const input = event.target
  const pieces = String(input.value || '').split(',').map((value) => value.trim()).filter(Boolean)
  if (!pieces.length) return
  input.value = ''

  const existing = assignedCountryList(consultant)
  const nextCountries = [...existing]
  pieces.forEach((country) => {
    if (!nextCountries.some((item) => item.toLowerCase() === country.toLowerCase())) nextCountries.push(country)
  })
  if (nextCountries.length === existing.length) return

  const { data } = await api.patch(`/api/admin/consultants/${consultant.id}/countries`, { countries: nextCountries })
  consultants.value = consultants.value.map((item) => (item.id === consultant.id ? data : item))
}

function handleCountryInputKeydown(consultant, event) {
  if (event.key !== 'Enter' && event.key !== ',') return
  event.preventDefault()
  addCountryFromInput(consultant, event)
}

async function removeCountry(consultant, area) {
  const countries = assignedCountryList(consultant).filter((country) => country !== area)
  const { data } = await api.patch(`/api/admin/consultants/${consultant.id}/countries`, { countries })
  consultants.value = consultants.value.map((item) => (item.id === consultant.id ? data : item))
}

async function saveBio(id, consultantBio) {
  const { data } = await api.patch(`/api/admin/consultants/${id}/profile`, { consultantBio })
  consultants.value = consultants.value.map((item) => (item.id === id ? data : item))
}

function userName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

function initials(user) {
  return userName(user).split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()
}

function assignedCountryList(consultant) {
  return consultant.consultantCountries?.map((item) => item.country).filter(Boolean) || []
}

function countryList(consultant) {
  const countries = assignedCountryList(consultant)
  return countries.length ? countries : [settingsStore.t('adminConsultations.unassigned')]
}
</script>

<style scoped>
.admin-page { background: #f8fafc; min-height: 70vh; padding: 2rem 0 3rem; }
.admin-header, .consultant-top, .consultant-footer { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.admin-header { margin-bottom: 1rem; }
.eyebrow { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.section-heading { color: #0f172a; font-weight: 850; }
.section-subheading, .panel p, .muted, .note, .consultant-footer, .empty-state { color: #64748b; }
.panel { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); padding: 1rem; }
.loading-panel { text-align: center; }
.consultant-layout { display: grid; gap: 1rem; grid-template-columns: 340px minmax(0, 1fr); }
.promote-panel { align-self: start; display: grid; gap: 0.85rem; position: sticky; top: 6rem; }
.panel h2, .consultant-card h2 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0; }
label { display: grid; gap: 0.4rem; }
label > span { color: #334155; font-size: 0.78rem; font-weight: 850; }
.search-wrap { position: relative; }
.search-wrap i { color: #94a3b8; left: 0.85rem; position: absolute; top: 50%; transform: translateY(-50%); }
.search-wrap input { border-radius: 10px; padding-left: 2.35rem; }
.promote-user-list, .consultant-list { display: grid; gap: 0.75rem; }
.promote-user-list { border: 1px solid #e5edf7; border-radius: 8px; max-height: 240px; overflow-y: auto; padding: 0.35rem; }
.promote-user-option { align-items: center; background: transparent; border: 0; border-radius: 8px; display: flex; gap: 0.6rem; padding: 0.55rem; text-align: left; width: 100%; }
.promote-user-option:hover, .promote-user-option.selected { background: #eff6ff; }
.avatar { align-items: center; background: #e2e8f0; border-radius: 999px; color: #475569; display: flex; flex: 0 0 34px; font-size: 0.72rem; font-weight: 850; height: 34px; justify-content: center; width: 34px; }
.avatar.large { background: #0f172a; color: #fff; flex-basis: 44px; height: 44px; width: 44px; }
.user-info { flex: 1; min-width: 0; }
.user-info strong, .user-info small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.editor-grid { display: grid; gap: 1rem; grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); margin-top: 1rem; }
.area-row, .tag-chips, .row-actions { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.area-row span, .tag-chip { background: #eff6ff; border-radius: 999px; color: #0f4d85; font-size: 0.74rem; font-weight: 850; padding: 0.3rem 0.55rem; }
.tag-input-wrap { border: 1px solid #dbe3ef; border-radius: 8px; display: grid; gap: 0.45rem; padding: 0.45rem; }
.tag-chip button { background: transparent; border: 0; color: #64748b; font-weight: 850; }
.consultant-footer { border-top: 1px solid #e5edf7; margin-top: 1rem; padding-top: 1rem; }
@media (max-width: 991.98px) { .consultant-layout, .editor-grid { grid-template-columns: 1fr; } .promote-panel { position: static; } }
@media (max-width: 767.98px) { .admin-header, .consultant-top, .consultant-footer { align-items: stretch; flex-direction: column; } }
</style>
