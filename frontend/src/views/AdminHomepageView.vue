<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">{{ settingsStore.t('admin.workspace') }}</p>
          <h1 class="section-heading mb-1">{{ settingsStore.t('adminHomepage.title') }}</h1>
          <p class="section-subheading mb-0">{{ settingsStore.t('adminHomepage.subtitle') }}</p>
        </div>
        <RouterLink to="/admin" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>{{ settingsStore.t('admin.common.overview') }}
        </RouterLink>
      </header>

      <section class="homepage-layout">
        <div class="section-list">
          <article
            v-for="section in homepageSections"
            :key="section.key"
            class="panel section-card"
            :class="{ active: editingSection === section.key }"
          >
            <div>
              <span class="section-meta">{{ section.eyebrow }}</span>
              <h2>{{ section.title }}</h2>
              <p>{{ section.note }}</p>
            </div>
            <button type="button" class="btn btn-sm btn-outline-primary" @click="openEditor(section)">
              <i class="bi bi-pencil-square me-1"></i>{{ settingsStore.t('common.edit') }}
            </button>
          </article>
        </div>

        <aside class="panel editor-panel">
          <div class="panel-heading">
            <div>
              <h2>{{ currentSection?.title || settingsStore.t('adminHomepage.selectSection') }}</h2>
              <p>{{ currentSection ? settingsStore.t('adminHomepage.editorReady') : settingsStore.t('adminHomepage.editorEmpty') }}</p>
            </div>
          </div>

          <form v-if="currentSection" class="editor-form" @submit.prevent="saveSection">
            <label v-for="field in currentSection.fields" :key="field.key">
              <span>{{ field.label }}</span>
              <textarea v-if="field.type === 'textarea'" v-model="draft[field.key]" class="form-control" :rows="field.rows || 3"></textarea>
              <input v-else v-model="draft[field.key]" class="form-control" type="text" />
            </label>
            <div class="form-actions">
              <button type="button" class="btn btn-outline-secondary" @click="closeEditor">{{ settingsStore.t('common.cancel') }}</button>
              <button type="submit" class="btn btn-gpe-primary" :disabled="saving">
                {{ saving ? settingsStore.t('common.saving') : settingsStore.t('adminHomepage.saveSection') }}
              </button>
            </div>
          </form>
        </aside>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api'

const settingsStore = useSettingsStore()
const saving = ref(false)
const editingSection = ref('hero')
const draft = ref({})

