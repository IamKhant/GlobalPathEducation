<template>
  <nav :class="['navbar navbar-expand-lg gpe-navbar sticky-top', { 'is-scrolled': isScrolled }]">
    <div class="container-fluid nav-shell">
      <!-- Logo -->
      <RouterLink class="navbar-brand d-flex align-items-center" to="/">
        <img :src="logo" alt="GlobalPath Education Logo" class="navbar-logo" />
      </RouterLink>

      <!-- Mobile toggle button -->
      <button
        class="navbar-toggler border-0 shadow-none"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#globalPathNavbar"
        aria-controls="globalPathNavbar"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <i class="bi bi-list fs-2"></i>
      </button>

      <!-- Collapsible content -->
      <div id="globalPathNavbar" class="collapse navbar-collapse">
        <!-- Center links -->
        <ul class="navbar-nav nav-center mx-lg-auto mb-3 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" active-class="active">
              <i class="bi bi-house-door"></i>
              <span>Home</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/programs" active-class="active">
              <i class="bi bi-mortarboard"></i>
              <span>Programs</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/compare" active-class="active">
              <i class="bi bi-bar-chart-steps"></i>
              <span>
                Compare
                <span
                  v-if="userStore.compareList.length"
                  class="badge rounded-pill bg-warning text-dark ms-1"
                >
                  {{ userStore.compareList.length }}
                </span>
              </span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/consult" active-class="active">
              <i class="bi bi-calendar-check"></i>
              <span>Consultation</span>
            </RouterLink>
          </li>
        </ul>

        <!-- Right side -->
        <div class="navbar-actions d-flex flex-column flex-lg-row align-items-lg-center gap-2">
          <span class="language-pill">EN</span>

          <template v-if="isSignedIn">
            <RouterLink to="/bookmarks" class="nav-action-link" active-class="active">
              <i class="bi bi-bookmark-heart"></i>
              <span>Saved</span>
            </RouterLink>

            <RouterLink to="/dashboard" class="nav-action-link" active-class="active">
              <i class="bi bi-ui-checks"></i>
              <span>Dashboard</span>
            </RouterLink>

            <UserButton />
          </template>

          <template v-else>
            <RouterLink to="/sign-in" class="btn btn-sm btn-outline-primary rounded-pill px-3">
              Sign In
            </RouterLink>

            <RouterLink to="/sign-up" class="btn btn-sm btn-primary rounded-pill px-3 fw-semibold">
              Get Started
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuth, UserButton } from '@clerk/vue'
import { useUserStore } from '@/stores/user'
import logo from '@/assets/logo/globalPathLogoTransparent.png'

const { isSignedIn } = useAuth()
const userStore = useUserStore()

const isScrolled = ref(false)
const compactAt = 80
const expandAt = 24

