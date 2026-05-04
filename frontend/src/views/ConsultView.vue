<template>
  <div class="consult-page">
    <!-- Hero banner -->
    <section
      class="py-5"
      style="background: linear-gradient(135deg, var(--gpe-primary) 0%, #2e7dc7 100%); color: white"
    >
      <div class="container text-center">
        <h1 class="fw-bold mb-2">Book a Free Consultation</h1>
        <p class="lead mb-0" style="opacity: 0.88">
          Our advisors will help you find the perfect program for your goals, budget, and future
          career.
        </p>
      </div>
    </section>

    <div class="container py-5">
      <div class="row justify-content-center g-4">
        <!-- Benefits -->
        <div class="col-lg-4">
          <h5 class="fw-bold mb-4" style="color: var(--gpe-primary)">What You'll Get</h5>
          <div class="d-flex flex-column gap-3">
            <div
              v-for="b in benefits"
              :key="b.title"
              class="d-flex gap-3 p-3 rounded-3"
              style="background: white; border: 1px solid #e8eef5"
            >
              <span class="fs-4">{{ b.icon }}</span>
              <div>
                <div class="fw-semibold small" style="color: var(--gpe-primary)">{{ b.title }}</div>
                <div class="text-muted" style="font-size: 0.82rem">{{ b.desc }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="col-lg-8">
          <div class="bg-white p-4 p-md-5 rounded-3 shadow-sm">
            <!-- Success state -->
            <div v-if="success" class="text-center py-4">
              <div class="fs-1 mb-3">✅</div>
              <h4 class="fw-bold mb-2">Consultation Booked!</h4>
              <p class="text-muted mb-4">
                Thank you, {{ form.name }}! We'll contact you at
                <strong>{{ form.email }}</strong> within 24 hours.
              </p>
              <div class="d-flex justify-content-center gap-3">
                <button class="btn btn-gpe-outline" @click="reset">Book Another</button>
                <RouterLink to="/dashboard" class="btn btn-gpe-primary">View Dashboard</RouterLink>
              </div>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="submit">
              <h5 class="fw-bold mb-4" style="color: var(--gpe-primary)">Your Details</h5>

              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Full Name *</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="form.name"
                    required
                    placeholder="Your name"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Email Address *</label>
                  <input
                    type="email"
                    class="form-control"
                    v-model="form.email"
                    required
                    placeholder="you@example.com"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Phone Number</label>
                  <input
                    type="tel"
                    class="form-control"
                    v-model="form.phone"
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold small">Preferred Date</label>
                  <input
                    type="date"
                    class="form-control"
                    v-model="form.preferredDate"
                    :min="today"
                  />
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Program of Interest</label>
                  <select class="form-select" v-model="form.programId">
                    <option value="">I'm not sure yet — help me find one</option>
                    <option v-for="p in programs" :key="p.id" :value="p.id">
                      {{ p.institution }} — {{ p.title }}
                    </option>
                  </select>
                </div>
                <div class="col-12">
                  <label class="form-label fw-semibold small">Message / Goals *</label>
                  <textarea
                    class="form-control"
                    rows="4"
                    v-model="form.message"
                    required
                    placeholder="Tell us about your background, goals, preferred countries, budget, or any questions you have..."
                  ></textarea>
                </div>
              </div>

              <div v-if="error" class="alert alert-danger mt-3 small">{{ error }}</div>

              <button
                type="submit"
                class="btn btn-gpe-primary w-100 mt-4 py-2 fw-bold"
                :disabled="submitting"
              >
                <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                {{ submitting ? 'Booking...' : 'Book Free Consultation' }}
              </button>
              <p class="text-muted text-center mt-2 small">
                Free. No commitment. We'll reach out within 24 hours.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useUser } from '@clerk/vue'
import api from '@/api'

const route = useRoute()
const { user } = useUser()

const programs = ref([])
const form = ref({ name: '', email: '', phone: '', preferredDate: '', programId: '', message: '' })
const submitting = ref(false)
const success = ref(false)
const error = ref('')
const today = new Date().toISOString().split('T')[0]

onMounted(async () => {
  const { data } = await api.get('/api/programs', { params: { limit: 100 } })
  programs.value = data.data || data.programs || []
  if (route.query.programId) form.value.programId = parseInt(route.query.programId)
  if (user.value) {
    form.value.name = `${user.value.firstName || ''} ${user.value.lastName || ''}`.trim()
    form.value.email = user.value.primaryEmailAddress?.emailAddress || ''
  }
})

async function submit() {
  submitting.value = true
  error.value = ''
  try {
    await api.post('/api/consultations', {
      ...form.value,
      programId: form.value.programId || null,
    })
    success.value = true
  } catch (e) {
    error.value = e.response?.data?.error || 'Failed to book consultation. Please try again.'
  } finally {
    submitting.value = false
  }
}

function reset() {
  success.value = false
  form.value = { name: '', email: '', phone: '', preferredDate: '', programId: '', message: '' }
}

const benefits = [
  {
    icon: '🎯',
    title: 'Personalized Advice',
    desc: 'Tailored recommendations based on your background and goals',
  },
  {
    icon: '🌏',
    title: 'Global Expertise',
    desc: 'In-depth knowledge of programs across 8 countries',
  },
  {
    icon: '💰',
    title: 'Scholarship Guidance',
    desc: 'Learn about funding options and financial aid',
  },
  {
    icon: '📋',
    title: 'Application Support',
    desc: 'Step-by-step guidance through the application process',
  },
]
</script>
