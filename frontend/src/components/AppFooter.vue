<template>
  <footer class="app-footer">
    <div class="container">
      <div class="footer-main">
        <!-- Brand -->
        <div class="footer-brand">
          <h5 class="footer-logo">
            Global <span>Path - </span>Education
          </h5>
          <p>
            Helping students explore IT programs, compare study options, and plan their global education journey.
          </p>
        </div>

        <!-- Links -->
        <div class="footer-section">
          <h6>Explore</h6>
          <RouterLink to="/programs">Programs</RouterLink>
          <RouterLink to="/compare">Compare</RouterLink>
          <RouterLink to="/consult">Consultation</RouterLink>
        </div>

        <!-- Contact -->
        <div class="footer-section">
          <h6>Contact</h6>
          <a href="mailto:info@globalpaths.edu">
            <i class="bi bi-envelope"></i>
            info@globalpaths.edu
          </a>
          <a href="tel:+18005550199">
            <i class="bi bi-telephone"></i>
            +1 (800) 555-0199
          </a>
        </div>

        <!-- Social -->
        <div class="footer-section">
          <h6>Follow</h6>
          <div class="social-links">
            <a
              v-for="social in socialLinks"
              :key="social.label"
              :href="social.href"
              :aria-label="social.label"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i :class="social.icon"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="footer-bottom">
        <span>© 2026 GlobalPath Education. All rights reserved.</span>
        <!-- <span class="footer-note">Built for coursework project.</span> -->
      </div>
    </div>
  </footer>
</template>

<script setup>
const socialLinks = [
  { label: 'Facebook', icon: 'bi bi-facebook', href: '#' },
  { label: 'Instagram', icon: 'bi bi-instagram', href: '#' },
  { label: 'LinkedIn', icon: 'bi bi-linkedin', href: '#' },
  { label: 'YouTube', icon: 'bi bi-youtube', href: '#' },
]
</script>

<style scoped>
.app-footer {
  margin-top: 4rem;
  padding: 3rem 0 1.5rem;
  background: #0f172a;
  color: #cbd5e1;
}

.footer-main {
  display: grid;
  grid-template-columns: 2fr 1fr 1.4fr 1fr;
  gap: 2rem;
}

.footer-logo {
  margin-bottom: 0.75rem;
  color: #0f82d4;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.footer-logo span {
  color: #fccc2e;
}

.footer-brand p {
  max-width: 360px;
  margin: 0;
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.7;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.footer-section h6 {
  margin-bottom: 0.35rem;
  color: #ffffff;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.footer-section a {
  color: #94a3b8;
  text-decoration: none;
  font-size: 0.92rem;
  transition: color 0.2s ease;
}

.footer-section a:hover {
  color: #d17d00;
}

.footer-section i {
  margin-right: 0.45rem;
}

.social-links {
  display: flex;
  gap: 0.6rem;
}

.social-links a {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #1e293b;
  color: #cbd5e1;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.social-links a:hover {
  background: #d17d00;
  color: #ffffff;
  transform: translateY(-2px);
}

.social-links i {
  margin: 0;
}

.footer-bottom {
  margin-top: 2.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid rgba(148, 163, 184, 0.18);
  display: flex;
  justify-content: space-around;
  gap: 1rem;
  color: #ffc108;
  font-size: 0.85rem;
}

@media (max-width: 991.98px) {
  .footer-main {
    grid-template-columns: 1fr 1fr;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 575.98px) {
  .app-footer {
    padding: 2.5rem 0 1.25rem;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 1.75rem;
  }

  .footer-bottom {
    flex-direction: column;
  }
}
</style>
