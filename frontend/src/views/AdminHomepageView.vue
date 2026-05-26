<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">Admin Workspace</p>
          <h1 class="section-heading mb-1">Homepage editor</h1>
          <p class="section-subheading mb-0">Update public homepage copy section by section.</p>
        </div>
        <RouterLink to="/admin" class="btn btn-sm btn-outline-secondary rounded-pill px-3">
          <i class="bi bi-arrow-left me-1"></i>Admin overview
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
              <i class="bi bi-pencil-square me-1"></i>Edit
            </button>
          </article>
        </div>

        <aside class="panel editor-panel">
          <div class="panel-heading">
            <div>
              <h2>{{ currentSection?.title || 'Select a section' }}</h2>
              <p>{{ currentSection ? 'Update these fields and save to apply changes.' : 'Choose a homepage section to edit.' }}</p>
            </div>
          </div>

          <form v-if="currentSection" class="editor-form" @submit.prevent="saveSection">
            <label v-for="field in currentSection.fields" :key="field.key">
              <span>{{ field.label }}</span>
              <textarea v-if="field.type === 'textarea'" v-model="draft[field.key]" class="form-control" :rows="field.rows || 3"></textarea>
              <input v-else v-model="draft[field.key]" class="form-control" type="text" />
            </label>
            <div class="form-actions">
              <button type="button" class="btn btn-outline-secondary" @click="closeEditor">Cancel</button>
              <button type="submit" class="btn btn-gpe-primary" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save section' }}
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
    eyebrow: 'Hero',
    title: 'Hero section',
    note: 'Main first-screen message, search bar copy, and action buttons.',
    fields: [
      { key: 'home.hero.badge', label: 'Badge' },
      { key: 'home.hero.title', label: 'Title', type: 'textarea', rows: 2 },
      { key: 'home.hero.subtitle', label: 'Subtitle', type: 'textarea', rows: 4 },
      { key: 'home.hero.searchPlaceholder', label: 'Search placeholder' },
      { key: 'home.hero.searchButton', label: 'Search button' },
      { key: 'home.hero.explorePrograms', label: 'Primary button' },
      { key: 'home.hero.bookConsultation', label: 'Secondary button' },
    ],
  },
  {
    key: 'destinations',
    eyebrow: 'Destinations',
    title: 'Destination slideshow',
    note: 'Intro copy for the destination carousel and country links.',
    fields: [
      { key: 'home.destinations.kicker', label: 'Kicker' },
      { key: 'home.destinations.title', label: 'Title', type: 'textarea', rows: 2 },
      { key: 'home.destinations.subtitle', label: 'Subtitle', type: 'textarea', rows: 3 },
      { key: 'home.destinations.label', label: 'Destination label' },
      { key: 'home.destinations.viewPrograms', label: 'View programs link' },
    ],
  },
  {
    key: 'featured',
    eyebrow: 'Featured',
    title: 'Featured programs',
    note: 'Headline and support copy for featured program cards.',
    fields: [
      { key: 'home.featured.kicker', label: 'Kicker' },
      { key: 'home.featured.title', label: 'Title' },
      { key: 'home.featured.subtitle', label: 'Subtitle', type: 'textarea', rows: 3 },
      { key: 'home.featured.viewAll', label: 'View all link' },
    ],
  },
  {
    key: 'process',
    eyebrow: 'Process',
    title: 'How it works',
    note: 'Section heading and step descriptions.',
    fields: [
      { key: 'home.process.kicker', label: 'Kicker' },
      { key: 'home.process.title', label: 'Title' },
      { key: 'home.process.subtitle', label: 'Subtitle', type: 'textarea', rows: 3 },
      { key: 'home.step.explore.title', label: 'Step 1 title' },
      { key: 'home.step.explore.text', label: 'Step 1 text', type: 'textarea', rows: 2 },
      { key: 'home.step.compare.title', label: 'Step 2 title' },
      { key: 'home.step.compare.text', label: 'Step 2 text', type: 'textarea', rows: 2 },
      { key: 'home.step.consult.title', label: 'Step 3 title' },
      { key: 'home.step.consult.text', label: 'Step 3 text', type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'why',
    eyebrow: 'Why choose us',
    title: 'Trust-building section',
    note: 'Main explanation plus benefit cards.',
    fields: [
      { key: 'home.why.kicker', label: 'Kicker' },
      { key: 'home.why.title', label: 'Title', type: 'textarea', rows: 2 },
      { key: 'home.why.text', label: 'Body text', type: 'textarea', rows: 4 },
      { key: 'home.why.cta', label: 'Button text' },
      { key: 'home.benefit.destinations.title', label: 'Benefit 1 title' },
      { key: 'home.benefit.destinations.text', label: 'Benefit 1 text', type: 'textarea', rows: 2 },
      { key: 'home.benefit.save.title', label: 'Benefit 2 title' },
      { key: 'home.benefit.save.text', label: 'Benefit 2 text', type: 'textarea', rows: 2 },
      { key: 'home.benefit.compare.title', label: 'Benefit 3 title' },
      { key: 'home.benefit.compare.text', label: 'Benefit 3 text', type: 'textarea', rows: 2 },
      { key: 'home.benefit.consult.title', label: 'Benefit 4 title' },
      { key: 'home.benefit.consult.text', label: 'Benefit 4 text', type: 'textarea', rows: 2 },
    ],
  },
  {
    key: 'cta',
    eyebrow: 'Final call-to-action',
    title: 'Closing banner',
    note: 'Last conversion section before the footer.',
    fields: [
      { key: 'home.cta.kicker', label: 'Kicker' },
      { key: 'home.cta.title', label: 'Title', type: 'textarea', rows: 2 },
      { key: 'home.cta.text', label: 'Body text', type: 'textarea', rows: 3 },
      { key: 'home.cta.button', label: 'Button text' },
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
