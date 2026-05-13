<template>
  <nav :class="['navbar navbar-expand-custom gpe-navbar sticky-top', { 'is-scrolled': isScrolled }]">
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
        :aria-label="settingsStore.t('nav.toggle')"
      >
        <i class="bi bi-list fs-2"></i>
      </button>

      <!-- Collapsible content -->
      <div id="globalPathNavbar" class="collapse navbar-collapse">
        <!-- Primary links -->
        <ul class="navbar-nav nav-center mb-3 mb-lg-0">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/" active-class="active">
              <i class="bi bi-house-door"></i>
              <span>{{ settingsStore.t('nav.home') }}</span>
            </RouterLink>
          </li>

          <li class="nav-item">
            <RouterLink class="nav-link" to="/programs" active-class="active">
              <i class="bi bi-mortarboard"></i>
              <span>{{ settingsStore.t('nav.programs') }}</span>
            </RouterLink>
          </li>

          <li v-if="!userStore.isStaff" class="nav-item">
            <RouterLink class="nav-link" to="/compare" active-class="active">
              <i class="bi bi-bar-chart-steps"></i>
              <span>
                {{ settingsStore.t('nav.compare') }}
                <span
                  v-if="userStore.compareList.length"
                  class="badge rounded-pill bg-warning text-dark ms-1"
                >
                  {{ userStore.compareList.length }}
                </span>
              </span>
            </RouterLink>
          </li>

          <li v-if="!userStore.isStaff" class="nav-item">
            <RouterLink class="nav-link" to="/consult" active-class="active">
              <i class="bi bi-calendar-check"></i>
              <span>{{ settingsStore.t('nav.consultation') }}</span>
            </RouterLink>
          </li>
        </ul>

        <!-- Right side -->
        <div class="navbar-actions d-flex flex-column flex-lg-row align-items-lg-center gap-2">
          <div class="nav-settings d-flex align-items-center gap-2">
            <div
              ref="settingsPillRef"
              class="settings-pill"
              :class="{ open: isCurrencyMenuOpen || isLanguageMenuOpen }"
            >
              <button
                type="button"
                class="settings-lang"
                :aria-label="settingsStore.t('nav.languageLabel')"
                :aria-expanded="isLanguageMenuOpen"
                @click="toggleLanguageMenu"
              >
                {{ settingsStore.selectedLanguage }}
              </button>
              <span class="settings-divider"></span>
              <button
                type="button"
                class="settings-currency-btn"
                :aria-label="settingsStore.t('nav.currencyLabel')"
                :aria-expanded="isCurrencyMenuOpen"
                @click="toggleCurrencyMenu"
              >
                <i class="bi bi-currency-exchange"></i>
                <span>{{ settingsStore.selectedCurrency }}</span>
                <i class="bi bi-chevron-down currency-chevron"></i>
              </button>

              <div v-if="isLanguageMenuOpen" class="language-menu">
                <button
                  v-for="language in settingsStore.supportedLanguages"
                  :key="language.code"
                  type="button"
                  class="language-option"
                  :class="{ selected: language.code === settingsStore.selectedLanguage }"
                  @click="selectLanguage(language.code)"
                >
                  <span>{{ language.code }}</span>
                  <small>{{ language.label }}</small>
                </button>
              </div>

              <div v-if="isCurrencyMenuOpen" class="currency-menu">
                <input
                  v-model="customCurrency"
                  class="currency-input"
                  maxlength="3"
                  :placeholder="settingsStore.t('nav.currencyPlaceholder')"
                  :aria-label="settingsStore.t('nav.currencyInputLabel')"
                  @input="customCurrency = customCurrency.toUpperCase().replace(/[^A-Z]/g, '')"
                  @keydown.enter.prevent="applyCustomCurrency"
                  @keydown.esc="closeSettingsMenus"
                />

                <div class="currency-options">
                  <button
                    v-for="currency in settingsStore.supportedCurrencies"
                    :key="currency"
                    type="button"
                    class="currency-option"
                    :class="{ selected: currency === settingsStore.selectedCurrency }"
                    @click="selectCurrency(currency)"
                  >
                    {{ currency }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <template v-if="isSignedIn">
            <RouterLink v-if="!userStore.isStaff" to="/bookmarks" class="nav-action-link" active-class="active">
              <i class="bi bi-bookmark-heart"></i>
              <span>{{ settingsStore.t('nav.saved') }}</span>
            </RouterLink>

            <RouterLink
              :to="dashboardRoute"
              class="nav-action-link"
              active-class="active"
            >
              <i class="bi bi-ui-checks"></i>
              <span>{{ settingsStore.t('nav.dashboard') }}</span>
            </RouterLink>

            <RouterLink to="/profile" class="nav-avatar-link" active-class="active">
              <div class="nav-avatar">
                <img v-if="userImageUrl" :src="userImageUrl" alt="Profile" class="nav-avatar-photo" />
                <span v-else-if="userInitial">{{ userInitial }}</span>
                <i v-else class="bi bi-person-fill"></i>
              </div>
              <span class="nav-avatar-name">{{ userFirstName }}</span>
            </RouterLink>

          </template>

          <template v-else>
            <RouterLink to="/sign-in" class="btn btn-sm btn-outline-primary rounded-pill px-3">
              {{ settingsStore.t('nav.signIn') }}
            </RouterLink>

            <RouterLink to="/sign-up" class="btn btn-sm btn-primary rounded-pill px-3 fw-semibold">
              {{ settingsStore.t('nav.getStarted') }}
            </RouterLink>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { useAuth, useUser } from '@clerk/vue'
import { useSettingsStore } from '@/stores/settings'
import { useUserStore } from '@/stores/user'
import logo from '@/assets/logo/GlobalPathLogoTransparent.png'

const route = useRoute()
const { isSignedIn } = useAuth()
const { user } = useUser()
const settingsStore = useSettingsStore()
const userStore = useUserStore()

const userFirstName = computed(() => {
  return userStore.profile?.firstName || user.value?.firstName || ''
})

const userImageUrl = computed(() => {
  return user.value?.imageUrl || userStore.profile?.profileImageUrl || ''
})

const userInitial = computed(() => {
  const name = userStore.profile?.firstName || user.value?.firstName ||
               userStore.profile?.lastName || user.value?.lastName || ''
  return name ? name.charAt(0).toUpperCase() : ''
})

const isScrolled = ref(false)
const isCurrencyMenuOpen = ref(false)
const isLanguageMenuOpen = ref(false)
const customCurrency = ref('')
const compactAt = 80
const expandAt = 24
const dashboardRoute = computed(() => {
  if (userStore.isAdmin) return '/admin'
  if (userStore.isConsultant) return '/consultant'
  return '/dashboard'
})

function closeCurrencyMenu() {
  isCurrencyMenuOpen.value = false
  customCurrency.value = ''
}

function closeLanguageMenu() {
  isLanguageMenuOpen.value = false
}

function closeSettingsMenus() {
  closeCurrencyMenu()
  closeLanguageMenu()
}

function toggleLanguageMenu() {
  isLanguageMenuOpen.value = !isLanguageMenuOpen.value
  isCurrencyMenuOpen.value = false
  customCurrency.value = ''
}

function toggleCurrencyMenu() {
  isCurrencyMenuOpen.value = !isCurrencyMenuOpen.value
  isLanguageMenuOpen.value = false
}

function selectLanguage(language) {
  settingsStore.setLanguage(language)
  closeLanguageMenu()
}

function selectCurrency(currency) {
  settingsStore.setCurrency(currency)
  closeCurrencyMenu()
}

function applyCustomCurrency() {
  if (customCurrency.value.length !== 3) return

  settingsStore.setCurrency(customCurrency.value)
  closeCurrencyMenu()
}

function handleScroll() {
  if (!isScrolled.value && window.scrollY > compactAt) {
    isScrolled.value = true
  }

  if (isScrolled.value && window.scrollY < expandAt) {
    isScrolled.value = false
  }
}

const settingsPillRef = ref(null)

function handleDocumentPointerDown(event) {
  if (!isCurrencyMenuOpen.value && !isLanguageMenuOpen.value) return

  if (settingsPillRef.value?.contains(event.target)) return

  closeSettingsMenus()
}

function handleDocumentKeydown(event) {
  if (event.key === 'Escape') {
    closeSettingsMenus()
    closeMobileMenu()
  }
}

function closeMobileMenu() {
  const el = document.getElementById('globalPathNavbar')
  if (!el || !el.classList.contains('show')) return
  const bsCollapse = window.bootstrap?.Collapse?.getInstance(el)
  if (bsCollapse) bsCollapse.hide()
  else el.classList.remove('show')
}

function handleOutsideClick(event) {
  const navbar = document.querySelector('.gpe-navbar')
  if (!navbar) return
  const el = document.getElementById('globalPathNavbar')
  if (el && el.classList.contains('show') && !navbar.contains(event.target)) {
    closeMobileMenu()
  }
}

// Close mobile menu on route change
watch(() => route.fullPath, () => {
  closeMobileMenu()
  closeSettingsMenus()
})

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  document.addEventListener('pointerdown', handleOutsideClick)
  document.addEventListener('keydown', handleDocumentKeydown)
  handleScroll()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  document.removeEventListener('pointerdown', handleOutsideClick)
  document.removeEventListener('keydown', handleDocumentKeydown)
})
</script>

