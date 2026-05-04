<template>
  <div class="programs-page">
    <!-- Page header bar -->
    <div class="programs-header">
      <div class="container">
        <div class="d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div>
            <h1 class="programs-title mb-0">All Programs</h1>
            <p class="programs-subtitle mb-0">
              <span v-if="programStore.loading">Searching...</span>
              <span v-else>{{ programStore.total }} programs found</span>
            </p>
          </div>

          <!-- Sort + mobile filter toggle -->
          <div class="d-flex align-items-center gap-2">
            <!-- Sort dropdown -->
            <select
              class="form-select form-select-sm sort-select"
              v-model="sortBy"
              @change="fetch(1)"
            >
              <option value="">Sort: Default</option>
              <option value="tuition_asc">Price: Low → High</option>
              <option value="tuition_desc">Price: High → Low</option>
              <option value="duration_asc">Duration: Shortest</option>
              <option value="duration_desc">Duration: Longest</option>
            </select>

            <!-- Mobile filter toggle -->
            <button class="btn btn-filter-toggle d-lg-none" @click="filterOpen = !filterOpen">
              <i class="bi bi-funnel-fill me-1"></i>
              Filters
              <span v-if="activeFilters.length" class="filter-count-badge">{{
                activeFilters.length
              }}</span>
            </button>
          </div>
        </div>

        <!-- Active filter chips -->
        <div v-if="activeFilters.length" class="d-flex flex-wrap gap-2 mt-3">
          <span v-for="f in activeFilters" :key="f.key" class="filter-chip">
            {{ f.label }}
            <button class="filter-chip-remove" @click="clearFilter(f.key)">
              <i class="bi bi-x"></i>
            </button>
          </span>
          <button class="filter-chip filter-chip-clear" @click="resetAndFetch">Clear all</button>
        </div>
      </div>
    </div>

    <div class="container py-4">
      <div class="row g-4">
        <!-- ── FILTER SIDEBAR ── -->
        <!-- Mobile drawer overlay -->
        <Transition name="fade">
          <div v-if="filterOpen" class="filter-overlay d-lg-none" @click="filterOpen = false"></div>
        </Transition>

        <!-- Sidebar (desktop: col, mobile: drawer) -->
        <div :class="['col-lg-3', 'filter-sidebar-col', { 'filter-open': filterOpen }]">
          <div class="filter-sidebar">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h6 class="filter-sidebar-title mb-0"><i class="bi bi-sliders me-2"></i>Filters</h6>
              <div class="d-flex gap-2 align-items-center">
                <button
                  v-if="activeFilters.length"
                  class="btn-clear-filters"
                  @click="resetAndFetch"
                >
                  Clear all
                </button>
                <!-- Mobile close -->
                <button class="btn-close d-lg-none" @click="filterOpen = false"></button>
              </div>
            </div>

            <!-- Search -->
            <div class="filter-group">
              <div class="filter-label">Search</div>
              <div class="position-relative">
                <i class="bi bi-search filter-input-icon"></i>
                <input
                  type="text"
                  class="form-control form-control-sm filter-input"
                  placeholder="Program, university..."
                  v-model="programStore.filters.search"
                  @input="debouncedFetch"
                />
              </div>
            </div>

            <!-- Program Type -->
            <div class="filter-group">
              <div class="filter-label">Program Type</div>
              <div class="type-toggle-group">
                <button
                  v-for="t in ['All', 'Master', 'Bootcamp']"
                  :key="t"
                  :class="[
                    'type-toggle-btn',
                    { active: (programStore.filters.type || 'All') === t },
                  ]"
                  @click="setType(t)"
                >
                  <i
                    :class="[
                      'me-1',
                      t === 'Master'
                        ? 'bi bi-mortarboard'
                        : t === 'Bootcamp'
                          ? 'bi bi-lightning'
                          : 'bi bi-grid',
                    ]"
                  ></i>
                  {{ t }}
                </button>
              </div>
            </div>

            <!-- Country -->
            <div class="filter-group">
              <div class="filter-label">Country</div>
              <div class="country-list">
                <button
                  v-for="c in ['', ...programStore.meta.countries]"
                  :key="c"
                  :class="['country-btn', { active: programStore.filters.country === c }]"
                  @click="setCountry(c)"
                >
                  <span v-if="c" class="me-1">{{ getCountryFlag(c) }}</span>
                  <span v-else class="me-1">🌐</span>
                  {{ c || 'All Countries' }}
                </button>
              </div>
            </div>

            <!-- Specialization -->
            <div class="filter-group">
              <div class="filter-label">Specialization</div>
              <div class="position-relative">
                <i class="bi bi-tag filter-input-icon"></i>
                <input
                  type="text"
                  class="form-control form-control-sm filter-input"
                  placeholder="e.g. AI, Cybersecurity..."
                  v-model="programStore.filters.specialization"
                  @input="debouncedFetch"
                />
              </div>
            </div>

            <!-- Duration -->
            <div class="filter-group">
              <div class="filter-label">Max Duration</div>
              <div class="duration-options">
                <button
                  v-for="d in durationOptions"
                  :key="d.value"
                  :class="['duration-btn', { active: maxDuration === d.value }]"
                  @click="setDuration(d.value)"
                >
                  {{ d.label }}
                </button>
              </div>
            </div>

            <!-- Mobile apply button -->
            <button class="btn btn-primary w-100 d-lg-none mt-2" @click="filterOpen = false">
              Show {{ programStore.total }} Results
            </button>
          </div>
        </div>

        <!-- ── PROGRAMS GRID ── -->
        <div class="col-lg-9">
          <!-- Loading skeleton -->
          <div v-if="programStore.loading" class="row g-4">
            <div v-for="i in 6" :key="i" class="col-sm-6 col-xl-4">
              <div class="program-card h-100" style="min-height: 280px">
                <div
                  style="height: 72px; background: linear-gradient(135deg, #e2e8f0, #cbd5e1)"
                ></div>
                <div class="card-body">
                  <div class="placeholder-glow d-flex flex-column gap-2">
                    <div class="placeholder rounded-pill" style="height: 14px; width: 60%"></div>
                    <div class="placeholder rounded" style="height: 18px; width: 90%"></div>
                    <div class="placeholder rounded" style="height: 18px; width: 75%"></div>
                    <div
                      class="placeholder rounded"
                      style="height: 12px; width: 45%; margin-top: 4px"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Programs grid -->
          <div v-else-if="programStore.programs.length" class="row g-4">
            <div v-for="p in programStore.programs" :key="p.id" class="col-sm-6 col-xl-4">
              <ProgramCard :program="p" />
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="empty-state">
            <div class="empty-icon">🔍</div>
            <h5 class="empty-title">No programs found</h5>
            <p class="empty-subtitle">Try adjusting your filters or search terms</p>
            <button class="btn btn-outline-primary rounded-pill px-4" @click="resetAndFetch">
              Clear all filters
            </button>
          </div>

          <!-- Pagination -->
          <div v-if="programStore.totalPages > 1" class="d-flex justify-content-center mt-5">
            <nav aria-label="Program pages">
              <ul class="pagination pagination-gpe">
                <li class="page-item" :class="{ disabled: programStore.currentPage === 1 }">
                  <button class="page-link" @click="fetch(programStore.currentPage - 1)">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>
                <li
                  v-for="p in visiblePages"
                  :key="p"
                  class="page-item"
                  :class="{ active: p === programStore.currentPage, disabled: p === '…' }"
                >
                  <button class="page-link" @click="p !== '…' && fetch(p)">{{ p }}</button>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: programStore.currentPage === programStore.totalPages }"
                >
                  <button class="page-link" @click="fetch(programStore.currentPage + 1)">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ProgramCard from '@/components/ProgramCard.vue'
