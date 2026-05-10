<template>
  <main>
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-bg-shape"></div>

      <div class="container">
        <div class="row align-items-center g-5">
          <!-- Left illustration -->
          <div class="col-lg-6 order-2 order-lg-1">
            <div class="hero-visual animate-in animate-in-delay-3">
              <img :src="heroImage" alt="Student exploring study abroad opportunities" class="hero-image-float" />
            </div>
          </div>

          <!-- Right content -->
          <div class="col-lg-6 order-1 order-lg-2">
            <div class="hero-content">
              <div class="hero-badge animate-in">
                <i class="bi bi-globe2"></i>
                {{ settingsStore.t('home.hero.badge') }}
              </div>

              <h1 class="hero-title animate-in animate-in-delay-1">{{ settingsStore.t('home.hero.title') }}</h1>

              <div class="hero-line animate-in animate-in-delay-2"></div>

              <p class="hero-subtitle animate-in animate-in-delay-2">
                {{ settingsStore.t('home.hero.subtitle') }}
              </p>

              <form class="hero-search animate-in animate-in-delay-3" @submit.prevent="handleSearch">
                <i class="bi bi-search"></i>
                <input
                  v-model="searchQuery"
                  type="search"
                  :placeholder="settingsStore.t('home.hero.searchPlaceholder')"
                />
                <button type="submit">{{ settingsStore.t('home.hero.searchButton') }}</button>
              </form>

              <div class="hero-actions animate-in animate-in-delay-4">
                <RouterLink to="/programs" class="btn btn-primary btn-lg rounded-pill px-4">
                  {{ settingsStore.t('home.hero.explorePrograms') }}
                </RouterLink>

                <RouterLink to="/consult" class="btn btn-outline-primary btn-lg rounded-pill px-4">
                  {{ settingsStore.t('home.hero.bookConsultation') }}
                </RouterLink>
              </div>

              <div class="hero-mini-stats animate-in animate-in-delay-5">
                <div>
                  <strong>48+</strong>
                  <span>{{ settingsStore.t('home.hero.programs') }}</span>
                </div>
                <div>
                  <strong>8</strong>
                  <span>{{ settingsStore.t('home.hero.countries') }}</span>
                </div>
                <div>
                  <strong>2</strong>
                  <span>{{ settingsStore.t('home.hero.pathways') }}</span>
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
            <span class="section-kicker">{{ settingsStore.t('home.destinations.kicker') }}</span>
            <h2>{{ settingsStore.t('home.destinations.title') }}</h2>
            <p>{{ settingsStore.t('home.destinations.subtitle') }}</p>
          </div>

          <RouterLink to="/programs" class="view-all-link">
            {{ settingsStore.t('home.destinations.viewPrograms') }}
            <i class="bi bi-arrow-right"></i>
          </RouterLink>
        </div>

        <div
          id="countryCarousel"
          class="carousel slide country-carousel"
          data-bs-ride="carousel"
          data-bs-interval="3500"
        >
          <div class="carousel-indicators">
            <button
              v-for="(country, index) in countries"
              :key="country.name"
              type="button"
              data-bs-target="#countryCarousel"
              :data-bs-slide-to="index"
              :class="{ active: index === 0 }"
              :aria-current="index === 0 ? 'true' : undefined"
              :aria-label="`Slide ${index + 1}`"
            ></button>
          </div>

          <div class="carousel-inner">
            <div
              v-for="(country, index) in countries"
              :key="country.name"
              :class="['carousel-item', { active: index === 0 }]"
            >
              <div class="country-slide">
                <img :src="country.image" :alt="country.name" />

                <div class="country-slide-overlay">
                  <span class="country-label">{{ settingsStore.t('home.destinations.label') }}</span>
                  <h3>{{ country.name }}</h3>
                  <p>{{ settingsStore.t(country.descriptionKey) }}</p>

                  <RouterLink
                    :to="{ path: '/programs', query: { country: country.name } }"
                    class="country-slide-btn"
                  >
                    {{ settingsStore.t('home.destinations.explore', { country: country.name }) }}
                    <i class="bi bi-arrow-right"></i>
                  </RouterLink>
                </div>
              </div>
            </div>
          </div>

          <button
            class="carousel-control-prev"
            type="button"
            data-bs-target="#countryCarousel"
            data-bs-slide="prev"
          >
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">{{ settingsStore.t('home.carousel.previous') }}</span>
          </button>

          <button
            class="carousel-control-next"
            type="button"
            data-bs-target="#countryCarousel"
            data-bs-slide="next"
          >
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">{{ settingsStore.t('home.carousel.next') }}</span>
          </button>
        </div>

        <!-- Small destination cards under slideshow -->
        <div class="country-mini-grid">
          <RouterLink
            v-for="country in countries"
            :key="country.name"
            :to="{ path: '/programs', query: { country: country.name } }"
            class="country-mini-card"
          >
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
            <span class="section-kicker">{{ settingsStore.t('home.featured.kicker') }}</span>
            <h2>{{ settingsStore.t('home.featured.title') }}</h2>
            <p>{{ settingsStore.t('home.featured.subtitle') }}</p>
          </div>

          <RouterLink to="/programs" class="view-all-link">
            {{ settingsStore.t('home.featured.viewAll') }}
            <i class="bi bi-arrow-right"></i>
          </RouterLink>
        </div>

        <div v-if="loading" class="loading-state">
          <div class="spinner-border text-primary"></div>
          <p>{{ settingsStore.t('home.featured.loading') }}</p>
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
                  {{ program.city || settingsStore.t('home.featured.notSpecified') }}
                </span>
                <span>
                  <i class="bi bi-clock"></i>
                  {{ program.durationMonths || settingsStore.t('home.featured.notAvailable') }}
                  {{ settingsStore.t('home.featured.months') }}
                </span>
              </div>

              <p class="description">
                {{ shortDescription(program.description) }}
              </p>

              <RouterLink :to="`/programs/${program.id}`" class="card-link">
                {{ settingsStore.t('home.featured.viewDetails') }}
                <i class="bi bi-arrow-right"></i>
              </RouterLink>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">{{ settingsStore.t('home.featured.empty') }}</div>
      </div>
    </section>

    <!-- How It Works -->
    <section class="section-padding soft-section">
      <div class="container">
        <div class="section-heading center">
          <span class="section-kicker">{{ settingsStore.t('home.process.kicker') }}</span>
          <h2>{{ settingsStore.t('home.process.title') }}</h2>
          <p>{{ settingsStore.t('home.process.subtitle') }}</p>
        </div>

        <div class="row g-4">
          <div v-for="step in steps" :key="step.titleKey" class="col-md-4">
            <div class="step-card">
              <div class="step-icon">
                <i :class="step.icon"></i>
              </div>
              <h5>{{ settingsStore.t(step.titleKey) }}</h5>
              <p>{{ settingsStore.t(step.textKey) }}</p>
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
            <span class="section-kicker">{{ settingsStore.t('home.why.kicker') }}</span>
            <h2 class="why-title">{{ settingsStore.t('home.why.title') }}</h2>
            <p class="why-text">{{ settingsStore.t('home.why.text') }}</p>

            <RouterLink to="/programs" class="btn btn-primary rounded-pill px-4">
              {{ settingsStore.t('home.why.cta') }}
            </RouterLink>
          </div>

          <div class="col-lg-7">
            <div class="benefit-grid">
              <div v-for="benefit in benefits" :key="benefit.titleKey" class="benefit-card">
                <i :class="benefit.icon"></i>
                <h5>{{ settingsStore.t(benefit.titleKey) }}</h5>
                <p>{{ settingsStore.t(benefit.textKey) }}</p>
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
            <span class="section-kicker light">{{ settingsStore.t('home.cta.kicker') }}</span>
            <h2>{{ settingsStore.t('home.cta.title') }}</h2>
            <p>{{ settingsStore.t('home.cta.text') }}</p>
          </div>

          <RouterLink to="/consult" class="btn btn-light btn-lg rounded-pill px-4">
            {{ settingsStore.t('home.cta.button') }}
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
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
const settingsStore = useSettingsStore()

