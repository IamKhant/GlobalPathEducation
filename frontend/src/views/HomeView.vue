<template>
  <main>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-shape"></div>

      <div class="container">
        <div class="row align-items-center g-5">
          <!-- Left illustration -->
          <div class="col-lg-6 order-2 order-lg-1">
            <div class="hero-visual">
              <img :src="heroImage" alt="Student exploring study abroad opportunities" />
            </div>
          </div>

          <!-- Right content -->
          <div class="col-lg-6 order-1 order-lg-2">
            <div class="hero-content">
              <div class="hero-badge">
                <i class="bi bi-globe2"></i>
                Global study pathways for students
              </div>

              <h1 class="hero-title">
                Study abroad and build your future pathway
              </h1>

              <div class="hero-line"></div>

              <p class="hero-subtitle">
                Explore global study programs, compare destinations, and get consultation
                support before choosing your next education journey.
              </p>

              <form class="hero-search" @submit.prevent="handleSearch">
                <i class="bi bi-search"></i>
                <input v-model="searchQuery" type="search"
                  placeholder="Search programs, countries, or institutions..." />
                <button type="submit">Search</button>
              </form>

              <div class="hero-actions">
                <RouterLink to="/programs" class="btn btn-primary btn-lg rounded-pill px-4">
                  Explore Programs
                </RouterLink>

                <RouterLink to="/consult" class="btn btn-outline-primary btn-lg rounded-pill px-4">
                  Book Consultation
                </RouterLink>
              </div>

              <div class="hero-mini-stats">
                <div>
                  <strong>48+</strong>
                  <span>Programs</span>
                </div>
                <div>
                  <strong>8</strong>
                  <span>Countries</span>
                </div>
                <div>
                  <strong>2</strong>
                  <span>Pathways</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Destination Slideshow -->
    <section class="section-padding destination-section">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="section-kicker">Global destinations</span>
            <h2>Explore study destinations</h2>
            <p>
              Discover popular countries where students can explore study programs,
              bootcamps, and international education pathways.
            </p>
          </div>

          <RouterLink to="/programs" class="view-all-link">
            View programs
            <i class="bi bi-arrow-right"></i>
          </RouterLink>
        </div>

        <div id="countryCarousel" class="carousel slide country-carousel" data-bs-ride="carousel"
          data-bs-interval="3500">
          <div class="carousel-indicators">
            <button v-for="(country, index) in countries" :key="country.name" type="button"
              data-bs-target="#countryCarousel" :data-bs-slide-to="index" :class="{ active: index === 0 }"
              :aria-current="index === 0 ? 'true' : undefined" :aria-label="`Slide ${index + 1}`"></button>
          </div>

          <div class="carousel-inner">
            <div v-for="(country, index) in countries" :key="country.name"
              :class="['carousel-item', { active: index === 0 }]">
              <div class="country-slide">
                <img :src="country.image" :alt="country.name" />

                <div class="country-slide-overlay">
                  <span class="country-label">Study destination</span>
                  <h3>{{ country.name }}</h3>
                  <p>{{ country.description }}</p>

                  <RouterLink :to="{ path: '/programs', query: { country: country.name } }" class="country-slide-btn">
                    Explore {{ country.name }}
                    <i class="bi bi-arrow-right"></i>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>

          <button class="carousel-control-prev" type="button" data-bs-target="#countryCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
          </button>

          <button class="carousel-control-next" type="button" data-bs-target="#countryCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
          </button>
        </div>

        <!-- Small destination cards under slideshow -->
        <div class="country-mini-grid">
          <RouterLink v-for="country in countries" :key="country.name"
            :to="{ path: '/programs', query: { country: country.name } }" class="country-mini-card">
            <img :src="country.image" :alt="country.name" />
            <span>{{ country.name }}</span>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Featured Programs -->
    <section class="section-padding">
      <div class="container">
        <div class="section-heading">
          <div>
            <span class="section-kicker">Explore options</span>
            <h2>Featured programs</h2>
            <p>
              Start with a few highlighted programs from the current database.
            </p>
          </div>

          <RouterLink to="/programs" class="view-all-link">
            View all programs
            <i class="bi bi-arrow-right"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary"></div>
          <p>Loading featured programs...</p>
        </div>

        <div v-else-if="featuredPrograms.length" class="row g-4">
          <div v-for="program in featuredPrograms" :key="program.id" class="col-md-6 col-lg-4">
            <div class="program-card">
              <div class="d-flex justify-content-between align-items-start mb-3">
                <span class="type-badge">{{ program.type }}</span>
                <span class="country-text">{{ program.country }}</span>
              </div>

              <h5>{{ program.title }}</h5>
              <p class="institution">{{ program.institution }}</p>

              <div class="program-meta">
                <span>
                  <i class="bi bi-geo-alt"></i>
                  {{ program.city || 'Not specified' }}
                </span>
                <span>
                  <i class="bi bi-clock"></i>
                  {{ program.durationMonths || 'N/A' }} months
                </span>
              </div>

              <p class="description">
                {{ shortDescription(program.description) }}
              </p>

              <RouterLink :to="`/programs/${program.id}`" class="card-link">
                View details
                <i class="bi bi-arrow-right"></i>
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          No featured programs available yet.
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="section-padding soft-section">
      <div class="container">
        <div class="section-heading center">
          <span class="section-kicker">Simple process</span>
          <h2>Plan your study journey in three steps</h2>
          <p>
            GlobalPath Education helps students move from discovery to decision
            with a clear and simple process.
          </p>
        </div>

        <div class="row g-4">
          <div v-for="step in steps" :key="step.title" class="col-md-4">
            <div class="step-card">
              <div class="step-icon">
                <i :class="step.icon"></i>
              </div>
              <h5>{{ step.title }}</h5>
              <p>{{ step.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us -->
    <section class="section-padding">
      <div class="container">
        <div class="row align-items-center g-5">
          <div class="col-lg-5">
            <span class="section-kicker">Why GlobalPath</span>
            <h2 class="why-title">A clearer way to compare study options</h2>
            <p class="why-text">
              Instead of searching across many websites manually, students can explore
              programs, compare basic details, save options, and request consultation
              in one place.
            </p>

            <RouterLink to="/programs" class="btn btn-primary rounded-pill px-4">
              Start exploring
            </RouterLink>
          </div>

          <div class="col-lg-7">
            <div class="benefit-grid">
              <div v-for="benefit in benefits" :key="benefit.title" class="benefit-card">
                <i :class="benefit.icon"></i>
                <h5>{{ benefit.title }}</h5>
                <p>{{ benefit.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div>
            <span class="section-kicker light">Need guidance?</span>
            <h2>Not sure which study option fits you best?</h2>
            <p>
              Book a consultation and get support comparing destinations, fees,
              study levels, program types, and future opportunities.
            </p>
          </div>

          <RouterLink to="/consult" class="btn btn-light btn-lg rounded-pill px-4">
            Book Consultation
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import api from '@/api'

import heroImage from '@/assets/hero/study-abroad-hero.png'

import australiaImg from '@/assets/countries/australia.jpg'
import canadaImg from '@/assets/countries/canada.jpg'
import germanyImg from '@/assets/countries/germany.jpg'
import irelandImg from '@/assets/countries/ireland.jpg'
import japanImg from '@/assets/countries/japan.jpg'
import netherlandsImg from '@/assets/countries/netherlands.jpg'
import newZealandImg from '@/assets/countries/newzealand.jpg'
import spainImg from '@/assets/countries/spain.jpg'

const router = useRouter()

const searchQuery = ref('')
const featuredPrograms = ref([])
const loading = ref(false)

const countries = [
  {
    name: 'Australia',
    image: australiaImg,
    description: 'Explore study options in cities like Sydney, Melbourne, Brisbane, and more.',
  },
  {
    name: 'Canada',
    image: canadaImg,
    description: 'Discover programs in a diverse and student-friendly education destination.',
  },
  {
    name: 'Germany',
    image: germanyImg,
    description: 'Find study pathways in one of Europe’s most popular education destinations.',
  },
  {
    name: 'Ireland',
    image: irelandImg,
    description: 'Explore opportunities in a growing education and technology hub.',
  },
  {
    name: 'Japan',
    image: japanImg,
    description: 'Discover study options in one of Asia’s leading education destinations.',
  },
  {
    name: 'Netherlands',
    image: netherlandsImg,
    description: 'Find English-taught programs in a highly international European destination.',
  },
  {
    name: 'New Zealand',
    image: newZealandImg,
    description: 'Explore study options in a peaceful, scenic, and student-friendly country.',
  },
  {
    name: 'Spain',
    image: spainImg,
    description: 'Discover programs in a vibrant destination with strong culture and lifestyle.',
  },
]

const steps = [
  {
    icon: 'bi bi-search',
    title: 'Explore programs',
    text: 'Browse study programs, bootcamps, and learning pathways from different countries.',
  },
  {
    icon: 'bi bi-bar-chart-steps',
    title: 'Compare options',
    text: 'Review destination, duration, tuition, institution, and program type side by side.',
  },
  {
    icon: 'bi bi-calendar-check',
    title: 'Book consultation',
    text: 'Request guidance when you are ready to discuss your study plan and next steps.',
  },
]

const benefits = [
  {
    icon: 'bi bi-globe2',
    title: 'Global destinations',
    text: 'Explore programs from different countries in one simple platform.',
  },
  {
    icon: 'bi bi-bookmark-heart',
    title: 'Save favourites',
    text: 'Keep track of programs you are interested in for later review.',
  },
  {
    icon: 'bi bi-bar-chart',
    title: 'Compare clearly',
    text: 'Compare key details like country, duration, fee, and program type.',
  },
  {
    icon: 'bi bi-person-check',
    title: 'Consultation support',
    text: 'Get support before making your study decision.',
  },
]

function handleSearch() {
  const query = searchQuery.value.trim()

  router.push({
    path: '/programs',
    query: query ? { search: query } : {},
  })
}

function shortDescription(description) {
  if (!description) return 'Program details will be available soon.'

  return description.length > 110
    ? `${description.slice(0, 110)}...`
    : description
}

async function fetchFeaturedPrograms() {
  try {
    loading.value = true

    const { data } = await api.get('/api/programs', {
      params: {
        limit: 6,
      },
    })

    featuredPrograms.value = data.data || []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(fetchFeaturedPrograms)
</script>

<style scoped>
.hero-section {
  position: relative;
  padding: 5rem 0 4rem;
  background:
    radial-gradient(circle at left center, rgba(96, 165, 250, 0.26), transparent 34%),
    linear-gradient(135deg, #f7fbff 0%, #eef7ff 48%, #ffffff 100%);
  overflow: hidden;
}

.hero-bg-shape {
  position: absolute;
  right: -140px;
  bottom: -180px;
  width: 460px;
  height: 460px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.08);
}

.hero-visual {
  position: relative;
  min-height: 600px;
  border-radius: 34px;
  overflow: hidden;
  background: #dbeafe;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.12);
}

.hero-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 255, 255, 0) 55%
    );
  z-index: 1;
  pointer-events: none;
}

.hero-visual img {
  width: 100%;
  height: 600px;
  object-fit: cover;
  object-position: center;
  display: block;
}

.hero-content {
  max-width: 620px;
}

.hero-badge {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.3rem;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: #e0ecff;
  color: #1d4ed8;
  font-weight: 800;
  font-size: 0.85rem;
}

.hero-title {
  max-width: 640px;
  margin-bottom: 1rem;
  color: #13233b;
  font-size: clamp(2.4rem, 5vw, 4.4rem);
  font-weight: 850;
  letter-spacing: -0.05em;
  line-height: 1.05;
}

.hero-line {
  width: 72px;
  height: 4px;
  margin: 1.2rem 0 1.4rem;
  border-radius: 999px;
  background: #38bdf8;
}

.hero-subtitle {
  max-width: 560px;
  margin-bottom: 1.5rem;
  color: #475569;
  font-size: 1.05rem;
  line-height: 1.8;
}

.hero-search {
  max-width: 590px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding: 0.5rem;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  background: #ffffff;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
}

.hero-search i {
  margin-left: 0.75rem;
  color: #64748b;
}

.hero-search input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: 0;
  color: #0f172a;
  font-size: 0.95rem;
}

.hero-search button {
  border: 0;
  border-radius: 999px;
  padding: 0.65rem 1.2rem;
  background: #2563eb;
  color: #ffffff;
  font-weight: 700;
}

.hero-search button:hover {
  background: #1d4ed8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.hero-mini-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.hero-mini-stats div {
  min-width: 110px;
  padding: 0.9rem 1rem;
  border: 1px solid #dbeafe;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(10px);
}

.hero-mini-stats strong {
  display: block;
  color: #0f172a;
  font-size: 1.35rem;
  font-weight: 850;
}

.hero-mini-stats span {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

.section-padding {
  padding: 4.5rem 0;
}

.destination-section {
  background: #ffffff;
}

.soft-section {
  background: #f8fafc;
}

.section-heading {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: end;
}

.section-heading.center {
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
  display: block;
}

.section-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 850;
  letter-spacing: -0.04em;
}

.section-heading p {
  max-width: 620px;
  margin: 0.75rem 0 0;
  color: #64748b;
  line-height: 1.7;
}

.section-heading.center p {
  margin-left: auto;
  margin-right: auto;
}

.section-kicker {
  display: inline-block;
  margin-bottom: 0.4rem;
  color: #2563eb;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.section-kicker.light {
  color: #bfdbfe;
}

.view-all-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
}

.view-all-link:hover {
  color: #1d4ed8;
}

.country-carousel {
  border-radius: 32px;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(15, 23, 42, 0.14);
}

.country-slide {
  position: relative;
  min-height: 500px;
  background: #0f172a;
}

.country-slide img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  display: block;
}

