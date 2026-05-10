<template>
  <div class="profile-page py-4">
    <div class="container">
      <div class="profile-hero mb-4">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('profile.kicker') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('profile.title') }}</h1>
          <p class="section-subheading mb-0">
            {{ settingsStore.t('profile.subtitle') }}
          </p>
        </div>
        <RouterLink :to="dashboardRoute" class="btn btn-gpe-outline">
          <i class="bi bi-ui-checks me-2"></i>{{ settingsStore.t('profile.dashboard') }}
        </RouterLink>
      </div>

      <div class="row g-4">
        <div class="col-lg-9">
          <div class="profile-panel">
            <div class="profile-panel-header">
              <div>
                <h2 class="profile-title mb-1">{{ profilePanelTitle }}</h2>
                <p class="profile-subtitle mb-0">
                  {{ profilePanelSubtitle }}
                </p>
              </div>
              <span class="profile-status" :class="{ complete: profileCompletion === 100 }">
                {{ settingsStore.t('profile.complete', { count: profileCompletion }) }}
              </span>
            </div>

            <div v-if="userStore.profileLoading" class="profile-loading">
              <div class="spinner-border spinner-border-sm text-primary"></div>
              <span>{{ settingsStore.t('profile.loading') }}</span>
            </div>

            <form v-else class="profile-form" @submit.prevent="saveProfile">
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label">{{ settingsStore.t('profile.firstName') }}</label>
                  <input v-model.trim="profileForm.firstName" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ settingsStore.t('profile.lastName') }}</label>
                  <input v-model.trim="profileForm.lastName" type="text" class="form-control" />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ settingsStore.t('profile.email') }}</label>
                  <input :value="profileEmail" type="email" class="form-control" disabled />
                </div>
                <div class="col-md-6">
                  <label class="form-label">{{ settingsStore.t('profile.phone') }}</label>
                  <input
                    v-model.trim="profileForm.phone"
                    type="tel"
                    class="form-control"
                    placeholder="+60 12 345 6789"
                  />
                </div>
                <div v-if="isStudentProfile" class="col-md-6">
                  <label class="form-label">{{ settingsStore.t('profile.nationality') }}</label>
                  <input
                    v-model.trim="profileForm.nationality"
                    type="text"
                    class="form-control"
                    :placeholder="settingsStore.t('profile.nationalityPlaceholder')"
                  />
                </div>
                <div v-if="isStudentProfile" class="col-md-6">
                  <label class="form-label">{{ settingsStore.t('profile.dateOfBirth') }}</label>
                  <input v-model="profileForm.dateOfBirth" type="date" class="form-control" />
                </div>
                <div v-if="isStudentProfile" class="col-md-4">
                  <label class="form-label">{{ settingsStore.t('profile.currentEducationLevel') }}</label>
                  <select v-model="profileForm.currentEducationLevel" class="form-select">
                    <option value="">{{ settingsStore.t('common.selectLevel') }}</option>
                    <option v-for="level in currentEducationOptions" :key="level" :value="level">
                      {{ settingsStore.t(level) }}
                    </option>
                  </select>
                </div>
                <div v-if="isStudentProfile" class="col-md-4">
                  <label class="form-label">{{ settingsStore.t('profile.preferredStudyLevel') }}</label>
                  <select v-model="profileForm.preferredStudyLevel" class="form-select">
                    <option value="">{{ settingsStore.t('common.selectLevel') }}</option>
                    <option v-for="level in preferredStudyOptions" :key="level" :value="level">
                      {{ settingsStore.t(level) }}
                    </option>
                  </select>
                </div>
                <div v-if="isStudentProfile" class="col-md-4">
                  <label class="form-label">{{ settingsStore.t('profile.preferredDestination') }}</label>
                  <input
                    v-model.trim="profileForm.preferredDestination"
                    type="text"
                    class="form-control"
                    :placeholder="settingsStore.t('profile.destinationPlaceholder')"
                  />
                </div>
                <div v-if="userStore.isConsultant" class="col-12">
                  <label class="form-label">Public consultant bio</label>
                  <textarea
                    v-model.trim="profileForm.consultantBio"
                    class="form-control"
                    rows="4"
                    maxlength="420"
                    placeholder="Write a short introduction students will see before booking with you."
                  ></textarea>
                  <div class="form-hint">
                    {{ consultantBioRemaining }} characters remaining
                  </div>
                </div>
              </div>

              <div v-if="!isStudentProfile" class="staff-profile-note">
                <div>
                  <span>Role</span>
                  <strong>{{ displayRole }}</strong>
                </div>
                <div v-if="userStore.isConsultant">
                  <span>Assigned areas</span>
                  <strong>{{ assignedAreasText }}</strong>
                </div>
              </div>

              <div class="profile-actions">
                <p class="profile-note mb-0">
                  {{ isStudentProfile ? settingsStore.t('profile.note') : staffProfileNote }}
                </p>
                <div class="d-flex align-items-center gap-2">
                  <span v-if="profileMessage" class="save-message">{{ profileMessage }}</span>
                  <button class="btn btn-gpe-primary" type="submit" :disabled="userStore.profileSaving">
                    <span
                      v-if="userStore.profileSaving"
                      class="spinner-border spinner-border-sm me-2"
                    ></span>
                    {{ settingsStore.t('profile.save') }}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div class="account-panel mt-4">
            <div class="account-panel-header">
              <div>
                <h2 class="profile-title mb-1">{{ settingsStore.t('profile.accountSecurity') }}</h2>
                <p class="profile-subtitle mb-0">
                  {{ settingsStore.t('profile.accountSecuritySubtitle') }}
                </p>
              </div>
              <button class="btn btn-gpe-outline" type="button" @click="showClerkProfile = !showClerkProfile">
                <i class="bi bi-shield-lock me-2"></i>
                {{
                  showClerkProfile
                    ? settingsStore.t('profile.hideSettings')
                    : settingsStore.t('profile.openSettings')
                }}
              </button>
            </div>

            <div v-if="showClerkProfile" class="clerk-profile-wrapper">
              <UserProfile routing="hash" />
            </div>
          </div>
        </div>

        <div class="col-lg-3">
          <div class="profile-side-panel">
            <h2 class="profile-title mb-3">{{ settingsStore.t('profile.snapshot') }}</h2>
            <div v-if="profileSummary.length" class="summary-list">
              <div v-for="item in profileSummary" :key="item.label" class="summary-item">
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>
            <div v-else class="empty-summary">
              {{ settingsStore.t('profile.emptySnapshot') }}
            </div>
            <RouterLink v-if="isStudentProfile" to="/consult" class="btn btn-gpe-primary w-100 mt-3">
              <i class="bi bi-calendar-check me-2"></i>{{ settingsStore.t('dashboard.bookConsultation') }}
            </RouterLink>

            <button class="btn btn-outline-danger w-100 mt-2" type="button" @click="signOutUser">
              <i class="bi bi-box-arrow-right me-2"></i>{{ settingsStore.t('profile.logOut') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { UserProfile, useAuth, useUser } from '@clerk/vue'
import api from '@/api'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const { user } = useUser()
const { signOut } = useAuth()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const profileMessage = ref('')
const showClerkProfile = ref(false)
const assignedAreas = ref([])
const profileForm = ref({
  firstName: '',
  lastName: '',
  phone: '',
  nationality: '',
  dateOfBirth: '',
  currentEducationLevel: '',
  preferredStudyLevel: '',
  preferredDestination: '',
  consultantBio: '',
})

const currentEducationOptions = [
  'profile.level.highSchool',
  'profile.level.foundation',
  'profile.level.diploma',
  'profile.level.bachelor',
  'profile.level.master',
  'profile.level.professional',
]

const preferredStudyOptions = [
  'profile.level.foundation',
  'profile.level.diploma',
  'profile.level.bachelor',
  'profile.level.master',
  'profile.level.bootcamp',
  'profile.level.shortCourse',
]

const profileEmail = computed(() => {
  return userStore.profile?.email || user.value?.primaryEmailAddress?.emailAddress || ''
})

const isStudentProfile = computed(() => userStore.role === 'student')
const displayRole = computed(() => userStore.role.charAt(0).toUpperCase() + userStore.role.slice(1))
const dashboardRoute = computed(() => {
  if (userStore.isAdmin) return '/admin'
  if (userStore.isConsultant) return '/consultant'
  return '/dashboard'
})
const profilePanelTitle = computed(() => {
  if (isStudentProfile.value) return settingsStore.t('profile.personalDetails')
  return `${displayRole.value} profile`
})
const profilePanelSubtitle = computed(() => {
  if (isStudentProfile.value) return settingsStore.t('profile.personalSubtitle')
  if (userStore.isConsultant) return 'Keep your consultant contact details current for student support.'
  return 'Manage your admin account details. Security settings remain controlled by Clerk.'
})
const staffProfileNote = computed(() => {
  if (userStore.isConsultant) return 'Assigned countries and regions are managed by an admin.'
  return 'Admin operational permissions are managed from the database role.'
})
const assignedAreasText = computed(() => {
  return assignedAreas.value.length ? assignedAreas.value.join(', ') : 'Not assigned yet'
})
const consultantBioRemaining = computed(() => {
  return 420 - (profileForm.value.consultantBio?.length || 0)
})

const profileCompletion = computed(() => {
  const fields = isStudentProfile.value ? [
    profileForm.value.firstName,
    profileForm.value.lastName,
    profileEmail.value,
    profileForm.value.phone,
    profileForm.value.nationality,
    profileForm.value.dateOfBirth,
    profileForm.value.currentEducationLevel,
    profileForm.value.preferredStudyLevel,
    profileForm.value.preferredDestination,
  ] : [
    profileForm.value.firstName,
    profileForm.value.lastName,
    profileEmail.value,
    profileForm.value.phone,
    ...(userStore.isConsultant ? [profileForm.value.consultantBio] : []),
  ]

  const filled = fields.filter(Boolean).length
  return Math.round((filled / fields.length) * 100)
})

const profileSummary = computed(() => {
  if (!isStudentProfile.value) {
    return [
      { label: 'Role', value: displayRole.value },
      { label: settingsStore.t('profile.email'), value: profileEmail.value },
      { label: settingsStore.t('profile.phone'), value: profileForm.value.phone },
      ...(userStore.isConsultant ? [{ label: 'Assigned areas', value: assignedAreasText.value }] : []),
      ...(userStore.isConsultant ? [{ label: 'Public bio', value: profileForm.value.consultantBio ? 'Published' : 'Not added' }] : []),
    ].filter((item) => item.value)
  }

  return [
    { label: settingsStore.t('profile.nationality'), value: profileForm.value.nationality },
    { label: settingsStore.t('profile.destination'), value: profileForm.value.preferredDestination },
    { label: settingsStore.t('profile.currentLevel'), value: translatedLevel(profileForm.value.currentEducationLevel) },
    { label: settingsStore.t('profile.studyLevel'), value: translatedLevel(profileForm.value.preferredStudyLevel) },
    { label: settingsStore.t('profile.phone'), value: profileForm.value.phone },
  ].filter((item) => item.value)
})

onMounted(async () => {
  await userStore.fetchProfile()
  await fetchStaffDetails()
  resetProfileForm()
})

async function fetchStaffDetails() {
  if (!userStore.isConsultant) {
    assignedAreas.value = []
    return
  }

  try {
    const { data } = await api.get('/api/consultant/me')
    assignedAreas.value = data.countries || []
  } catch (error) {
    console.error(error)
    assignedAreas.value = []
  }
}

function resetProfileForm() {
  const profile = userStore.profile || {}

  profileForm.value = {
    firstName: profile.firstName || user.value?.firstName || '',
    lastName: profile.lastName || user.value?.lastName || '',
    phone: profile.phone || '',
    nationality: profile.nationality || '',
    dateOfBirth: toDateInput(profile.dateOfBirth),
    currentEducationLevel: profile.currentEducationLevel || '',
    preferredStudyLevel: profile.preferredStudyLevel || '',
    preferredDestination: profile.preferredDestination || '',
    consultantBio: profile.consultantBio || '',
  }
}

async function saveProfile() {
  profileMessage.value = ''

  try {
    await userStore.updateProfile({
      ...profileForm.value,
      dateOfBirth: profileForm.value.dateOfBirth || null,
    })
    resetProfileForm()
    profileMessage.value = settingsStore.t('common.saved')
    setTimeout(() => {
      profileMessage.value = ''
    }, 2200)
  } catch {
    profileMessage.value = settingsStore.t('common.couldNotSave')
  }
}

function toDateInput(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}

function translatedLevel(levelKey) {
  return levelKey ? settingsStore.t(levelKey) : ''
}

async function signOutUser() {
  await signOut.value({ redirectUrl: '/' })
}
</script>

<style scoped>
.profile-page {
  background: #f8fafc;
  min-height: 70vh;
}

.profile-hero {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.eyebrow {
  color: #f4a41b;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.profile-panel,
.account-panel,
.profile-side-panel {
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  padding: 1.5rem;
}

.account-panel-header {
  align-items: center;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.clerk-profile-wrapper {
  border-top: 1px solid #eef2f7;
  margin-top: 1.25rem;
  overflow: hidden;
  padding-top: 1.25rem;
}

.profile-side-panel {
  position: sticky;
  top: 6rem;
}

.profile-panel-header {
  align-items: flex-start;
  border-bottom: 1px solid #eef2f7;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
}

.profile-title {
  color: #0f172a;
  font-size: 1.2rem;
  font-weight: 850;
}

.profile-subtitle,
.profile-note,
.empty-summary {
  color: #64748b;
  font-size: 0.9rem;
}

.profile-status {
  background: #fff7e8;
  border: 1px solid rgba(244, 164, 27, 0.35);
  border-radius: 999px;
  color: #9a5e00;
  flex: 0 0 auto;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 0.35rem 0.7rem;
}

.profile-status.complete {
  background: #ecfdf3;
  border-color: #bbf7d0;
  color: #15803d;
}

.profile-loading {
  align-items: center;
  color: #64748b;
  display: flex;
  gap: 0.65rem;
  justify-content: center;
  padding: 2rem;
}

.profile-form :deep(.form-label) {
  color: #334155;
  font-size: 0.82rem;
  font-weight: 750;
}

.profile-form :deep(.form-control),
.profile-form :deep(.form-select) {
  border-color: #dbe5f0;
  border-radius: 8px;
  color: #0f172a;
}

.form-hint {
  color: #64748b;
  font-size: 0.78rem;
  margin-top: 0.35rem;
  text-align: right;
}

.staff-profile-note {
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 1rem;
  padding: 1rem;
}

.staff-profile-note span {
  color: #64748b;
  display: block;
  font-size: 0.76rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
}

.staff-profile-note strong {
  color: #0f172a;
}

.profile-actions {
  align-items: center;
  border-top: 1px solid #eef2f7;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 1.25rem;
  padding-top: 1rem;
}

.save-message {
  color: #15803d;
  font-size: 0.86rem;
  font-weight: 750;
}

.summary-list {
  display: grid;
  gap: 0.75rem;
}

.summary-item {
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  padding: 0.85rem 1rem;
}

.summary-item span {
  color: #64748b;
  display: block;
  font-size: 0.76rem;
  font-weight: 750;
  margin-bottom: 0.2rem;
  text-transform: uppercase;
}

.summary-item strong {
  color: #0f172a;
  font-size: 0.95rem;
}

@media (max-width: 991.98px) {
  .profile-side-panel {
    position: static;
  }
}

@media (max-width: 767.98px) {
  .profile-hero,
  .profile-panel-header,
  .account-panel-header,
  .profile-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .staff-profile-note {
    grid-template-columns: 1fr;
  }
}
</style>