import { useProgramStore } from '@/stores/programs'
import { getCountryFlag } from '@/utils/countryFlags'

const route = useRoute()
const programStore = useProgramStore()

const maxDuration = ref('')
const sortBy = ref('')
const filterOpen = ref(false)
let debounceTimer = null

const durationOptions = [
  { value: '', label: 'Any' },
  { value: '6', label: '≤ 6 mo' },
  { value: '12', label: '≤ 1 yr' },
  { value: '18', label: '≤ 1.5 yr' },
  { value: '24', label: '≤ 2 yr' },
]

onMounted(async () => {
  await programStore.fetchMeta()
  applyQueryFilters()
  fetch(1)
})

watch(
  () => route.query,
  () => {
    applyQueryFilters()
    fetch(1)
  },
)

function queryValue(v) {
  return Array.isArray(v) ? v[0] || '' : v || ''
}

function applyQueryFilters() {
  programStore.setFilter('search', queryValue(route.query.search))
  programStore.setFilter('country', queryValue(route.query.country))
  programStore.setFilter('type', queryValue(route.query.type))
  programStore.setFilter('specialization', queryValue(route.query.specialization))
  maxDuration.value = queryValue(route.query.duration)
  sortBy.value = queryValue(route.query.sort)
  programStore.setFilter('duration', maxDuration.value)
  programStore.setFilter('sort', sortBy.value)
}

