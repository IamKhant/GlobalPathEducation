<template>
  <div class="py-4 compare-page">
    <div class="container">
      <h1 class="section-heading mb-1">Compare Programs</h1>
      <p class="section-subheading mb-4">Compare up to 3 programs side by side</p>

      <div v-if="userStore.compareList.length === 0" class="text-center py-5">
        <div class="fs-1 mb-3">⚖️</div>
        <h5>No programs to compare</h5>
        <p class="text-muted">Browse programs and click the compare icon (📊) to add them here.</p>
        <RouterLink to="/programs" class="btn btn-gpe-primary">Browse Programs</RouterLink>
      </div>

      <div v-else>
        <div class="table-responsive rounded-3 shadow-sm">
          <table class="table table-bordered mb-0" style="background: white; min-width: 600px">
            <thead>
              <tr style="background: var(--gpe-primary)">
                <th class="text-secondary fw-semibold" style="width: 180px; border-color: #2e5080">
                  Criteria
                </th>
                <th
                  v-for="p in userStore.compareList"
                  :key="p.id"
                  class="text-dark"
                  style="border-color: #2e5080"
                >
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <div class="fw-bold" style="font-size: 0.9rem">{{ p.title }}</div>
                      <div style="font-size: 0.78rem; opacity: 0.8">{{ p.institution }}</div>
                    </div>
                    <button
                      class="btn-close btn-close-white ms-2"
                      style="font-size: 0.7rem"
                      @click="userStore.removeFromCompare(p.id)"
                    ></button>
                  </div>
                </th>
                <th
                  v-if="userStore.compareList.length < 3"
                  style="border-color: #2e5080; background: rgba(255, 255, 255, 0.05)"
                >
                  <RouterLink
                    to="/programs"
                    class="text-white text-decoration-none d-flex align-items-center gap-1 small"
                  >
                    <i class="bi bi-plus-circle"></i> Add Program
                  </RouterLink>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in compareRows"
                :key="row.key"
                :class="{ 'table-light': row.highlight }"
              >
                <td class="fw-semibold small text-muted">{{ row.label }}</td>
                <td v-for="p in userStore.compareList" :key="p.id" class="small">
                  <span
                    v-if="row.key === 'type'"
                    :class="['badge-type', p.type === 'Master' ? 'badge-master' : 'badge-bootcamp']"
                  >
                    {{ p.type }}
                  </span>

                  <span v-else-if="row.key === 'country'">
                    {{ countryFlags[p.country] || '🌏' }} {{ p.country }}
                  </span>

                  <span v-else-if="row.key === 'duration'"> {{ p.durationMonths }} months </span>

                  <span v-else-if="row.key === 'tuition'">
                    <strong :class="{ 'text-success': p.tuitionFee === 0 }">{{
                      formatTuition(p)
                    }}</strong>
                    <span v-if="p.tuitionFee !== 0" class="text-muted ms-1">{{
                      feeBasisLabel(p.feeBasis)
                    }}</span>
                  </span>

                  <span v-else-if="row.key === 'specialization'" class="d-flex flex-wrap gap-1">
                    <span v-for="tag in specializationTags(p)" :key="tag" class="spec-tag">{{
                      tag
                    }}</span>
                  </span>

                  <span v-else-if="row.key === 'desc'" class="text-muted compare-description">
                    {{ shortDescription(p.description) }}
                  </span>

                  <a
                    v-else-if="row.key === 'link' && p.websiteUrl"
                    :href="p.websiteUrl"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-sm btn-gpe-primary"
                  >
                    Visit →
                  </a>

                  <span v-else-if="row.key === 'link'">-</span>

                  <span v-else>{{ row.value(p) }}</span>
                </td>
                <td v-if="userStore.compareList.length < 3"></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex gap-2 mt-3 justify-content-end">
          <button class="btn btn-outline-danger btn-sm" @click="userStore.clearCompare()">
            <i class="bi bi-trash me-1"></i>Clear All
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const settingsStore = useSettingsStore()
const userStore = useUserStore()

watch(
  () => [
    settingsStore.selectedCurrency,
    ...userStore.compareList.map((program) => program.currency),
  ],
  () => settingsStore.fetchRatesForPrograms(userStore.compareList),
  { immediate: true },
)

const countryFlags = {
  Australia: '🇦🇺',
  Canada: '🇨🇦',
  Germany: '🇩🇪',
  'New Zealand': '🇳🇿',
  Ireland: '🇮🇪',
  Japan: '🇯🇵',
  Netherlands: '🇳🇱',
  Spain: '🇪🇸',
}

function formatTuition(p) {
  return settingsStore.formatMoney(p.tuitionFee, p.currency)
}

function feeBasisLabel(feeBasis) {
  return { annual: '/yr', total: 'total', per_term: '/term' }[feeBasis] || ''
}

function specializationTags(p) {
  return (p.specialization || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function shortDescription(description) {
  if (!description) return '-'
  return description.length > 120 ? `${description.slice(0, 120)}...` : description
}

const compareRows = [
  { key: 'type', label: 'Program Type' },
  { key: 'country', label: 'Country', highlight: true },
  { key: 'city', label: 'City', value: (p) => p.city || '-' },
  { key: 'duration', label: 'Duration', highlight: true },
  { key: 'tuition', label: 'Tuition Fee' },
  { key: 'language', label: 'Language', value: (p) => p.language || '-', highlight: true },
  { key: 'specialization', label: 'Specializations' },
  { key: 'desc', label: 'Description', highlight: true },
  { key: 'link', label: 'Official Link' },
]
</script>

<style scoped>
.compare-description {
  display: inline-block;
  font-size: 0.8rem;
  line-height: 1.45;
}
.compare-page {
  min-height: 70vh;
}
</style>
