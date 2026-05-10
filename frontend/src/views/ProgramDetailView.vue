<template>
  <div class="program-detail-page">
    <!-- Breadcrumb bar -->
    <div class="breadcrumb-bar">
      <div class="container">
        <button class="back-btn" @click="$router.back()">
          <i class="bi bi-arrow-left me-2"></i>{{ settingsStore.t('programDetail.back') }}
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="container py-5 text-center">
      <div class="spinner-border" style="color: #2e7dc7; width: 2.5rem; height: 2.5rem"></div>
      <p class="text-muted mt-3 small">{{ settingsStore.t('programDetail.loading') }}</p>
    </div>

    <!-- Program found -->
    <div v-else-if="program">
      <!-- Hero banner -->
      <div class="detail-hero" :style="{ background: countryGradient }">
        <div class="container">
          <div class="d-flex align-items-center gap-3 mb-3">
            <div class="hero-avatar">{{ program.institution.charAt(0) }}</div>
            <div>
              <span
                :class="[
                  'hero-badge',
                  program.type === 'Master' ? 'badge-master' : 'badge-bootcamp',
                ]"
              >
                {{ program.type }}
              </span>
              <div class="hero-country mt-1">
                {{ countryFlag }} {{ program.city }}, {{ program.country }}
              </div>
            </div>
          </div>
          <h1 class="hero-title">{{ displayTitle }}</h1>
          <p class="hero-institution">{{ program.institution }}</p>
        </div>
      </div>

      <div class="container py-4">
        <div class="row g-4">
          <!-- ── MAIN CONTENT ── -->
          <div class="col-lg-8">
            <!-- Quick stats strip -->
            <div class="stats-strip mb-4 animate-in">
              <div class="stat-item">
                <i class="bi bi-clock stat-icon"></i>
                <div>
                  <div class="stat-value">{{ program.durationMonths }} months</div>
                  <div class="stat-label">{{ settingsStore.t('programDetail.duration') }}</div>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <i class="bi bi-translate stat-icon"></i>
                <div>
                  <div class="stat-value">{{ program.language }}</div>
                  <div class="stat-label">{{ settingsStore.t('programDetail.language') }}</div>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <i class="bi bi-geo-alt stat-icon"></i>
                <div>
                  <div class="stat-value">{{ program.city }}</div>
                  <div class="stat-label">{{ settingsStore.t('programDetail.city') }}</div>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <i class="bi bi-cash-stack stat-icon"></i>
                <div>
                  <div class="stat-value">{{ program.currency }}</div>
                  <div class="stat-label">{{ settingsStore.t('programDetail.currency') }}</div>
                </div>
              </div>
            </div>

            <!-- About -->
            <div class="detail-card mb-4">
              <h5 class="detail-card-title">
                <i class="bi bi-info-circle me-2"></i>{{ settingsStore.t('programDetail.about') }}
                <span v-if="translationLoading" class="translation-status">{{ settingsStore.t('programDetail.translating') }}</span>
              </h5>
              <p class="detail-description">{{ displayDescription }}</p>
            </div>

            <!-- Specializations -->
            <div class="detail-card mb-4">
              <h5 class="detail-card-title"><i class="bi bi-tags me-2"></i>{{ settingsStore.t('programDetail.specializations') }}</h5>
              <div class="d-flex flex-wrap gap-2 mt-3">
                <span v-for="tag in allTags" :key="tag" class="spec-tag-lg">
                  {{ tag }}
                </span>
              </div>
            </div>

            <!-- Notes -->
            <div v-if="program.notes" class="detail-card detail-card-note mb-4">
              <h5 class="detail-card-title">
                <i class="bi bi-sticky me-2 text-warning"></i>{{ settingsStore.t('programDetail.notes') }}
              </h5>
              <p class="text-muted mb-0 small lh-lg">{{ program.notes }}</p>
            </div>
          </div>

          <!-- ── SIDEBAR ── -->
          <div class="col-lg-4">
            <div class="detail-sidebar">
              <!-- Tuition -->
              <div class="tuition-block mb-4">
                <div class="tuition-label">{{ settingsStore.t('programDetail.tuition') }}</div>
                <div class="tuition-big">{{ formattedTuition }}</div>
                <div class="tuition-basis-text">{{ feeBasisLabel }}</div>
              </div>

              <hr class="sidebar-divider" />

              <!-- Info rows -->
              <div class="info-rows mb-4">
                <div class="info-row">
                  <span class="info-row-label"><i class="bi bi-clock me-2"></i>{{ settingsStore.t('programDetail.duration') }}</span>
                  <span class="info-row-value">{{ program.durationMonths }} months</span>
                </div>
                <div class="info-row">
                  <span class="info-row-label"><i class="bi bi-translate me-2"></i>{{ settingsStore.t('programDetail.language') }}</span>
                  <span class="info-row-value">{{ program.language }}</span>
                </div>
                <div class="info-row">
                  <span class="info-row-label"><i class="bi bi-geo-alt me-2"></i>{{ settingsStore.t('programDetail.location') }}</span>
                  <span class="info-row-value">{{ program.city }}, {{ program.country }}</span>
                </div>
                <div class="info-row">
                  <span class="info-row-label"><i class="bi bi-mortarboard me-2"></i>{{ settingsStore.t('programDetail.type') }}</span>
                  <span class="info-row-value">{{ program.type }}</span>
                </div>
                <div class="info-row">
                  <span class="info-row-label"><i class="bi bi-cash me-2"></i>{{ settingsStore.t('programDetail.feeBasis') }}</span>
                  <span class="info-row-value text-capitalize">{{
                    program.feeBasis?.replace('_', ' ')
                  }}</span>
                </div>
              </div>

              <hr class="sidebar-divider" />

              <!-- Action buttons -->
              <div class="d-flex flex-column gap-2 mt-3">
                <a
                  v-if="program.websiteUrl"
                  :href="program.websiteUrl"
                  target="_blank"
                  rel="noopener"
                  class="btn btn-sidebar-primary"
                >
                  <i class="bi bi-box-arrow-up-right me-2"></i>{{ settingsStore.t('programDetail.visit') }}
                </a>

                <button
                  v-if="isSignedIn"
                  class="btn"
                  :class="isBookmarked ? 'btn-sidebar-saved' : 'btn-sidebar-outline'"
                  @click="toggleBookmark"
                >
                  <i
                    :class="isBookmarked ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'"
                    class="me-2"
                  ></i>
                  {{ isBookmarked ? settingsStore.t('programDetail.saved') : settingsStore.t('programDetail.save') }}
                </button>
                <RouterLink v-else to="/sign-in" class="btn btn-sidebar-outline">
                  <i class="bi bi-bookmark me-2"></i>{{ settingsStore.t('programDetail.signInSave') }}
                </RouterLink>

                <RouterLink
                  :to="`/consult?programId=${program.id}`"
                  class="btn btn-sidebar-consult"
                >
                  <i class="bi bi-calendar-check me-2"></i>{{ settingsStore.t('programDetail.bookConsultation') }}
                </RouterLink>

                <button
                  class="btn btn-sidebar-compare"
                  :class="{ active: isInCompare }"
                  @click="toggleCompare"
                >
                  <i class="bi bi-bar-chart-steps me-2"></i>
                  {{ isInCompare ? settingsStore.t('programDetail.removeCompare') : settingsStore.t('programDetail.addCompare') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not found -->
    <div v-else class="container py-5 text-center">
      <div style="font-size: 3rem; margin-bottom: 1rem">😕</div>
      <h4 class="fw-bold mb-2">{{ settingsStore.t('programDetail.notFoundTitle') }}</h4>
      <p class="text-muted mb-4">{{ settingsStore.t('programDetail.notFoundText') }}</p>
      <RouterLink to="/programs" class="btn btn-primary rounded-pill px-4">
        {{ settingsStore.t('programDetail.browseAll') }}
      </RouterLink>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useAuth } from '@clerk/vue'
import { useProgramStore } from '@/stores/programs'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { getCountryFlag } from '@/utils/countryFlags'
import { getCountryGradient } from '@/utils/countryStyles'
import api from '@/api'

const route = useRoute()
const { isSignedIn } = useAuth()
const programStore = useProgramStore()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const program = ref(null)
const activeTranslation = ref(null)
const translationLoading = ref(false)
const loading = ref(true)

onMounted(async () => {
  try {
    const { data } = await api.get(`/api/programs/${route.params.id}`)
    program.value = data
    await settingsStore.fetchRate(data.currency)
    await loadProgramTranslation()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

watch(
  () => settingsStore.selectedCurrency,
  () => {
    if (program.value) settingsStore.fetchRate(program.value.currency)
  },
)

watch(
  () => settingsStore.selectedLanguage,
  () => loadProgramTranslation(),
)
const countryGradient = computed(() => getCountryGradient(program.value?.country))
const countryFlag = computed(() => getCountryFlag(program.value?.country))
const displayTitle = computed(() => activeTranslation.value?.title || program.value?.title || '')
const displayDescription = computed(
  () => activeTranslation.value?.description || program.value?.description || '',
)
const displaySpecialization = computed(
  () => activeTranslation.value?.specialization || program.value?.specialization || '',
)
const allTags = computed(
  () =>
    displaySpecialization.value
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean) || [],
)
const isBookmarked = computed(() => userStore.bookmarkedIds.has(program.value?.id))
const isInCompare = computed(() => userStore.compareList.some((p) => p.id === program.value?.id))

const formattedTuition = computed(() => {
  if (!program.value) return ''
  return settingsStore.formatMoney(
    program.value.tuitionFee,
    program.value.currency,
    settingsStore.t('programDetail.lowCost'),
  )
})
const feeBasisLabel = computed(() => {
  return (
    { annual: settingsStore.t('programDetail.feeAnnual'), total: settingsStore.t('programDetail.feeTotal'), per_term: settingsStore.t('programDetail.feeTerm') }[
      program.value?.feeBasis
    ] || ''
  )
})

function toggleBookmark() {
  if (program.value) userStore.toggleBookmark(program.value)
}
function toggleCompare() {
  if (!program.value) return

  if (isInCompare.value) {
    userStore.removeFromCompare(program.value.id)
  } else {
    userStore.addToCompare(program.value)
  }
}

async function loadProgramTranslation() {
  if (!program.value) return

  const language = settingsStore.selectedLanguage

  if (language === 'EN') {
    activeTranslation.value = null
    return
  }

  try {
    translationLoading.value = true
    const cachedTranslation = await programStore.fetchProgramTranslation(program.value.id, language)

    if (cachedTranslation) {
      activeTranslation.value = cachedTranslation
      return
    }

    if (!isSignedIn.value) {
      activeTranslation.value = null
      return
    }

    activeTranslation.value = await programStore.translateProgram(program.value.id, language)
  } catch (error) {
    console.error(error)
    activeTranslation.value = null
  } finally {
    translationLoading.value = false
  }
}
</script>

<style scoped>
.program-detail-page {
  background: #f8fafc;
  min-height: 100vh;
}

/* Breadcrumb */
.breadcrumb-bar {
  background: white;
  border-bottom: 1px solid #e8eef5;
  padding: 0.65rem 0;
}
.back-btn {
  background: none;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  transition: color 0.15s;
}
.back-btn i {
  transition: transform 0.2s ease;
}
.back-btn:hover {
  color: #1a3a5c;
}
.back-btn:hover i {
  transform: translateX(-4px);
}

/* Hero banner */
.detail-hero {
  padding: 2.5rem 0 2rem;
  color: white;
  position: relative;
  overflow: hidden;
}
.detail-hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
}
.detail-hero .container {
  position: relative;
  z-index: 1;
}

.hero-avatar {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}
.hero-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.badge-master {
  background: rgba(255, 255, 255, 0.9);
  color: #1a3a5c;
}
.badge-bootcamp {
  background: rgba(244, 164, 27, 0.9);
  color: #5a3a00;
}

.hero-country {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}
.hero-title {
  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 800;
  color: white;
  letter-spacing: -0.3px;
  margin-bottom: 0.25rem;
  line-height: 1.25;
}
.hero-institution {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.85);
  margin: 0;
}

/* Stats strip */
.stats-strip {
  background: white;
  border: 1px solid #e8eef5;
  border-radius: 14px;
  padding: 1.1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 0;
  box-shadow: 0 2px 8px rgba(26, 58, 92, 0.05);
  overflow-x: auto;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 100px;
}
.stat-icon {
  font-size: 1.3rem;
  color: #2e7dc7;
  flex-shrink: 0;
}
.stat-value {
  font-weight: 700;
  color: #1a3a5c;
  font-size: 0.9rem;
  white-space: nowrap;
}
.stat-label {
  font-size: 0.72rem;
  color: #94a3b8;
  white-space: nowrap;
}
.stat-divider {
  width: 1px;
  height: 36px;
  background: #e8eef5;
  margin: 0 1rem;
  flex-shrink: 0;
}

/* Detail cards */
.detail-card {
  background: white;
  border: 1px solid #e8eef5;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(26, 58, 92, 0.05);
}
.detail-card-note {
  border-left: 4px solid #f59e0b;
}
.detail-card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1a3a5c;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
}
.translation-status {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
  margin-left: 0.5rem;
}
.detail-description {
  color: #475569;
  line-height: 1.75;
  margin: 0;
}