.country-slide-overlay {
  position: absolute;
  inset: 0;
  padding: 3rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background:
    linear-gradient(90deg,
      rgba(15, 23, 42, 0.88) 0%,
      rgba(15, 23, 42, 0.58) 42%,
      rgba(15, 23, 42, 0.16) 100%);
  color: #ffffff;
}

.country-label {
  width: fit-content;
  margin-bottom: 0.8rem;
  padding: 0.35rem 0.75rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  color: #bfdbfe;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.country-slide-overlay h3 {
  margin-bottom: 0.75rem;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 850;
  letter-spacing: -0.05em;
}

.country-slide-overlay p {
  max-width: 560px;
  margin-bottom: 1.25rem;
  color: #e2e8f0;
  font-size: 1rem;
  line-height: 1.7;
}

.country-slide-btn {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.75rem 1.1rem;
  border-radius: 999px;
  background: #ffffff;
  color: #0f172a;
  font-weight: 800;
  text-decoration: none;
}

.country-slide-btn:hover {
  background: #dbeafe;
  color: #1d4ed8;
}

.carousel-control-prev,
.carousel-control-next {
  width: 7%;
}

.carousel-indicators [data-bs-target] {
  width: 9px;
  height: 9px;
  border-radius: 999px;
}

.country-mini-grid {
  margin-top: 1.25rem;
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 0.75rem;
}

