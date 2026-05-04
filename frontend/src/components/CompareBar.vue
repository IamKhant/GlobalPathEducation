<template>
  <div class="program-card h-100" @click="$router.push(`/programs/${program.id}`)">
    <div class="card-body d-flex flex-column">
      <!-- Header row -->
      <div class="d-flex justify-content-between align-items-start mb-2">
        <span
          :class="['badge-type', program.type === 'Master' ? 'badge-master' : 'badge-bootcamp']"
        >
          {{ program.type }}
        </span>
        <div class="d-flex gap-1" @click.stop>
          <button
            v-if="isSignedIn"
            class="btn-bookmark"
            :class="{ bookmarked: userStore.bookmarkedIds.has(program.id) }"
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
            class="btn-bookmark"
            :class="{ bookmarked: isInCompare }"
            @click="toggleCompare"
            title="Compare"
          >
            <i class="bi bi-bar-chart-steps"></i>
          </button>
        </div>
      </div>

      <!-- Title -->
      <h6 class="card-title mb-1">{{ program.title }}</h6>
      <div class="card-institution mb-1">{{ program.institution }}</div>
      <div class="card-location mb-3">
        <span class="country-flag">{{ countryFlag }}</span>
        {{ program.city }}, {{ program.country }}
      </div>

      <!-- Specs tags -->
      <div class="mb-3 flex-grow-1">
        <span v-for="tag in specTags" :key="tag" class="spec-tag">{{ tag }}</span>
      </div>

      <!-- Footer -->
      <div class="d-flex justify-content-between align-items-end pt-2 border-top">
        <div>
          <div class="tuition-amount">{{ formattedTuition }}</div>
          <div class="tuition-basis">{{ feeBasisLabel }}</div>
        </div>
        <div class="text-end">
          <div class="small fw-semibold text-secondary">{{ program.durationMonths }} months</div>
          <div class="small text-muted">{{ program.language }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuth } from '@clerk/vue'
import { useUserStore } from '@/stores/user'

const props = defineProps({ program: { type: Object, required: true } })
const { isSignedIn } = useAuth()
const userStore = useUserStore()

const isInCompare = computed(() => userStore.compareList.some((p) => p.id === props.program.id))

function toggleCompare() {
  if (isInCompare.value) {
    userStore.removeFromCompare(props.program.id)
  } else {
    userStore.addToCompare(props.program)
  }
}

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
const countryFlag = computed(() => countryFlags[props.program.country] || '🌏')

const specTags = computed(() => {
  const tags =
    props.program.specialization
      ?.split(',')
      .map((t) => t.trim())
      .filter(Boolean) || []
  return tags.slice(0, 3)
})

const formattedTuition = computed(() => {
  const { tuitionFee, currency } = props.program
  if (tuitionFee === 0) return 'Free'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(tuitionFee)
})

const feeBasisLabel = computed(() => {
  const map = { annual: '/ year', total: 'total', per_term: '/ term' }
  return map[props.program.feeBasis] || ''
})
</script>