function fetch(page = 1) {
  programStore.setFilter('duration', maxDuration.value)
  programStore.setFilter('sort', sortBy.value)
  programStore.fetchPrograms(page)
}

function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetch(1), 380)
}

function resetAndFetch() {
  maxDuration.value = ''
  sortBy.value = ''
  programStore.resetFilters()
  fetch(1)
}

function clearFilter(key) {
  if (key === 'duration') maxDuration.value = ''
  programStore.setFilter(key, '')
  fetch(1)
}

function setType(t) {
  programStore.setFilter('type', t === 'All' ? '' : t)
  fetch(1)
}

function setCountry(c) {
  programStore.setFilter('country', c)
  fetch(1)
}

function setDuration(v) {
  maxDuration.value = v
  fetch(1)
}

const activeFilters = computed(() => {
  const f = programStore.filters
  const list = []
  if (f.search) list.push({ key: 'search', label: `"${f.search}"` })
  if (f.type) list.push({ key: 'type', label: f.type })
  if (f.country) list.push({ key: 'country', label: f.country })
  if (f.specialization) list.push({ key: 'specialization', label: f.specialization })
  if (f.duration) list.push({ key: 'duration', label: `≤ ${f.duration} months` })
  return list
})

// Smart pagination: show first, last, current ±1, with ellipsis
const visiblePages = computed(() => {
  const total = programStore.totalPages
  const cur = programStore.currentPage
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, cur, cur - 1, cur + 1].filter((p) => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  const result = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('…')
    result.push(p)
  })
  return result
})
</script>

<style scoped>
/* ── Page Header ── */
.programs-header {
  background: white;
  border-bottom: 1px solid #e8eef5;
  padding: 1.25rem 0 1rem;
  position: relative;
  z-index: 1;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}
.programs-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a3a5c;
  letter-spacing: -0.3px;
}
.programs-subtitle {
  font-size: 0.85rem;
  color: #94a3b8;
  margin-top: 2px;
}

/* Sort */
.sort-select {
  border-radius: 10px;
  font-size: 0.84rem;
  border-color: #dbe3ef;
  background: #f8fafc;
  min-width: 180px;
}

/* Mobile filter toggle */
.btn-filter-toggle {
  background: #1a3a5c;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 6px 14px;
  font-size: 0.84rem;
  font-weight: 600;
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}
.filter-count-badge {
  background: #f4a41b;
  color: #1a3a5c;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 0.7rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: 2px;
}

