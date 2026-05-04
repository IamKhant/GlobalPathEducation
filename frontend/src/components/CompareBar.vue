<template>
  <div class="compare-bar">
    <div class="compare-bar-summary">
      <i class="bi bi-bar-chart-steps"></i>
      <span>{{ userStore.compareList.length }}/3 programs selected</span>
    </div>

    <div class="compare-bar-items">
      <span v-for="program in userStore.compareList" :key="program.id" class="compare-chip">
        {{ program.title }}
        <button
          type="button"
          class="compare-chip-remove"
          :aria-label="`Remove ${program.title} from compare`"
          @click="userStore.removeFromCompare(program.id)"
        >
          <i class="bi bi-x"></i>
        </button>
      </span>
    </div>

    <div class="compare-bar-actions">
      <RouterLink to="/compare" class="btn btn-sm btn-warning fw-bold">Compare</RouterLink>
      <button
        type="button"
        class="btn btn-sm btn-outline-light"
        @click="userStore.clearCompareList()"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
</script>

<style scoped>
.compare-bar {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  left: 1rem;
  z-index: 1040;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 14px;
  background: #0d1f33;
  color: #ffffff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.24);
}

.compare-bar-summary,
.compare-bar-actions {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  flex-shrink: 0;
}

.compare-bar-summary {
  font-size: 0.9rem;
  font-weight: 800;
}

.compare-bar-items {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  flex: 1;
  overflow-x: auto;
}

.compare-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  max-width: 240px;
  padding: 0.35rem 0.45rem 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.compare-chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
  line-height: 1;
}

.compare-chip-remove:hover {
  background: rgba(255, 255, 255, 0.28);
}

@media (max-width: 767.98px) {
  .compare-bar {
    align-items: stretch;
    flex-direction: column;
    gap: 0.7rem;
  }

  .compare-bar-actions {
    justify-content: flex-end;
  }
}
</style>
