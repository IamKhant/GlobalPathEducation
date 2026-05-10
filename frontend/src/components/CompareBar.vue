<template>
  <div :class="['compare-bar', { collapsed: isCollapsed }]">
    <!-- Collapsed state: compact pill -->
    <template v-if="isCollapsed">
      <button type="button" class="compare-bar-expand" @click="isCollapsed = false">
        <i class="bi bi-bar-chart-steps"></i>
        <span class="compare-bar-badge">{{ userStore.compareList.length }}</span>
        <i class="bi bi-chevron-up"></i>
      </button>
    </template>

    <!-- Expanded state: full bar -->
    <template v-else>
      <div class="compare-bar-summary">
        <i class="bi bi-bar-chart-steps"></i>
        <span>{{ settingsStore.t('compareBar.selected', { count: userStore.compareList.length }) }}</span>
      </div>

      <div class="compare-bar-items">
        <span v-for="program in userStore.compareList" :key="program.id" class="compare-chip">
          <span class="compare-chip-title">
            {{ program.title }}
          </span>
          <button
            type="button"
            class="compare-chip-remove"
            :aria-label="settingsStore.t('compareBar.remove', { title: program.title })"
            @click="userStore.removeFromCompare(program.id)"
          >
            <i class="bi bi-x"></i>
          </button>
        </span>

        <span
          v-for="index in emptySlots"
          :key="`empty-${index}`"
          class="compare-chip compare-chip-empty"
        >
          <span class="compare-chip-title">&nbsp;</span>
        </span>
      </div>

      <div class="compare-bar-actions">
        <RouterLink to="/compare" class="btn btn-sm btn-warning fw-bold">{{ settingsStore.t('compareBar.compare') }}</RouterLink>
        <button
          type="button"
          class="btn btn-sm btn-outline-light"
          @click="userStore.clearCompareList()"
        >
          {{ settingsStore.t('compareBar.clear') }}
        </button>
        <button
          type="button"
          class="compare-bar-collapse-btn"
          title="Minimize"
          @click="isCollapsed = true"
        >
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'

const settingsStore = useSettingsStore()
const userStore = useUserStore()
const isCollapsed = ref(false)

const emptySlots = computed(() => Math.max(0, 3 - userStore.compareList.length))
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
  animation: slideInUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Collapsed state */
.compare-bar.collapsed {
  left: auto;
  padding: 0;
  border-radius: 999px;
  background: transparent;
  box-shadow: none;
}

.compare-bar-expand {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.55rem 0.85rem;
  border: 0;
  border-radius: 999px;
  background: #0d1f33;
  color: #ffffff;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.compare-bar-expand:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.35);
  background: #162d48;
}

.compare-bar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: #f4a41b;
  color: #0f172a;
  font-size: 0.72rem;
  font-weight: 900;
}

/* Collapse button in expanded bar */
.compare-bar-collapse-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
  flex-shrink: 0;
}

.compare-bar-collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
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
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: center;
  gap: 0.45rem;
  min-width: 0;
  flex: 1;
}

.compare-chip {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
  min-width: 0;
  width: 100%;
  padding: 0.35rem 0.45rem 0.35rem 0.7rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.94);
  font-size: 0.78rem;
  font-weight: 700;
}

.compare-chip-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.compare-chip-empty {
  opacity: 0.35;
  pointer-events: none;
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
  .compare-bar:not(.collapsed) {
    align-items: stretch;
    flex-direction: column;
    gap: 0.7rem;
  }

  .compare-bar-actions {
    justify-content: flex-end;
  }
}
</style>