function handleScroll() {
  if (!isScrolled.value && window.scrollY > compactAt) {
    isScrolled.value = true
  }

  if (isScrolled.value && window.scrollY < expandAt) {
    isScrolled.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.gpe-navbar {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-bottom: 1px solid #e5e7eb;
  padding: 0.4rem 0;
  min-height: 70px;
  transition:
    box-shadow 0.25s ease,
    background-color 0.25s ease,
    min-height 0.25s ease,
    padding 0.25s ease;
  z-index: 1030;
}

.gpe-navbar.is-scrolled {
  background: rgba(255, 255, 255, 0.72) !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.08);
}

.nav-shell {
  padding-left: 2rem;
  padding-right: 2rem;
  position: relative;
}

.navbar-brand {
  margin-right: 0;
  transform: translateX(-12px);
}

.navbar-logo {
  height: 70px;
  width: auto;
  max-width: 180px;
  object-fit: contain;
  display: block;
  transition:
    height 0.25s ease,
    max-width 0.25s ease;
}

.navbar-collapse {
  position: relative;
}

.nav-center {
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
}

.navbar-actions {
  margin-left: 1rem;
  transform: translateX(12px);
}

.nav-link {
  color: #020617 !important;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.55rem 0.8rem !important;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    width 0.25s ease,
    min-width 0.25s ease,
    padding 0.25s ease;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  font-size: 0.92rem;
  min-width: auto;
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
}

.nav-link i {
  font-size: 1.05rem;
  line-height: 1;
  transition: font-size 0.25s ease;
}

.nav-link > span,
.nav-action-link > span {
  transition:
    opacity 0.18s ease,
    max-width 0.25s ease,
    margin 0.25s ease;
}

.nav-link i,
.nav-link > span,
.nav-action-link i,
.nav-action-link > span {
  color: #020617;
}

.nav-link:hover,
.nav-action-link:hover {
  color: #ffffff !important;
  background: #0f172a;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.16);
  transform: translateY(-1px);
}

.nav-link:hover i,
.nav-link:hover span,
.nav-action-link:hover i,
.nav-action-link:hover span {
  color: #ffffff !important;
}

.nav-link.active,
.nav-link.router-link-active,
.nav-link.router-link-exact-active,
.nav-action-link.router-link-active,
.nav-action-link.router-link-exact-active {
  color: #0d1f33 !important;
  background: #f4a41b;
}

.nav-link.active i,
.nav-link.active span,
.nav-link.router-link-active i,
.nav-link.router-link-active span,
.nav-link.router-link-exact-active i,
.nav-link.router-link-exact-active span,
.nav-action-link.router-link-active i,
.nav-action-link.router-link-active span,
.nav-action-link.router-link-exact-active i,
.nav-action-link.router-link-exact-active span {
  color: #0d1f33 !important;
}

.nav-link.active:hover,
.nav-link.router-link-active:hover,
.nav-link.router-link-exact-active:hover,
.nav-action-link.router-link-active:hover,
.nav-action-link.router-link-exact-active:hover {
  color: #0d1f33 !important;
  background: #f4a41b;
  box-shadow: 0 8px 18px rgba(244, 164, 27, 0.2);
}

.nav-action-link {
  color: #020617 !important;
  text-decoration: none;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.5rem 0.8rem;
  transition:
    color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease,
    width 0.25s ease,
    padding 0.25s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  white-space: nowrap;
}

.language-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  background: #6cd5ff;
  color: #334155;
  font-size: 0.8rem;
  font-weight: 700;
}

.navbar-toggler {
  color: #0a82d3;
}

@media (min-width: 992px) {
  .gpe-navbar.is-scrolled {
    min-height: 58px;
    padding: 0.25rem 0;
  }

  .gpe-navbar.is-scrolled .navbar-logo {
    height: 42px;
    max-width: 130px;
  }

  .gpe-navbar.is-scrolled .nav-center {
    gap: 0.35rem;
  }

  .gpe-navbar.is-scrolled .nav-link {
    width: 42px;
    min-width: 42px;
    height: 42px;
    padding: 0 !important;
    gap: 0;
  }

  .gpe-navbar.is-scrolled .nav-link i {
    font-size: 1.1rem;
  }

  .gpe-navbar.is-scrolled .nav-link > span,
  .gpe-navbar.is-scrolled .nav-action-link > span {
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .gpe-navbar.is-scrolled .nav-action-link {
    width: 42px;
    height: 42px;
    padding: 0;
    gap: 0;
  }
}

@media (min-width: 1200px) {
  .navbar-collapse {
    position: static;
  }

  .nav-center {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    margin: 0 !important;
  }

  .navbar-actions {
    margin-left: auto;
  }
}

@media (max-width: 1199.98px) {
  .nav-shell {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .navbar-brand,
  .navbar-actions {
    transform: none;
  }

  .navbar-logo {
    height: 48px;
    max-width: 160px;
  }

  .nav-link {
    padding: 0.5rem 0.65rem !important;
    font-size: 0.86rem;
  }
}

@media (max-width: 991.98px) {
  .gpe-navbar {
    min-height: 72px;
    padding: 0.45rem 0;
  }

  .nav-shell {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .navbar-logo {
    height: 52px;
    max-width: 150px;
  }

  .navbar-collapse {
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .nav-center {
    align-items: stretch;
    gap: 0.25rem;
    padding-top: 0.25rem;
  }

  .nav-link {
    flex-direction: row;
    justify-content: flex-start;
    min-width: auto;
    text-align: left;
    gap: 0.6rem;
    font-size: 0.92rem;
    padding: 0.75rem 0.85rem !important;
  }

  .nav-link i {
    width: 22px;
    font-size: 1.05rem;
    text-align: center;
  }

  .navbar-actions {
    align-items: stretch !important;
    margin-left: 0;
    padding-top: 0.75rem;
    border-top: 1px solid #e5e7eb;
  }

  .nav-action-link {
    padding: 0.75rem 0.85rem;
  }

  .language-pill {
    margin-bottom: 0.25rem;
  }
}
</style>