/* Active filter chips */
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 20px;
  padding: 3px 10px 3px 12px;
  font-size: 0.78rem;
  font-weight: 500;
}
.filter-chip-remove {
  background: none;
  border: none;
  cursor: pointer;
  color: #2563eb;
  padding: 0;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  opacity: 0.7;
  line-height: 1;
}
.filter-chip-remove:hover {
  opacity: 1;
}
.filter-chip-clear {
  background: #fee2e2;
  color: #dc2626;
  border-color: #fecaca;
  cursor: pointer;
}

/* ── Sidebar ── */
.filter-sidebar-col {
  position: relative;
}

.filter-sidebar {
  background: white;
  border: 1px solid #e8eef5;
  border-radius: 16px;
  padding: 1.4rem;
  box-shadow: 0 2px 12px rgba(26, 58, 92, 0.06);
  position: sticky;
  top: 90px;
}

.filter-sidebar-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1a3a5c;
}
.btn-clear-filters {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 0.78rem;
  cursor: pointer;
  padding: 0;
}
.btn-clear-filters:hover {
  color: #dc2626;
}

.filter-group {
  margin-bottom: 1.4rem;
}
.filter-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #94a3b8;
  margin-bottom: 0.6rem;
}

.filter-input {
  border-radius: 10px;
  padding-left: 32px;
  background: #f8fafc;
  border-color: #dbe3ef;
  font-size: 0.84rem;
}
.filter-input:focus {
  background: white;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
.filter-input-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.82rem;
}

/* Type toggle */
.type-toggle-group {
  display: flex;
  gap: 6px;
}
.type-toggle-btn {
  flex: 1;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 10px;
  padding: 6px 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.type-toggle-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
  background: #eff6ff;
}
.type-toggle-btn.active {
  background: #1a3a5c;
  color: white;
  border-color: #1a3a5c;
}

/* Country list */
.country-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.country-btn {
  text-align: left;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 0.82rem;
  color: #334155;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  align-items: center;
}
.country-btn:hover {
  background: #f0f6ff;
  color: #1a3a5c;
}
.country-btn.active {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #1a3a5c;
  font-weight: 600;
}

/* Duration options */
.duration-options {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.duration-btn {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 8px;
  padding: 4px 10px;
  font-size: 0.77rem;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s;
}
.duration-btn:hover {
  border-color: #2563eb;
  color: #2563eb;
}
.duration-btn.active {
  background: #1a3a5c;
  color: white;
  border-color: #1a3a5c;
}

/* ── Mobile filter drawer ── */
.filter-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 200;
  backdrop-filter: blur(2px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 991.98px) {
  .programs-header {
    position: relative;
    top: auto;
  }

  .filter-sidebar-col {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: min(320px, 86vw);
    z-index: 201;
    transform: translateX(-100%);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .filter-sidebar-col.filter-open {
    transform: translateX(0);
  }
  .filter-sidebar {
    height: 100%;
    border-radius: 0;
    border-left: none;
    border-top: none;
    border-bottom: none;
    overflow-y: auto;
    position: static;
    top: auto;
  }
}

/* ── Empty state ── */
.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  background: white;
  border-radius: 16px;
  border: 1px solid #e8eef5;
}
.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
.empty-title {
  font-weight: 700;
  color: #1a3a5c;
  margin-bottom: 0.5rem;
}
.empty-subtitle {
  color: #94a3b8;
  margin-bottom: 1.5rem;
}

/* ── Pagination ── */
.pagination-gpe .page-link {
  border-radius: 8px !important;
  margin: 0 2px;
  border: 1px solid #e2e8f0;
  color: #334155;
  font-weight: 500;
  font-size: 0.88rem;
  padding: 6px 12px;
  transition: all 0.15s;
}
.pagination-gpe .page-item.active .page-link {
  background: #1a3a5c;
  border-color: #1a3a5c;
  color: white;
}
.pagination-gpe .page-link:hover {
  background: #eff6ff;
  color: #2563eb;
  border-color: #bfdbfe;
}

.programs-page {
  min-height: 80vh;
  background: #f8fafc;
}
</style>