const homepageSections = [
  {
    key: 'hero',
    eyebrow: settingsStore.t('adminHomepage.section.hero.eyebrow'),
    title: settingsStore.t('adminHomepage.section.hero.title'),
    note: settingsStore.t('adminHomepage.section.hero.note'),
    fields: [
      { key: 'home.hero.badge', label: settingsStore.t('adminHomepage.field.badge') },
      { key: 'home.hero.title', label: settingsStore.t('adminHomepage.field.title'), type: 'textarea', rows: 2 },
      { key: 'home.hero.subtitle', label: settingsStore.t('adminHomepage.field.subtitle'), type: 'textarea', rows: 4 },
      { key: 'home.hero.searchPlaceholder', label: settingsStore.t('adminHomepage.field.searchPlaceholder') },
      { key: 'home.hero.searchButton', label: settingsStore.t('adminHomepage.field.searchButton') },
      { key: 'home.hero.explorePrograms', label: settingsStore.t('adminHomepage.field.primaryButton') },
      { key: 'home.hero.bookConsultation', label: settingsStore.t('adminHomepage.field.secondaryButton') },
    ],
  },
  {
    key: 'destinations',
    eyebrow: settingsStore.t('adminHomepage.section.destinations.eyebrow'),
    title: settingsStore.t('adminHomepage.section.destinations.title'),
    note: settingsStore.t('adminHomepage.section.destinations.note'),
    fields: [
      { key: 'home.destinations.kicker', label: settingsStore.t('adminHomepage.field.kicker') },
      { key: 'home.destinations.title', label: settingsStore.t('adminHomepage.field.title'), type: 'textarea', rows: 2 },
      { key: 'home.destinations.subtitle', label: settingsStore.t('adminHomepage.field.subtitle'), type: 'textarea', rows: 3 },
      { key: 'home.destinations.label', label: settingsStore.t('adminHomepage.field.destinationLabel') },
      { key: 'home.destinations.viewPrograms', label: settingsStore.t('adminHomepage.field.viewProgramsLink') },
    ],
  },
  {
    key: 'featured',
    eyebrow: settingsStore.t('adminHomepage.section.featured.eyebrow'),
    title: settingsStore.t('adminHomepage.section.featured.title'),
    note: settingsStore.t('adminHomepage.section.featured.note'),
    fields: [
      { key: 'home.featured.kicker', label: settingsStore.t('adminHomepage.field.kicker') },
      { key: 'home.featured.title', label: settingsStore.t('adminHomepage.field.title') },
      { key: 'home.featured.subtitle', label: settingsStore.t('adminHomepage.field.subtitle'), type: 'textarea', rows: 3 },
      { key: 'home.featured.viewAll', label: settingsStore.t('adminHomepage.field.viewAllLink') },
    ],
  },
  {
    key: 'process',
    eyebrow: settingsStore.t('adminHomepage.section.process.eyebrow'),
    title: settingsStore.t('adminHomepage.section.process.title'),
    note: settingsStore.t('adminHomepage.section.process.note'),
    fields: [
      { key: 'home.process.kicker', label: settingsStore.t('adminHomepage.field.kicker') },
      { key: 'home.process.title', label: settingsStore.t('adminHomepage.field.title') },
      { key: 'home.process.subtitle', label: settingsStore.t('adminHomepage.field.subtitle'), type: 'textarea', rows: 3 },
      { key: 'home.step.explore.title', label: settingsStore.t('adminHomepage.field.step1Title') },
      { key: 'home.step.explore.text', label: settingsStore.t('adminHomepage.field.step1Text'), type: 'textarea', rows: 2 },
      { key: 'home.step.compare.title', label: settingsStore.t('adminHomepage.field.step2Title') },
      { key: 'home.step.compare.text', label: settingsStore.t('adminHomepage.field.step2Text'), type: 'textarea', rows: 2 },
      { key: 'home.step.consult.title', label: settingsStore.t('adminHomepage.field.step3Title') },
      { key: 'home.step.consult.text', label: settingsStore.t('adminHomepage.field.step3Text'), type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'why',
    eyebrow: settingsStore.t('adminHomepage.section.why.eyebrow'),
    title: settingsStore.t('adminHomepage.section.why.title'),
    note: settingsStore.t('adminHomepage.section.why.note'),
    fields: [
      { key: 'home.why.kicker', label: settingsStore.t('adminHomepage.field.kicker') },
      { key: 'home.why.title', label: settingsStore.t('adminHomepage.field.title'), type: 'textarea', rows: 2 },
      { key: 'home.why.text', label: settingsStore.t('adminHomepage.field.bodyText'), type: 'textarea', rows: 4 },
      { key: 'home.why.cta', label: settingsStore.t('adminHomepage.field.buttonText') },
      { key: 'home.benefit.destinations.title', label: settingsStore.t('adminHomepage.field.benefit1Title') },
      { key: 'home.benefit.destinations.text', label: settingsStore.t('adminHomepage.field.benefit1Text'), type: 'textarea', rows: 2 },
      { key: 'home.benefit.save.title', label: settingsStore.t('adminHomepage.field.benefit2Title') },
      { key: 'home.benefit.save.text', label: settingsStore.t('adminHomepage.field.benefit2Text'), type: 'textarea', rows: 2 },
      { key: 'home.benefit.compare.title', label: settingsStore.t('adminHomepage.field.benefit3Title') },
      { key: 'home.benefit.compare.text', label: settingsStore.t('adminHomepage.field.benefit3Text'), type: 'textarea', rows: 2 },
      { key: 'home.benefit.consult.title', label: settingsStore.t('adminHomepage.field.benefit4Title') },
      { key: 'home.benefit.consult.text', label: settingsStore.t('adminHomepage.field.benefit4Text'), type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'cta',
    eyebrow: settingsStore.t('adminHomepage.section.cta.eyebrow'),
    title: settingsStore.t('adminHomepage.section.cta.title'),
    note: settingsStore.t('adminHomepage.section.cta.note'),
    fields: [
      { key: 'home.cta.kicker', label: settingsStore.t('adminHomepage.field.kicker') },
      { key: 'home.cta.title', label: settingsStore.t('adminHomepage.field.title'), type: 'textarea', rows: 2 },
      { key: 'home.cta.text', label: settingsStore.t('adminHomepage.field.bodyText'), type: 'textarea', rows: 3 },
      { key: 'home.cta.button', label: settingsStore.t('adminHomepage.field.buttonText') },
    ],
  },
]

const currentSection = computed(() => homepageSections.find((section) => section.key === editingSection.value))

openEditor(currentSection.value)

function openEditor(section) {
  if (!section) return
  editingSection.value = section.key
  draft.value = Object.fromEntries(section.fields.map((field) => [field.key, settingsStore.t(field.key)]))
}

function closeEditor() {
  draft.value = {}
  editingSection.value = ''
}

async function saveSection() {
  if (!currentSection.value) return
  saving.value = true
  try {
    await api.patch('/api/admin/ui-text', {
      locale: 'EN',
      entries: currentSection.value.fields.map((field) => ({
        key: field.key,
        text: String(draft.value[field.key] || '').trim(),
      })),
    })
    await settingsStore.fetchUiTranslations()
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-page { background: #f8fafc; min-height: 70vh; padding: 2rem 0 3rem; }
.admin-header, .section-card, .panel-heading { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
.admin-header { margin-bottom: 1rem; }
.eyebrow, .section-meta { color: #f4a41b; font-size: 0.78rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.section-heading { color: #0f172a; font-weight: 850; }
.section-subheading, .section-card p, .panel-heading p { color: #64748b; }
.homepage-layout { align-items: start; display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr) 390px; }
.section-list, .editor-form { display: grid; gap: 0.85rem; }
.panel { background: #fff; border: 1px solid #e5edf7; border-radius: 10px; box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06); padding: 1rem; }
.section-card.active { border-color: rgba(244, 164, 27, 0.55); box-shadow: 0 16px 40px rgba(244, 164, 27, 0.12); }
.section-card h2, .panel-heading h2 { color: #0f172a; font-size: 1rem; font-weight: 850; margin: 0.2rem 0; }
.section-card p, .panel-heading p { margin: 0; }
.editor-panel { position: sticky; top: 6rem; }
label { display: grid; gap: 0.35rem; }
label > span { color: #334155; font-size: 0.78rem; font-weight: 850; }
.form-actions { display: flex; gap: 0.75rem; justify-content: flex-end; }
@media (max-width: 991.98px) { .homepage-layout { grid-template-columns: 1fr; } .editor-panel { position: static; } }
@media (max-width: 767.98px) { .admin-header, .section-card, .panel-heading { align-items: stretch; flex-direction: column; } }
</style>