const searchQuery = ref('')
const featuredPrograms = ref([])
const loading = ref(false)

const countries = [
  {
    name: 'Australia',
    image: australiaImg,
    descriptionKey: 'country.australia.description',
  },
  {
    name: 'Canada',
    image: canadaImg,
    descriptionKey: 'country.canada.description',
  },
  {
    name: 'Germany',
    image: germanyImg,
    descriptionKey: 'country.germany.description',
  },
  {
    name: 'Ireland',
    image: irelandImg,
    descriptionKey: 'country.ireland.description',
  },
  {
    name: 'Japan',
    image: japanImg,
    descriptionKey: 'country.japan.description',
  },
  {
    name: 'Netherlands',
    image: netherlandsImg,
    descriptionKey: 'country.netherlands.description',
  },
  {
    name: 'New Zealand',
    image: newZealandImg,
    descriptionKey: 'country.newZealand.description',
  },
  {
    name: 'Spain',
    image: spainImg,
    descriptionKey: 'country.spain.description',
  },
]

const steps = [
  {
    icon: 'bi bi-search',
    titleKey: 'home.step.explore.title',
    textKey: 'home.step.explore.text',
  },
  {
    icon: 'bi bi-bar-chart-steps',
    titleKey: 'home.step.compare.title',
    textKey: 'home.step.compare.text',
  },
  {
    icon: 'bi bi-calendar-check',
    titleKey: 'home.step.consult.title',
    textKey: 'home.step.consult.text',
  },
]

