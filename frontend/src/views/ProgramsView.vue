<template>
  <div class="py-4 programs-page">
    <div class="container">
      <!-- Header -->
      <div class="mb-4">
        <h1 class="section-heading mb-1">All Programs</h1>
        <p class="section-subheading">{{ programStore.total }} programs found</p>
      </div>

      <div class="row g-4">
        <!-- Filters Sidebar -->
        <div class="col-lg-3">
          <div class="filter-sidebar">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0" style="color: var(--gpe-primary)">
                <i class="bi bi-funnel me-2"></i>Filters
              </h6>
              <button class="btn btn-sm btn-link text-muted p-0" @click="resetAndFetch">
                Clear all
              </button>
            </div>

            <!-- Search -->
            <div class="mb-3">
              <div class="filter-title">Search</div>
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="Program, university..."
                v-model="programStore.filters.search"
                @input="debouncedFetch"
              />
            </div>

            <!-- Type -->
            <div class="mb-3">
              <div class="filter-title">Program Type</div>
              <div class="d-flex flex-column gap-1">
                <div v-for="t in ['', 'Master', 'Bootcamp']" :key="t">
                  <label class="d-flex align-items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      :value="t"
                      v-model="programStore.filters.type"
                      @change="fetch()"
                    />
                    <span class="small">{{ t || 'All' }}</span>
                  </label>
                </div>
              </div>
            </div>

            <!-- Country -->
            <div class="mb-3">
              <div class="filter-title">Country</div>
              <select
                class="form-select form-select-sm"
                v-model="programStore.filters.country"
                @change="fetch()"
              >
                <option value="">All countries</option>
                <option v-for="c in programStore.meta.countries" :key="c" :value="c">
                  {{ c }}
                </option>
              </select>
            </div>

            <!-- Specialization -->
            <div class="mb-3">
              <div class="filter-title">Specialization</div>
              <input
                type="text"
                class="form-control form-control-sm"
                placeholder="e.g. AI, Cybersecurity..."
                v-model="programStore.filters.specialization"
                @input="debouncedFetch"
              />
            </div>

            <!-- Duration -->
            <div class="mb-3">
              <div class="filter-title">Max Duration</div>
              <select class="form-select form-select-sm" v-model="maxDuration" @change="fetch()">
                <option value="">Any</option>
                <option value="6">6 months</option>
                <option value="12">1 year</option>
                <option value="18">1.5 years</option>
                <option value="24">2 years</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Programs grid -->
        <div class="col-lg-9">
          <!-- Active filters -->
          <div v-if="activeFilters.length" class="d-flex flex-wrap gap-2 mb-3">
            <span
              v-for="f in activeFilters"
              :key="f.key"
              class="badge d-flex align-items-center gap-1 py-2 px-3"
              style="
                background: var(--gpe-light);
                color: var(--gpe-secondary);
                font-size: 0.8rem;
                font-weight: 500;
              "
            >
              {{ f.label }}
              <button
                class="btn-close ms-1"
                style="font-size: 0.6rem"
                @click="clearFilter(f.key)"
              ></button>
            </span>
          </div>

          <!-- Loading -->
          <div v-if="programStore.loading" class="row g-4">
            <div v-for="i in 6" :key="i" class="col-md-6 col-xl-4">
              <div class="program-card h-100">
                <div class="card-body">
                  <div class="placeholder-glow">
                    <div
                      class="placeholder col-4 mb-3"
                      style="height: 22px; border-radius: 20px"
                    ></div>
                    <div class="placeholder col-10 mb-2" style="height: 18px"></div>
                    <div class="placeholder col-7 mb-3" style="height: 14px"></div>
                    <div class="placeholder col-12 mb-2" style="height: 12px"></div>
                    <div class="placeholder col-8" style="height: 12px"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Programs -->
          <div v-else-if="programStore.programs.length" class="row g-4">
            <div v-for="p in programStore.programs" :key="p.id" class="col-md-6 col-xl-4">
              <ProgramCard :program="p" />
            </div>
          </div>

          <!-- Empty state -->
          <div v-else class="text-center py-5">
            <div class="fs-1 mb-3">🔍</div>
            <h5>No programs found</h5>
            <p class="text-muted">Try adjusting your filters</p>
            <button class="btn btn-gpe-outline" @click="resetAndFetch">Clear Filters</button>
          </div>

          <!-- Pagination -->
          <div v-if="programStore.totalPages > 1" class="d-flex justify-content-center mt-4">
            <nav>
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: programStore.currentPage === 1 }">
                  <button class="page-link" @click="fetch(programStore.currentPage - 1)">‹</button>
                </li>
                <li
                  v-for="p in programStore.totalPages"
                  :key="p"
                  class="page-item"
                  :class="{ active: p === programStore.currentPage }"
                >
                  <button class="page-link" @click="fetch(p)">{{ p }}</button>
                </li>
                <li
                  class="page-item"
                  :class="{ disabled: programStore.currentPage === programStore.totalPages }"
                >
                  <button class="page-link" @click="fetch(programStore.currentPage + 1)">›</button>
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
import { ref, computed, onMounted } from 'vue'
import ProgramCard from '@/components/ProgramCard.vue'
import { useProgramStore } from '@/stores/programs'

const programStore = useProgramStore()
const maxDuration = ref('')
let debounceTimer = null

onMounted(() => fetch(1))

function fetch(page = 1) {
  programStore.setFilter('duration', maxDuration.value)
  programStore.fetchPrograms(page)
}

function debouncedFetch() {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetch(1), 400)
}

function resetAndFetch() {
  maxDuration.value = ''
  programStore.resetFilters()
  fetch(1)
}

function clearFilter(key) {
  programStore.setFilter(key, '')
  fetch(1)
}

const activeFilters = computed(() => {
  const f = programStore.filters
  const list = []
  if (f.search) list.push({ key: 'search', label: `"${f.search}"` })
  if (f.type) list.push({ key: 'type', label: f.type })
  if (f.country) list.push({ key: 'country', label: f.country })
  if (f.specialization) list.push({ key: 'specialization', label: f.specialization })
  if (f.duration) list.push({ key: 'duration', label: `Up to ${f.duration} months` })
  return list
})
</script>
<style scoped>
.programs-page {
  min-height: 70vh;
}
</style>