.country-mini-card {
  position: relative;
  min-height: 96px;
  border-radius: 18px;
  overflow: hidden;
  color: #ffffff;
  text-decoration: none;
  background: #0f172a;
}

.country-mini-card img {
  width: 100%;
  height: 96px;
  object-fit: cover;
  display: block;
  opacity: 0.76;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.country-mini-card span {
  position: absolute;
  inset: auto 0 0;
  padding: 0.6rem;
  background: linear-gradient(180deg, transparent, rgba(15, 23, 42, 0.88));
  font-size: 0.78rem;
  font-weight: 800;
  text-align: center;
}

.country-mini-card:hover img {
  transform: scale(1.08);
  opacity: 1;
}

.program-card {
  height: 100%;
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 14px 40px rgba(15, 23, 42, 0.06);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.program-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 22px 55px rgba(15, 23, 42, 0.1);
}

.type-badge {
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: #dbeafe;
  color: #1d4ed8;
  font-size: 0.78rem;
  font-weight: 800;
}

.country-text {
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
}

.program-card h5 {
  min-height: 52px;
  color: #0f172a;
  font-weight: 800;
  line-height: 1.3;
}

.institution {
  color: #64748b;
  font-weight: 600;
}

.program-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-bottom: 1rem;
  color: #475569;
  font-size: 0.86rem;
}

