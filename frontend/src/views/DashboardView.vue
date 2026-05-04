<template>
  <div class="py-4">
    <div class="container">
      <!-- Welcome -->
      <div class="d-flex align-items-center gap-3 mb-5">
        <div>
          <h1 class="section-heading mb-1">Welcome back, {{ firstName }} 👋</h1>
          <p class="section-subheading mb-0">Here's an overview of your activity</p>
        </div>
      </div>

      <!-- Stats -->
      <div class="row g-3 mb-5">
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon">🔖</div>
            <div class="stat-value">{{ userStore.bookmarks.length }}</div>
            <div class="stat-label">Saved Programs</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon">📅</div>
            <div class="stat-value">{{ consultations.length }}</div>
            <div class="stat-label">Consultations</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon">⚖️</div>
            <div class="stat-value">{{ userStore.compareList.length }}</div>
            <div class="stat-label">In Comparison</div>
          </div>
        </div>
        <div class="col-6 col-md-3">
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-value">{{ completedCount }}</div>
            <div class="stat-label">Consultations Done</div>
          </div>
        </div>
      </div>

      <div class="row g-4">
        <!-- Saved Programs -->
        <div class="col-lg-6">
          <div class="bg-white rounded-3 p-4 shadow-sm h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0" style="color:var(--gpe-primary)">Saved Programs</h5>
              <RouterLink to="/bookmarks" class="btn btn-sm btn-gpe-outline">View All</RouterLink>
            </div>
            <div v-if="userStore.bookmarks.length === 0" class="text-center py-3 text-muted small">
              <div class="fs-3 mb-2">🔖</div>No saved programs yet
            </div>
            <div v-else>
              <div v-for="b in userStore.bookmarks.slice(0, 4)" :key="b.id" class="d-flex justify-content-between align-items-center py-2 border-bottom">
                <div>
                  <div class="small fw-semibold" style="color:var(--gpe-primary)">{{ b.program.title }}</div>
                  <div class="small text-muted">{{ b.program.institution }} · {{ b.program.country }}</div>
                </div>
                <RouterLink :to="`/programs/${b.program.id}`" class="btn btn-sm btn-outline-secondary">View</RouterLink>
              </div>
            </div>
          </div>
        </div>

        <!-- Consultations -->
        <div class="col-lg-6">
          <div class="bg-white rounded-3 p-4 shadow-sm h-100">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-bold mb-0" style="color:var(--gpe-primary)">Consultation History</h5>
              <RouterLink to="/consult" class="btn btn-sm btn-gpe-outline">Book New</RouterLink>
            </div>
            <div v-if="loading" class="text-center py-3"><div class="spinner-border spinner-border-sm text-primary"></div></div>
            <div v-else-if="consultations.length === 0" class="text-center py-3 text-muted small">
              <div class="fs-3 mb-2">📅</div>No consultations yet
            </div>
            <div v-else>
              <div v-for="c in consultations" :key="c.id" class="py-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                  <div>
                    <div class="small fw-semibold" style="color:var(--gpe-primary)">{{ c.program?.title || 'General Inquiry' }}</div>
                    <div class="small text-muted">{{ formatDate(c.createdAt) }}</div>
                    <div class="small text-muted mt-1" style="max-width:260px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;">{{ c.message }}</div>
                  </div>
                  <div class="d-flex flex-column align-items-end gap-1">
                    <span class="badge" :class="statusClass(c.status)">{{ c.status }}</span>
                    <button v-if="c.status === 'pending'" class="btn btn-sm btn-outline-danger" style="font-size:0.72rem;" @click="cancel(c.id)">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick actions -->
      <div class="mt-4">
        <h6 class="fw-bold mb-3" style="color:var(--gpe-primary)">Quick Actions</h6>
        <div class="d-flex flex-wrap gap-2">
          <RouterLink to="/programs" class="btn btn-gpe-primary"><i class="bi bi-search me-2"></i>Browse Programs</RouterLink>
          <RouterLink to="/compare" class="btn btn-gpe-outline"><i class="bi bi-bar-chart-steps me-2"></i>Compare Programs</RouterLink>
          <RouterLink to="/consult" class="btn btn-outline-success"><i class="bi bi-calendar-check me-2"></i>Book Consultation</RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useUser } from '@clerk/vue'
import { useUserStore } from '@/stores/user'
import api from '@/api'

const { user } = useUser()
const userStore = useUserStore()
const consultations = ref([])
const loading = ref(true)

const firstName = computed(() => user.value?.firstName || 'there')
const completedCount = computed(() => consultations.value.filter(c => c.status === 'completed').length)

onMounted(async () => {
  await userStore.fetchBookmarks()

  try {
    const { data } = await api.get('/api/consultations')
    consultations.value = data
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
})

async function cancel(id) {
  await api.patch(`/api/consultations/${id}/cancel`)
  consultations.value = consultations.value.map(c => c.id === id ? { ...c, status: 'cancelled' } : c)
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function statusClass(status) {
  return {
    pending: 'bg-warning text-dark',
    confirmed: 'bg-success',
    completed: 'bg-secondary',
    cancelled: 'bg-danger',
  }[status] || 'bg-secondary'
}
</script>
