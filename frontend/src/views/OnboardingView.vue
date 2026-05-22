<template>
  <div class="onboarding-page">
    <div class="container">
      <section class="onboarding-shell">
        <aside class="onboarding-copy">
          <p class="eyebrow mb-2">{{ settingsStore.t('onboarding.kicker') }}</p>
          <h1>{{ settingsStore.t('onboarding.title') }}</h1>
          <p>{{ settingsStore.t('onboarding.subtitle') }}</p>

          <div class="onboarding-progress">
            <div class="progress-label">
              <span>{{ settingsStore.t('onboarding.progress') }}</span>
              <strong>{{ completion }}%</strong>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{ width: `${completion}%` }"></div>
            </div>
          </div>
        </aside>

        <form class="onboarding-form" @submit.prevent="saveDetails">
          <div class="form-header">
            <h2>{{ settingsStore.t('onboarding.formTitle') }}</h2>
            <p>{{ settingsStore.t('onboarding.formSubtitle') }}</p>
          </div>

          <div class="form-grid">
            <label>
              <span>{{ settingsStore.t('profile.firstName') }}</span>
              <input v-model.trim="form.firstName" class="form-control" required />
            </label>
            <label>
              <span>{{ settingsStore.t('profile.lastName') }}</span>
              <input v-model.trim="form.lastName" class="form-control" required />
            </label>
            <label>
              <span>{{ settingsStore.t('profile.phone') }}</span>
              <input
                v-model.trim="form.phone"
                class="form-control"
                type="tel"
                required
                placeholder="+60 12 345 6789"
              />
            </label>
            <label>
              <span>{{ settingsStore.t('profile.nationality') }}</span>
              <input
                v-model.trim="form.nationality"
                class="form-control"
                required
                :placeholder="settingsStore.t('profile.nationalityPlaceholder')"
              />
            </label>
            <label>
              <span>{{ settingsStore.t('profile.dateOfBirth') }}</span>
              <input v-model="form.dateOfBirth" class="form-control" type="date" required />
            </label>
            <label>
              <span>{{ settingsStore.t('profile.preferredDestination') }}</span>
              <input
                v-model.trim="form.preferredDestination"
                class="form-control"
                required
                :placeholder="settingsStore.t('profile.destinationPlaceholder')"
              />
            </label>
            <label>
              <span>{{ settingsStore.t('profile.maxBudget') }}</span>
              <input
                v-model.number="form.maxBudget"
                class="form-control"
                type="number"
                min="0"
                step="100"
                required
                :placeholder="settingsStore.t('profile.maxBudgetPlaceholder')"
              />
            </label>
            <label>
              <span>{{ settingsStore.t('profile.budgetCurrency') }}</span>
              <select v-model="form.budgetCurrency" class="form-select" required>
                <option v-for="currency in budgetCurrencyOptions" :key="currency" :value="currency">
                  {{ currency }}
                </option>
              </select>
            </label>
            <label>
              <span>{{ settingsStore.t('profile.currentEducationLevel') }}</span>
              <select v-model="form.currentEducationLevel" class="form-select" required>
                <option value="" disabled>{{ settingsStore.t('common.selectLevel') }}</option>
                <option v-for="level in currentEducationOptions" :key="level" :value="level">
                  {{ settingsStore.t(level) }}
                </option>
              </select>
            </label>
            <label>
              <span>{{ settingsStore.t('profile.preferredStudyLevel') }}</span>
              <select v-model="form.preferredStudyLevel" class="form-select" required>
                <option value="" disabled>{{ settingsStore.t('common.selectLevel') }}</option>
                <option v-for="level in preferredStudyOptions" :key="level" :value="level">
                  {{ settingsStore.t(level) }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-actions">
            <p v-if="message" class="form-message">{{ message }}</p>
            <button class="btn btn-gpe-primary" type="submit" :disabled="userStore.profileSaving">
              <span
                v-if="userStore.profileSaving"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              {{ settingsStore.t('onboarding.save') }}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUser } from '@clerk/vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const { user } = useUser()
const settingsStore = useSettingsStore()
const userStore = useUserStore()
const message = ref('')
const form = ref({
  firstName: '',
  lastName: '',
  phone: '',
  nationality: '',
  dateOfBirth: '',
  currentEducationLevel: '',
  preferredStudyLevel: '',
  preferredDestination: '',
  maxBudget: '',
  budgetCurrency: 'AUD',
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

const budgetCurrencyOptions = ['AUD', 'USD', 'MYR', 'EUR', 'CAD', 'GBP', 'JPY', 'NZD']

const completion = computed(() => {
  const fields = Object.values(form.value)
  return Math.round((fields.filter(Boolean).length / fields.length) * 100)
})

onMounted(async () => {
  await userStore.fetchProfile()
  resetForm()

  if (userStore.isStudentProfileComplete) {
    router.replace('/dashboard')
  }
})

function resetForm() {
  const profile = userStore.profile || {}
  form.value = {
    firstName: profile.firstName || user.value?.firstName || '',
    lastName: profile.lastName || user.value?.lastName || '',
    phone: profile.phone || '',
    nationality: profile.nationality || '',
    dateOfBirth: toDateInput(profile.dateOfBirth),
    currentEducationLevel: profile.currentEducationLevel || '',
    preferredStudyLevel: profile.preferredStudyLevel || '',
    preferredDestination: profile.preferredDestination || '',
    maxBudget: profile.maxBudget ?? '',
    budgetCurrency: profile.budgetCurrency || 'AUD',
  }
}

async function saveDetails() {
  message.value = ''

  try {
    await userStore.updateProfile({
      ...form.value,
      dateOfBirth: form.value.dateOfBirth || null,
    })
    router.replace(typeof route.query.redirect_url === 'string' ? route.query.redirect_url : '/dashboard')
  } catch {
    message.value = settingsStore.t('common.couldNotSave')
  }
}

function toDateInput(value) {
  if (!value) return ''
  return new Date(value).toISOString().slice(0, 10)
}
</script>

<style scoped>
.onboarding-page {
  background: #f8fafc;
  min-height: 80vh;
  padding: 2rem 0 3rem;
}

.onboarding-shell {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: minmax(280px, 0.8fr) minmax(0, 1.2fr);
  align-items: start;
}

.onboarding-copy,
.onboarding-form {
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
  padding: 1.5rem;
}

.onboarding-copy {
  position: sticky;
  top: 6rem;
}

.eyebrow {
  color: #f4a41b;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.onboarding-copy h1,
.form-header h2 {
  color: #0f172a;
  font-weight: 850;
  letter-spacing: -0.02em;
  margin: 0 0 0.65rem;
}

.onboarding-copy p,
.form-header p,
.form-message {
  color: #64748b;
  line-height: 1.6;
}

.onboarding-progress {
  margin-top: 1.5rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.45rem;
  color: #475569;
  font-size: 0.85rem;
  font-weight: 800;
}

.progress-track {
  background: #e5edf7;
  border-radius: 999px;
  height: 0.55rem;
  overflow: hidden;
}

.progress-fill {
  background: #f4a41b;
  height: 100%;
  transition: width 0.2s ease;
}

.form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label span {
  color: #64748b;
  display: block;
  font-size: 0.76rem;
  font-weight: 850;
  margin-bottom: 0.35rem;
  text-transform: uppercase;
}

.form-actions {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
}

.form-message {
  margin: 0;
  font-size: 0.88rem;
}

@media (max-width: 991.98px) {
  .onboarding-shell,
  .form-grid {
    grid-template-columns: 1fr;
  }

  .onboarding-copy {
    position: static;
  }
}

@media (max-width: 575.98px) {
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