.program-meta i {
  margin-right: 0.3rem;
  color: #2563eb;
}

.description {
  min-height: 66px;
  color: #64748b;
  font-size: 0.92rem;
  line-height: 1.6;
}

.card-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #2563eb;
  font-weight: 800;
  text-decoration: none;
}

.card-link:hover {
  color: #1d4ed8;
}

.loading-state,
.empty-state {
  padding: 2rem;
  border-radius: 20px;
  background: #f8fafc;
  color: #64748b;
  text-align: center;
}

.loading-state p {
  margin: 0.75rem 0 0;
}

.step-card {
  height: 100%;
  padding: 1.5rem;
  border-radius: 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.step-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 1rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #dbeafe;
  color: #2563eb;
  font-size: 1.4rem;
}

.step-card h5 {
  color: #0f172a;
  font-weight: 850;
}

.step-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.7;
}

.why-title {
  margin-bottom: 1rem;
  color: #0f172a;
  font-size: clamp(1.9rem, 4vw, 3rem);
  font-weight: 850;
  letter-spacing: -0.05em;
}

.why-text {
  margin-bottom: 1.5rem;
  color: #64748b;
  line-height: 1.8;
}

.benefit-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.benefit-card {
  padding: 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: 0 14px 35px rgba(15, 23, 42, 0.05);
}

