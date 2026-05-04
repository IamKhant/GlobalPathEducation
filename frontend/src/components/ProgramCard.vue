<template>
  <div class="program-card h-100" @click="$router.push(`/programs/${program.id}`)">
    <!-- Country color banner -->
    <div class="card-banner" :style="{ background: countryGradient }">
      <div class="card-banner-flag">{{ countryFlag }}</div>
      <span :class="['badge-type', program.type === 'Master' ? 'badge-master' : 'badge-bootcamp']">
        {{ program.type }}
      </span>
      <div class="card-actions" @click.stop>
        <button
          v-if="isSignedIn"
          class="card-action-btn"
          :class="{ active: userStore.bookmarkedIds.has(program.id) }"
          @click="userStore.toggleBookmark(program)"
          :title="userStore.bookmarkedIds.has(program.id) ? 'Remove bookmark' : 'Save program'"
        >
          <i
            :class="
              userStore.bookmarkedIds.has(program.id) ? 'bi bi-bookmark-fill' : 'bi bi-bookmark'
            "
          ></i>
        </button>
        <button
          class="card-action-btn"
          :class="{ active: isInCompare }"
          @click="toggleCompare"
          title="Add to compare"
        >
          <i class="bi bi-bar-chart-steps"></i>
        </button>
      </div>
    </div>

    <div class="card-body d-flex flex-column">
      <!-- University avatar + name -->
      <div class="d-flex align-items-center gap-2 mb-2">
        <div class="uni-avatar" :style="{ background: countryGradient }">
          {{ program.institution.charAt(0) }}
        </div>
        <div class="card-institution">{{ program.institution }}</div>
      </div>

      <h6 class="card-title mb-1">{{ program.title }}</h6>

      <div class="card-location mb-3">
        <i class="bi bi-geo-alt-fill me-1" style="font-size: 0.7rem"></i>
        {{ program.city }}, {{ program.country }}
      </div>

      <div class="mb-3 flex-grow-1">
        <span v-for="tag in specTags" :key="tag" class="spec-tag">{{ tag }}</span>
        <span v-if="extraTagCount > 0" class="spec-tag spec-tag-more"
          >+{{ extraTagCount }} more</span
        >
      </div>

      <div class="card-footer-row">
        <div>
          <div class="tuition-amount">{{ formattedTuition }}</div>
          <div class="tuition-basis">{{ feeBasisLabel }}</div>
        </div>
        <div class="duration-pill">
          <i class="bi bi-clock me-1"></i>{{ program.durationMonths }}mo
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useAuth } from '@clerk/vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import { getCountryFlag } from '@/utils/countryFlags'
import { getCountryGradient } from '@/utils/countryStyles'

const props = defineProps({ program: { type: Object, required: true } })
const { isSignedIn } = useAuth()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const isInCompare = computed(() => userStore.compareList.some((p) => p.id === props.program.id))

onMounted(() => settingsStore.fetchRate(props.program.currency))
watch(
  () => settingsStore.selectedCurrency,
  () => settingsStore.fetchRate(props.program.currency),
)

function toggleCompare() {
  if (isInCompare.value) userStore.removeFromCompare(props.program.id)
  else userStore.addToCompare(props.program)
}

const countryGradient = computed(() => getCountryGradient(props.program.country))
const countryFlag = computed(() => getCountryFlag(props.program.country))
const allTags = computed(
  () =>
    props.program.specialization
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean) || [],
)
const specTags = computed(() => allTags.value.slice(0, 2))
const extraTagCount = computed(() => Math.max(0, allTags.value.length - 2))
const formattedTuition = computed(() =>
  settingsStore.formatMoney(props.program.tuitionFee, props.program.currency),
)
const feeBasisLabel = computed(
  () => ({ annual: '/ year', total: 'total', per_term: '/ term' })[props.program.feeBasis] || '',
)
</script>

<style scoped>
.program-card {
  border: 1px solid #e8eef5;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(26, 58, 92, 0.07);
  transition:
    transform 0.22s ease,
    box-shadow 0.22s ease,
    border-color 0.22s ease;
  cursor: pointer;
  background: white;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.program-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 36px rgba(26, 58, 92, 0.15);
  border-color: #c5d8f0;
}

/* Banner */
.card-banner {
  position: relative;
  height: 72px;
  display: flex;
  align-items: flex-start;
  padding: 10px 12px;
  justify-content: space-between;
}
.card-banner-flag {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.25));
  line-height: 1;
}
.card-actions {
  display: flex;
  gap: 4px;
}
.card-action-btn {
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 8px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 0.85rem;
  transition:
    background 0.15s,
    transform 0.15s;
}
.card-action-btn:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: scale(1.1);
}
.card-action-btn.active {
  background: rgba(244, 164, 27, 0.9);
  border-color: rgba(244, 164, 27, 1);
}

/* Badge on banner */
.badge-type {
  font-size: 0.67rem;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 20px;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  position: absolute;
  bottom: 8px;
  left: 12px;
}
.badge-master {
  background: rgba(255, 255, 255, 0.92);
  color: #1a3a5c;
}
.badge-bootcamp {
  background: rgba(244, 164, 27, 0.92);
  color: #5a3a00;
}

/* Body */
.card-body {
  padding: 1rem 1.15rem 1.15rem;
  flex: 1;
}

.uni-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 800;
  font-size: 0.9rem;
  flex-shrink: 0;
  opacity: 0.9;
}
.card-institution {
  font-size: 0.78rem;
  color: #2e7dc7;
  font-weight: 600;
  line-height: 1.2;
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card-title {
  font-size: 0.93rem;
  font-weight: 700;
  color: #1a3a5c;
  line-height: 1.35;
  margin-bottom: 0.25rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card-location {
  font-size: 0.77rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
}

.spec-tag {
  display: inline-block;
  background: #f0f6ff;
  color: #2e7dc7;
  border-radius: 20px;
  padding: 2px 9px;
  font-size: 0.69rem;
  font-weight: 500;
  margin: 2px 2px 2px 0;
}
.spec-tag-more {
  background: #f1f5f9;
  color: #94a3b8;
}

.card-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-top: 0.7rem;
  border-top: 1px solid #f1f5f9;
}
.tuition-amount {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a3a5c;
  line-height: 1.1;
}
.tuition-basis {
  font-size: 0.71rem;
  color: #94a3b8;
  margin-top: 1px;
}
.duration-pill {
  display: inline-flex;
  align-items: center;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 0.73rem;
  font-weight: 600;
  color: #64748b;
}
</style>