.spec-tag-lg {
  display: inline-flex;
  align-items: center;
  background: #f0f6ff;
  color: #1a3a5c;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 5px 14px;
  font-size: 0.82rem;
  font-weight: 500;
  transition: background 0.2s ease, transform 0.15s ease;
}

.spec-tag-lg:hover {
  background: #dbeafe;
  transform: translateY(-1px);
}

/* Sidebar */
.detail-sidebar {
  background: white;
  border: 1px solid #e8eef5;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px rgba(26, 58, 92, 0.08);
  position: sticky;
  top: calc(var(--navbar-height, 80px) + 16px);
}

.tuition-block {
  text-align: center;
}
.tuition-label {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #94a3b8;
  margin-bottom: 4px;
}
.tuition-big {
  font-size: 2rem;
  font-weight: 800;
  color: #1a3a5c;
  line-height: 1;
}
.tuition-basis-text {
  font-size: 0.8rem;
  color: #94a3b8;
  margin-top: 4px;
}

.sidebar-divider {
  border-color: #f1f5f9;
  margin: 1rem 0;
}

.info-rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-row-label {
  font-size: 0.82rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
}
.info-row-value {
  font-size: 0.82rem;
  font-weight: 600;
  color: #334155;
}

/* Sidebar buttons */
.btn-sidebar-primary {
  background: #2e7dc7;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-weight: 600;
  font-size: 0.88rem;
  text-align: center;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}