.benefit-card i {
  width: 48px;
  height: 48px;
  margin-bottom: 1rem;
  border-radius: 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #eff6ff;
  color: #2563eb;
  font-size: 1.25rem;
}

.benefit-card h5 {
  color: #0f172a;
  font-weight: 850;
}

.benefit-card p {
  margin: 0;
  color: #64748b;
  line-height: 1.6;
}

.cta-section {
  padding: 2rem 0 4.5rem;
}

.cta-card {
  padding: 2.5rem;
  border-radius: 30px;
  background:
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.25), transparent 32%),
    #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.cta-card h2 {
  margin-bottom: 0.75rem;
  font-weight: 850;
  letter-spacing: -0.04em;
}

.cta-card p {
  max-width: 680px;
  margin: 0;
  color: #cbd5e1;
  line-height: 1.7;
}

@media (max-width: 991.98px) {
  .hero-section {
    padding: 3.5rem 0 3rem;
  }

  .hero-content {
    text-align: center;
    margin: 0 auto;
  }

  .hero-badge {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-line {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-search {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-actions,
  .hero-mini-stats {
    justify-content: center;
  }

  .hero-visual {
    min-height: 360px;
  }

  .hero-visual::before {
    width: 300px;
    height: 300px;
  }

  .hero-visual img {
    width: min(100%, 420px);
  }

  .section-heading {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-heading.center {
    align-items: center;
  }

  .country-slide,
  .country-slide img {
    min-height: 420px;
    height: 420px;
  }

  .country-slide-overlay {
    padding: 2rem;
    background:
      linear-gradient(180deg,
        rgba(15, 23, 42, 0.12) 0%,
        rgba(15, 23, 42, 0.84) 100%);
  }

  .country-mini-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .benefit-grid {
    grid-template-columns: 1fr;
  }

  .cta-card {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 575.98px) {
  .hero-title {
    font-size: 2.35rem;
  }

  .hero-search {
    flex-direction: column;
    align-items: stretch;
    border-radius: 24px;
    padding: 0.85rem;
  }

  .hero-search i {
    display: none;
  }

  .hero-search input {
    padding: 0.65rem;
  }

  .hero-mini-stats {
    display: grid;
    grid-template-columns: 1fr;
  }

  .country-carousel {
    border-radius: 24px;
  }

  .country-slide,
  .country-slide img {
    min-height: 390px;
    height: 390px;
  }

  .country-slide-overlay h3 {
    font-size: 2.4rem;
  }

  .country-mini-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