<style scoped>
.gpe-navbar {
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-bottom: 1px solid #e5e7eb;
  padding: 0.75rem 0;
  min-height: 88px;
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
  z-index: 2;
}

.navbar-logo {
  height: 82px;
  width: auto;
  max-width: 180px;
  object-fit: contain;
  display: block;
  transition:
    height 0.25s ease,
    max-width 0.25s ease;
}

.nav-center {
  align-items: center;
  justify-content: flex-start;
  gap: 0.25rem;
}

.navbar-actions {
  margin-left: auto;
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

/* User avatar link */
.nav-avatar-link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  text-decoration: none;
  padding: 0.3rem;
  border-radius: 999px;
  transition: background 0.2s ease, transform 0.15s ease;
}

.nav-avatar-link:hover {
  background: rgba(15, 23, 42, 0.06);
}

.nav-avatar-link.active,
.nav-avatar-link.router-link-active {
  background: rgba(37, 99, 235, 0.08);
}

.nav-avatar {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: linear-gradient(135deg, #1a3a5c, #2e7dc7);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.02em;
  flex-shrink: 0;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.nav-avatar-photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nav-avatar-link:hover .nav-avatar {
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(26, 58, 92, 0.2);
}

.nav-avatar-link.active .nav-avatar,
.nav-avatar-link.router-link-active .nav-avatar {
  box-shadow: 0 0 0 2px #ffffff, 0 0 0 4px #2563eb;
}

.nav-avatar-name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #0f172a;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-settings {
  flex-shrink: 0;
}

/* ── Combined settings pill (lang + currency) ── */
.settings-pill {
  display: inline-flex;
  align-items: center;
  position: relative;
  border-radius: 999px;
  background: #6cd5ff;
  font-size: 0.8rem;
  font-weight: 700;
  color: #334155;
  overflow: visible;
}

.settings-lang {
  border: 0;
  background: transparent;
  color: #334155;
  cursor: pointer;
  font: inherit;
  padding: 0.35rem 0.55rem 0.35rem 0.7rem;
  font-weight: 800;
  letter-spacing: 0.3px;
}

.settings-lang:hover {
  background: rgba(0, 0, 0, 0.06);
  border-radius: 999px 0 0 999px;
}

.settings-divider {
  width: 1px;
  height: 18px;
  background: rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.settings-currency-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.35rem 0.6rem 0.35rem 0.55rem;
  border: 0;
  border-radius: 0 999px 999px 0;
  background: transparent;
  color: #334155;
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition: background 0.15s;
}

.settings-currency-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.settings-currency-btn i {
  color: #334155;
}

.settings-currency-btn span {
  min-width: 2rem;
}

.currency-chevron {
  font-size: 0.7rem;
}

.currency-menu,
.language-menu {
  position: absolute;
  right: 0;
  top: calc(100% + 0.5rem);
  width: 180px;
  padding: 0.6rem;
  border: 1px solid #dbe4ee;
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.18);
  z-index: 1040;
  animation: slideDown 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.language-menu {
  left: 0;
  right: auto;
  width: 190px;
  display: grid;
  gap: 0.35rem;
}

.language-option {
  align-items: center;
  background: #f8fafc;
  border: 0;
  border-radius: 8px;
  color: #334155;
  display: flex;
  gap: 0.55rem;
  height: 36px;
  padding: 0 0.65rem;
  text-align: left;
}

.language-option span {
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 850;
  min-width: 2.2rem;
}

.language-option small {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 700;
}

.language-option:hover,
.language-option.selected {
  background: #f4a41b;
}

.language-option:hover span,
.language-option:hover small,
.language-option.selected span,
.language-option.selected small {
  color: #0d1f33;
}

.currency-input {
  width: 100%;
  height: 34px;
  padding: 0 0.65rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  color: #0f172a;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  outline: 0;
}

.currency-input:focus {
  border-color: #0a82d3;
  box-shadow: 0 0 0 3px rgba(10, 130, 211, 0.12);
}

.currency-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
  margin-top: 0.5rem;
}