.btn-sidebar-primary:hover {
  background: #1a3a5c;
  color: white;
}

.btn-sidebar-outline {
  background: transparent;
  color: #2e7dc7;
  border: 2px solid #2e7dc7;
  border-radius: 10px;
  padding: 9px 16px;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}
.btn-sidebar-outline:hover {
  background: #eff6ff;
}

.btn-sidebar-saved {
  background: #fef3c7;
  color: #92400e;
  border: 2px solid #fde68a;
  border-radius: 10px;
  padding: 9px 16px;
  font-weight: 600;
  font-size: 0.88rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-sidebar-consult {
  background: #ecfdf5;
  color: #065f46;
  border: 2px solid #a7f3d0;
  border-radius: 10px;
  padding: 9px 16px;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.15s;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-sidebar-consult:hover {
  background: #d1fae5;
}

.btn-sidebar-compare {
  background: #f8fafc;
  color: #64748b;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 9px 16px;
  font-weight: 600;
  font-size: 0.88rem;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.btn-sidebar-compare:hover {
  background: #f0f6ff;
  color: #1a3a5c;
  border-color: #bfdbfe;
}
.btn-sidebar-compare.active {
  background: #eff6ff;
  color: #1a3a5c;
  border-color: #2e7dc7;
}
</style>
