<template>
  <div class="consultants-page">
    <!-- Hero -->
    <section class="consultants-hero">
      <div class="consultants-hero-blob"></div>
      <div class="container" style="position: relative; z-index: 1;">
        <div class="consultants-hero-content">
          <div>
            <span class="consultants-kicker">Our Team</span>
            <h1 class="consultants-title animate-in">Meet Our Consultants</h1>
            <p class="consultants-subtitle animate-in animate-in-delay-1">
              Our experienced advisors specialize in different regions and study levels. Find the perfect match for your study abroad journey.
            </p>
          </div>
          <RouterLink to="/consult" class="btn btn-gpe-accent rounded-pill px-4 animate-in animate-in-delay-2">
            <i class="bi bi-calendar-check me-2"></i>Book a Session
          </RouterLink>
        </div>

        <!-- Stats bar -->
        <div class="consultants-stats animate-in animate-in-delay-3">
          <div class="consultants-stat">
            <strong>{{ consultants.length }}</strong>
            <span>Consultants</span>
          </div>
          <div class="consultants-stat">
            <strong>{{ uniqueRegions.length }}</strong>
            <span>Regions Covered</span>
          </div>
          <div class="consultants-stat">
            <strong>Free</strong>
            <span>Initial Session</span>
          </div>
        </div>
      </div>
    </section>

    <div class="container py-5">
      <!-- Search & filter bar -->
      <div class="consultants-toolbar animate-in">
        <div class="toolbar-search">
          <i class="bi bi-search"></i>
          <input v-model="search" type="text" placeholder="Search by name or region..." />
        </div>
        <div class="toolbar-filters">
          <button
            :class="['toolbar-chip', { active: !selectedRegion }]"
            @click="selectedRegion = ''"
          >
            All Regions
          </button>
          <button
            v-for="region in uniqueRegions"
            :key="region"
            :class="['toolbar-chip', { active: selectedRegion === region }]"
            @click="selectedRegion = selectedRegion === region ? '' : region"
          >
            {{ region }}
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="consultants-grid">
        <div v-for="i in 6" :key="i" class="consultant-card-skeleton">
          <div class="skeleton-avatar placeholder-glow"><div class="placeholder"></div></div>
          <div class="skeleton-body placeholder-glow">
            <div class="placeholder rounded" style="width: 40%; height: 12px"></div>
            <div class="placeholder rounded" style="width: 70%; height: 16px"></div>
            <div class="placeholder rounded" style="width: 100%; height: 40px; margin-top: 8px"></div>
            <div class="d-flex gap-2 mt-2">
              <div class="placeholder rounded-pill" style="width: 60px; height: 22px"></div>
              <div class="placeholder rounded-pill" style="width: 80px; height: 22px"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else-if="filtered.length === 0" class="consultants-empty animate-in">
        <div class="consultants-empty-icon">🔍</div>
        <h3 v-if="consultants.length === 0">No consultants available yet</h3>
        <h3 v-else>No consultants match your search</h3>
        <p v-if="search || selectedRegion">Try adjusting your search or filter criteria.</p>
        <p v-else>Check back soon — our team is growing!</p>
        <button v-if="search || selectedRegion" class="btn btn-gpe-outline rounded-pill" @click="search = ''; selectedRegion = ''">
          Clear Filters
        </button>
      </div>

      <!-- Consultants grid -->
      <div v-else class="consultants-grid">
        <article
          v-for="(c, idx) in filtered"
          :key="c.id"
          class="consultant-card animate-in"
          :style="{ animationDelay: `${idx * 0.06}s` }"
        >
          <!-- Header gradient -->
          <div class="consultant-card-header">
            <div class="consultant-card-avatar">
              <img v-if="c.profileImageUrl" :src="c.profileImageUrl" :alt="name(c)" class="consultant-card-photo" />
              <span v-else>{{ initials(c) }}</span>
            </div>
          </div>

          <!-- Body -->
          <div class="consultant-card-body">
            <div class="consultant-card-role">Study Consultant</div>
            <h3 class="consultant-card-name">{{ name(c) }}</h3>
            <p class="consultant-card-bio">{{ bio(c) }}</p>

            <!-- Region tags -->
            <div class="consultant-card-tags">
              <span v-for="area in areas(c)" :key="area" class="consultant-tag">{{ area }}</span>
            </div>
          </div>

          <!-- Footer -->
          <div class="consultant-card-footer">
            <RouterLink
              :to="{ path: '/consult', query: { consultantId: c.id } }"
              class="btn btn-gpe-primary btn-sm w-100 rounded-pill"
            >
              <i class="bi bi-calendar-check me-1"></i>Book Session
            </RouterLink>
          </div>
        </article>
      </div>

      <!-- Results summary -->
      <div v-if="!loading && filtered.length > 0" class="consultants-results-summary">
        Showing {{ filtered.length }} of {{ consultants.length }} consultant{{ consultants.length !== 1 ? 's' : '' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import api from '@/api'

const consultants = ref([])
const loading = ref(true)
const search = ref('')
const selectedRegion = ref('')

onMounted(async () => {
  try {
    const { data } = await api.get('/api/consultants')
    consultants.value = data || []
  } catch (e) {
    console.error('Failed to load consultants:', e)
  } finally {
    loading.value = false
  }
})

const uniqueRegions = computed(() => {
  const regionSet = new Set()
  consultants.value.forEach((c) => {
    const list = c.consultantCountries?.map((item) => item.country).filter(Boolean) || []
    list.forEach((r) => regionSet.add(r))
  })
  return [...regionSet].sort()
})

const filtered = computed(() => {
  let list = consultants.value

  if (selectedRegion.value) {
    list = list.filter((c) => {
      const regionList = c.consultantCountries?.map((item) => item.country).filter(Boolean) || []
      return regionList.includes(selectedRegion.value)
    })
  }

  const q = search.value.trim().toLowerCase()
  if (q) {
    list = list.filter((c) => {
      const n = name(c).toLowerCase()
      const a = areas(c).map((area) => area.toLowerCase())
      return n.includes(q) || a.some((area) => area.includes(q))
    })
  }

  return list
})

function name(c) {
  return [c.firstName, c.lastName].filter(Boolean).join(' ') || 'GlobalPath Consultant'
}

function initials(c) {
  return name(c).split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
}

function areas(c) {
  const list = c.consultantCountries?.map((item) => item.country).filter(Boolean) || []
  return list.length ? list : ['General']
}

function bio(c) {
  return c.consultantBio || 'Supports students with program selection, destination planning, and application preparation.'
}
</script>

<style scoped>
.consultants-page {
  min-height: 80vh;
  background: #f8fafc;
}

/* ── Hero ── */
.consultants-hero {
  background: linear-gradient(135deg, #0f172a 0%, #1a3a5c 60%, #1e5fa0 100%);
  color: #ffffff;
  padding: 2.5rem 0 2rem;
  position: relative;
  overflow: hidden;
}

.consultants-hero-blob {
  position: absolute;
  right: -120px;
  top: -120px;
  width: 380px;
  height: 380px;
  border-radius: 999px;
  background: rgba(244, 164, 27, 0.1);
  pointer-events: none;
}

.consultants-hero-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.consultants-kicker {
  display: inline-block;
  margin-bottom: 0.3rem;
  color: #f4a41b;
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.consultants-title {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.4rem);
  font-weight: 850;
  letter-spacing: -0.04em;
}

.consultants-subtitle {
  max-width: 560px;
  margin: 0.6rem 0 0;
  color: #94a3b8;
  line-height: 1.6;
}

/* Stats */
.consultants-stats {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.consultants-stat {
  padding: 0.7rem 1.2rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.consultants-stat strong {
  display: block;
  font-size: 1.3rem;
  font-weight: 850;
  color: #ffffff;
}

.consultants-stat span {
  font-size: 0.78rem;
  color: #94a3b8;
  font-weight: 600;
}

/* ── Toolbar ── */
.consultants-toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem 1.25rem;
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}

.toolbar-search {
  position: relative;
}

.toolbar-search i {
  position: absolute;
  left: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.9rem;
}

.toolbar-search input {
  width: 100%;
  padding: 0.6rem 0.85rem 0.6rem 2.3rem;
  border: 1px solid #dbe5f0;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #0f172a;
  background: #f8fafc;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.toolbar-search input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.toolbar-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.toolbar-chip {
  border: 1px solid #dbe5f0;
  border-radius: 999px;
  background: transparent;
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 0.3rem 0.75rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-chip:hover {
  background: #f0f6ff;
  border-color: #bfdbfe;
  color: #1d4ed8;
}

.toolbar-chip.active {
  background: #1a3a5c;
  border-color: #1a3a5c;
  color: #ffffff;
}

/* ── Grid ── */
.consultants-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
}

/* ── Card ── */
.consultant-card {
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s ease,
              border-color 0.3s ease;
}

.consultant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 42px rgba(15, 23, 42, 0.1);
  border-color: #bfdbfe;
}

.consultant-card-header {
  background: linear-gradient(135deg, #1a3a5c, #2e7dc7);
  padding: 1.25rem 1.25rem 0;
  display: flex;
  justify-content: center;
  position: relative;
  min-height: 60px;
}

.consultant-card-avatar {
  width: 200px;
  height: 200px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 4px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.5rem;
  font-weight: 850;
  color: #ffffff;
  position: relative;
  bottom: -2rem;
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.18);
  overflow: hidden;
}

.consultant-card-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.consultant-card-body {
  padding: 2.5rem 1.25rem 0.75rem;
  flex: 1;
  text-align: center;
}

.consultant-card-role {
  color: #94a3b8;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.25rem;
}

.consultant-card-name {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  font-weight: 850;
  color: #0f172a;
}

.consultant-card-bio {
  margin: 0 0 0.75rem;
  color: #64748b;
  font-size: 0.84rem;
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.consultant-card-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.35rem;
}

.consultant-tag {
  background: #f0f6ff;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #1a3a5c;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.55rem;
}

.consultant-card-footer {
  padding: 0.75rem 1.25rem 1.25rem;
}

/* ── Skeleton ── */
.consultant-card-skeleton {
  background: #ffffff;
  border: 1px solid #e5edf7;
  border-radius: 18px;
  overflow: hidden;
}

.skeleton-avatar {
  background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
  height: 60px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 0;
}

.skeleton-avatar .placeholder {
  width: 200px;
  height: 200px;
  border-radius: 999px;
  transform: translateY(2rem);
}

.skeleton-body {
  padding: 3rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

/* ── Empty state ── */
.consultants-empty {
  max-width: 420px;
  margin: 2rem auto;
  padding: 3rem 2rem;
  text-align: center;
  background: #ffffff;
  border: 1px solid #e8eef5;
  border-radius: 24px;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
}

.consultants-empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

.consultants-empty h3 {
  color: #0f172a;
  font-weight: 850;
  font-size: 1.1rem;
  margin-bottom: 0.4rem;
}

.consultants-empty p {
  color: #64748b;
  margin-bottom: 1.25rem;
}

/* Results summary */
.consultants-results-summary {
  text-align: center;
  margin-top: 2rem;
  color: #94a3b8;
  font-size: 0.84rem;
  font-weight: 600;
}

/* ── Responsive ── */
@media (max-width: 991.98px) {
  .consultants-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .consultants-hero-content {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 767.98px) {
  .consultants-grid {
    grid-template-columns: 1fr;
  }

  .consultants-stats {
    flex-direction: column;
  }
}
</style>