.currency-option {
  height: 32px;
  border: 0;
  border-radius: 8px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.76rem;
  font-weight: 800;
}

.currency-option:hover,
.currency-option.selected {
  background: #f4a41b;
  color: #0d1f33;
}

.settings-pill i {
  font-size: 0.9rem;
}

.navbar-toggler {
  color: #0a82d3;
}

/* ── lg expanded: scrolled compact ── */
@media (min-width: 800px) {
  .navbar-expand-custom {
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .navbar-expand-custom .navbar-toggler {
    display: none;
  }

  .navbar-expand-custom .navbar-collapse {
    display: flex !important;
    flex-basis: auto;
  }

  .navbar-expand-custom .navbar-nav {
    flex-direction: row;
  }

  .nav-center {
    margin-bottom: 0 !important;
  }

  .navbar-actions {
    align-items: center !important;
    flex-direction: row !important;
  }

  .navbar-brand {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .gpe-navbar.is-scrolled {
    min-height: 88px;
    padding: 0.75rem 0;
  }

  .gpe-navbar.is-scrolled .navbar-logo {
    height: 82px;
    max-width: 180px;
  }

  .gpe-navbar.is-scrolled .nav-center {
    gap: 0.35rem;
  }

  .gpe-navbar.is-scrolled .nav-link,
  .gpe-navbar.is-scrolled .nav-action-link {
    width: auto;
    height: auto;
  }
}

/* ── 800px–1199px: compact actions and primary nav ── */
@media (min-width: 800px) and (max-width: 1199.98px) {
  .nav-action-link > span {
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
  }

  .nav-avatar-name {
    display: none;
  }

  .nav-link {
    width: 42px;
    min-width: 42px;
    height: 42px;
    padding: 0 !important;
    gap: 0;
  }

  .nav-link i {
    font-size: 1.1rem;
  }

  .nav-action-link {
    width: 42px;
    height: 42px;
    padding: 0;
    gap: 0;
  }

  .settings-currency-btn span {
    display: none;
  }

  .settings-lang {
    padding: 0.35rem 0.5rem;
  }
}

/* ── 800px–1199px: icon-only primary nav too ── */
@media (min-width: 800px) and (max-width: 1199.98px) {
  .nav-link > span {
    max-width: 0;
    opacity: 0;
    overflow: hidden;
    pointer-events: none;
  }
}

/* ── ≥1200px: full primary nav labels return ── */
@media (min-width: 1200px) {
  .nav-link > span {
    max-width: 12rem;
    opacity: 1;
  }
}

/* ── ≥1320px: full right action labels return ── */
@media (min-width: 1320px) {
  .nav-action-link > span,
  .settings-currency-btn span {
    display: inline;
    max-width: 8rem;
    opacity: 1;
  }
}

@media (max-width: 1399.98px) {
  .nav-shell {
    padding-left: 1.25rem;
    padding-right: 1.25rem;
  }

  .navbar-brand,
  .navbar-actions {
    transform: none;
  }

  .navbar-brand {
    transform: translate(-50%, -50%);
  }

  .navbar-logo {
    height: 62px;
    max-width: 160px;
  }
}

@media (max-width: 799.98px) {
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

  .navbar-brand {
    position: static;
    transform: none;
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

  .settings-pill {
    margin-bottom: 0.25rem;
  }

  .settings-currency-btn span {
    display: inline;
  }
}
</style>