const benefits = [
  {
    icon: 'bi bi-globe2',
    titleKey: 'home.benefit.destinations.title',
    textKey: 'home.benefit.destinations.text',
  },
  {
    icon: 'bi bi-bookmark-heart',
    titleKey: 'home.benefit.save.title',
    textKey: 'home.benefit.save.text',
  },
  {
    icon: 'bi bi-bar-chart',
    titleKey: 'home.benefit.compare.title',
    textKey: 'home.benefit.compare.text',
  },
  {
    icon: 'bi bi-person-check',
    titleKey: 'home.benefit.consult.title',
    textKey: 'home.benefit.consult.text',
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
  if (!description) return settingsStore.t('home.featured.fallbackDescription')

  return description.length > 110 ? `${description.slice(0, 110)}...` : description
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
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0) 55%);
  z-index: 1;
  pointer-events: none;
}

.hero-visual img {
  width: 100%;
  height: 600px;
  object-fit: cover;
  object-position: center;
  display: block;
  transition: transform 8s ease;
}

.hero-visual:hover img {
  transform: scale(1.04);
}

.hero-image-float {
  animation: float 6s ease-in-out infinite;
  animation-delay: 1s;
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
  background: linear-gradient(90deg, #38bdf8, #2563eb, #7c3aed);
  background-size: 200% 100%;
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
  transition: background 0.25s ease, transform 0.2s ease, box-shadow 0.25s ease;
}

.hero-search button:hover {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
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
  background: linear-gradient(
    90deg,
    rgba(15, 23, 42, 0.88) 0%,
    rgba(15, 23, 42, 0.58) 42%,
    rgba(15, 23, 42, 0.16) 100%
  );
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
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              border-color 0.3s ease;
}

.step-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 18px 48px rgba(15, 23, 42, 0.1);
  border-color: #bfdbfe;
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
  transition: transform 0.3s ease, background 0.3s ease;
}

.step-card:hover .step-icon {
  transform: scale(1.1);
  background: #2563eb;
  color: #ffffff;
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
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.3s cubic-bezier(0.22, 1, 0.36, 1),
              border-color 0.3s ease;
}

.benefit-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.1);
  border-color: #bfdbfe;
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
  transition: transform 0.3s ease, background 0.3s ease;
}

.benefit-card:hover i {
  transform: scale(1.1);
  background: #2563eb;
  color: #ffffff;
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
    radial-gradient(circle at top right, rgba(96, 165, 250, 0.25), transparent 32%), #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;
  transition: box-shadow 0.4s ease;
}

.cta-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 30px;
  padding: 2px;
  background: linear-gradient(135deg, rgba(96, 165, 250, 0.4), rgba(124, 58, 237, 0.3), rgba(244, 164, 27, 0.3));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.cta-card:hover::before {
  opacity: 1;
}

.cta-card:hover {
  box-shadow: 0 24px 60px rgba(37, 99, 235, 0.15);
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
    border-radius: 26px;
  }

  .hero-visual::before {
    inset: 0;
    width: auto;
    height: auto;
  }

  .hero-visual img {
    width: 100%;
    height: 360px;
    object-fit: cover;
    object-position: center;
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
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.12) 0%, rgba(15, 23, 42, 0.84) 100%);
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

  .hero-visual {
    min-height: 300px;
    border-radius: 22px;
  }

  .hero-visual img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    object-position: center;
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
