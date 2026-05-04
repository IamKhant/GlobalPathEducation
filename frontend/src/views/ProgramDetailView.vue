<template>
  <div>
    <!-- Back -->
    <div class="bg-white border-bottom py-2">
      <div class="container">
        <button class="btn btn-sm btn-link text-muted ps-0" @click="$router.back()">
          <i class="bi bi-arrow-left me-1"></i> Back to programs
        </button>
      </div>
    </div>

    <div v-if="loading" class="container py-5 text-center">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="program" class="container py-4">
      <div class="row g-4">
        <!-- Main content -->
        <div class="col-lg-8">
          <div class="bg-white rounded-3 p-4 shadow-sm mb-4">
            <!-- Type + country -->
            <div class="d-flex gap-2 mb-3">
              <span :class="['badge-type', program.type === 'Master' ? 'badge-master' : 'badge-bootcamp']">{{ program.type }}</span>
              <span class="badge" style="background:#f0f6ff; color:#1a3a5c; font-weight:500;">{{ countryFlag }} {{ program.country }}</span>
            </div>
            <h1 style="font-size:1.7rem; font-weight:800; color:var(--gpe-primary);" class="mb-1">{{ program.title }}</h1>
            <h5 class="text-secondary mb-1">{{ program.institution }}</h5>
            <p class="text-muted mb-4">
              <i class="bi bi-geo-alt me-1"></i>{{ program.city }}, {{ program.stateProvince ? program.stateProvince + ', ' : '' }}{{ program.country }}
            </p>

            <h6 class="fw-bold mb-2" style="color:var(--gpe-primary)">About This Program</h6>
            <p class="text-muted lh-lg">{{ program.description }}</p>

            <h6 class="fw-bold mb-2 mt-4" style="color:var(--gpe-primary)">Specializations</h6>
            <div>
              <span v-for="tag in allTags" :key="tag" class="spec-tag">{{ tag }}</span>
            </div>
          </div>

          <!-- Notes (if any) -->
          <div v-if="program.notes" class="bg-white rounded-3 p-4 shadow-sm mb-4">
            <h6 class="fw-bold mb-2"><i class="bi bi-info-circle me-2 text-info"></i>Additional Notes</h6>
            <p class="text-muted mb-0 small">{{ program.notes }}</p>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="col-lg-4">
          <!-- Quick info card -->
          <div class="bg-white rounded-3 p-4 shadow-sm mb-3 sticky-top" style="top: 80px;">
            <div class="tuition-amount fs-2 mb-1">{{ formattedTuition }}</div>
            <div class="tuition-basis mb-4">{{ feeBasisLabel }}</div>

            <div class="d-flex flex-column gap-3 mb-4">
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Duration</span>
                <span class="fw-semibold small">{{ program.durationMonths }} months</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Language</span>
                <span class="fw-semibold small">{{ program.language }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Location</span>
                <span class="fw-semibold small">{{ program.city }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Program Type</span>
                <span class="fw-semibold small">{{ program.type }}</span>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted small">Currency</span>
                <span class="fw-semibold small">{{ program.currency }}</span>
              </div>
            </div>

            <div class="d-flex flex-column gap-2">
              <a
                v-if="program.websiteUrl"
                :href="program.websiteUrl"
                target="_blank"
                rel="noopener"
                class="btn btn-gpe-primary w-100"
              >
                <i class="bi bi-box-arrow-up-right me-2"></i>Official Website
              </a>
              <button
                v-if="isSignedIn"
                class="btn w-100"
                :class="isBookmarked ? 'btn-warning' : 'btn-gpe-outline'"
                @click="toggleBookmark"
              >
                <i :class="isBookmarked ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'" class="me-2"></i>
                {{ isBookmarked ? 'Saved' : 'Save Program' }}
              </button>
              <RouterLink :to="`/consult?programId=${program.id}`" class="btn btn-outline-success w-100">
                <i class="bi bi-calendar-check me-2"></i>Book Consultation
              </RouterLink>
              <button class="btn btn-outline-secondary w-100" @click="addToCompare">
                <i class="bi bi-bar-chart-steps me-2"></i>
                {{ isInCompare ? 'In Compare List' : 'Add to Compare' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="container py-5 text-center">
      <div class="fs-1 mb-3">😕</div>
      <h4>Program not found</h4>
      <RouterLink to="/programs" class="btn btn-gpe-primary mt-3">Browse Programs</RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const route = useRoute()
const { isSignedIn } = useAuth()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const program = ref(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/api/programs/${route.params.id}`)
    program.value = data
    await settingsStore.fetchRate(data.currency)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

const countryFlags = { Australia: '🇦🇺', Canada: '🇨🇦', Germany: '🇩🇪', 'New Zealand': '🇳🇿', Ireland: '🇮🇪', Japan: '🇯🇵', Netherlands: '🇳🇱', Spain: '🇪🇸' }
const countryFlag = computed(() => countryFlags[program.value?.country] || '🌏')
const allTags = computed(() => program.value?.specialization?.split(',').map(t => t.trim()).filter(Boolean) || [])
const isBookmarked = computed(() => userStore.bookmarkedIds.has(program.value?.id))
const isInCompare = computed(() => userStore.compareList.some(p => p.id === program.value?.id))

const formattedTuition = computed(() => {
  if (!program.value) return ''
  return settingsStore.formatMoney(program.value.tuitionFee, program.value.currency, 'Free / Low Cost')
})
const feeBasisLabel = computed(() => {
  const map = { annual: 'per year', total: 'total program fee', per_term: 'per term' }
  return map[program.value?.feeBasis] || ''
})

function toggleBookmark() {
  if (program.value) userStore.toggleBookmark(program.value)
}
function addToCompare() {
  if (program.value && !isInCompare.value) userStore.addToCompare(program.value)
}

watch(
  () => settingsStore.selectedCurrency,
  () => {
    if (program.value) settingsStore.fetchRate(program.value.currency)
  },
)
</script>
