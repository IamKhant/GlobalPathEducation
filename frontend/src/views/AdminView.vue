<template>
  <div class="admin-page">
    <div class="container">
      <header class="admin-header">
        <div>
          <p class="eyebrow mb-2">Admin Workspace</p>
          <h1 class="section-heading mb-1">Manage GlobalPath Education</h1>
          <p class="section-subheading mb-0">
            Manage consultations, students, consultants, and program data.
          </p>
        </div>
        <span class="role-pill">admin</span>
      </header>

      <nav class="workspace-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="workspace-tab"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          <i :class="tab.icon"></i>
          <span>{{ tab.label }}</span>
        </button>
      </nav>

      <div v-if="loading" class="panel loading-panel">Loading admin workspace...</div>

      <template v-else>
        <section v-if="activeTab === 'overview'">
          <div class="stats-grid">
            <article class="stat-card">
              <span>Consultations</span>
              <strong>{{ dashboard.totals?.consultations || consultations.length }}</strong>
            </article>
            <article class="stat-card">
              <span>Students</span>
              <strong>{{ dashboard.totals?.students || students.length }}</strong>
            </article>
            <article class="stat-card">
              <span>Consultants</span>
              <strong>{{ dashboard.totals?.consultants || consultants.length }}</strong>
            </article>
            <article class="stat-card accent">
              <span>Programs</span>
              <strong>{{ dashboard.totals?.programs || programs.length }}</strong>
            </article>
          </div>

          <div class="two-col">
            <article class="panel">
              <div class="panel-heading">
                <h2>Recent consultations</h2>
                <button class="text-button" type="button" @click="activeTab = 'consultations'">
                  View all
                </button>
              </div>
              <div class="compact-list">
                <div v-for="item in consultations.slice(0, 5)" :key="item.id" class="compact-row">
                  <div>
                    <strong>{{ item.fullName }}</strong>
                    <span>{{ item.program?.title || 'General inquiry' }}</span>
                  </div>
                  <small>{{ statusLabel(item.status) }}</small>
                </div>
              </div>
            </article>

            <article class="panel">
              <div class="panel-heading">
                <h2>Management still to add later</h2>
              </div>
              <div class="todo-list">
                <span>Homepage slideshow photos</span>
                <span>Public consultant listing for program pages</span>
              </div>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'homepage'" class="homepage-admin">
          <div class="homepage-admin-layout">
            <div class="homepage-preview-stack">
              <article
                v-for="section in homepageSections"
                :key="section.key"
                class="panel homepage-section-card"
                :class="{ editing: editingHomepageSection === section.key }"
              >
                <div class="homepage-section-head">
                  <div>
                    <p class="section-meta">{{ section.eyebrow }}</p>
                    <h2>{{ section.title }}</h2>
                    <p class="section-note">{{ section.note }}</p>
                  </div>
                  <button
                    type="button"
                    class="section-edit-button"
                    @click="openHomepageEditor(section)"
                  >
                    <i class="bi bi-pencil-square"></i>
                    <span>Edit</span>
                  </button>
                </div>

                <div v-if="section.key === 'hero'" class="homepage-preview hero-preview">
                  <div class="hero-preview-copy">
                    <span class="hero-preview-badge">{{ settingsStore.t('home.hero.badge') }}</span>
                    <h3>{{ settingsStore.t('home.hero.title') }}</h3>
                    <p>{{ settingsStore.t('home.hero.subtitle') }}</p>
                    <div class="hero-preview-search">
                      <span>{{ settingsStore.t('home.hero.searchPlaceholder') }}</span>
                      <button type="button">{{ settingsStore.t('home.hero.searchButton') }}</button>
                    </div>
                    <div class="hero-preview-actions">
                      <span class="preview-pill primary">{{ settingsStore.t('home.hero.explorePrograms') }}</span>
                      <span class="preview-pill">{{ settingsStore.t('home.hero.bookConsultation') }}</span>
                    </div>
                  </div>
                  <div class="hero-preview-visual">
                    <div class="hero-preview-image">Hero image</div>
                    <small>Image stays managed in assets for now.</small>
                  </div>
                </div>

                <div v-else-if="section.key === 'destinations'" class="homepage-preview destination-preview">
                  <div class="preview-heading-row">
                    <div>
                      <span class="section-kicker-preview">{{ settingsStore.t('home.destinations.kicker') }}</span>
                      <h3>{{ settingsStore.t('home.destinations.title') }}</h3>
                      <p>{{ settingsStore.t('home.destinations.subtitle') }}</p>
                    </div>
                    <span class="view-link-preview">{{ settingsStore.t('home.destinations.viewPrograms') }}</span>
                  </div>
                  <div class="destination-preview-grid">
                    <div v-for="country in previewCountries" :key="country" class="destination-preview-card">
                      <div class="destination-preview-image"></div>
                      <strong>{{ country }}</strong>
                      <small>{{ settingsStore.t('home.destinations.label') }}</small>
                    </div>
                  </div>
                </div>

                <div v-else-if="section.key === 'featured'" class="homepage-preview featured-preview">
                  <div class="preview-heading-row">
                    <div>
                      <span class="section-kicker-preview">{{ settingsStore.t('home.featured.kicker') }}</span>
                      <h3>{{ settingsStore.t('home.featured.title') }}</h3>
                      <p>{{ settingsStore.t('home.featured.subtitle') }}</p>
                    </div>
                  </div>
                  <div class="featured-preview-grid">
                    <div v-for="program in previewPrograms" :key="program.title" class="featured-preview-card">
                      <span class="type-chip">{{ program.type }}</span>
                      <h4>{{ program.title }}</h4>
                      <p>{{ program.institution }}</p>
                    </div>
                  </div>
                </div>

                <div v-else-if="section.key === 'process'" class="homepage-preview process-preview">
                  <div class="preview-heading-row center">
                    <div>
                      <span class="section-kicker-preview">{{ settingsStore.t('home.process.kicker') }}</span>
                      <h3>{{ settingsStore.t('home.process.title') }}</h3>
                      <p>{{ settingsStore.t('home.process.subtitle') }}</p>
                    </div>
                  </div>
                  <div class="process-preview-grid">
                    <div v-for="step in previewSteps" :key="step.title" class="process-preview-card">
                      <div class="process-preview-icon">
                        <i :class="step.icon"></i>
                      </div>
                      <strong>{{ step.title }}</strong>
                      <p>{{ step.text }}</p>
                    </div>
                  </div>
                </div>

                <div v-else-if="section.key === 'why'" class="homepage-preview why-preview">
                  <div class="why-preview-copy">
                    <span class="section-kicker-preview">{{ settingsStore.t('home.why.kicker') }}</span>
                    <h3>{{ settingsStore.t('home.why.title') }}</h3>
                    <p>{{ settingsStore.t('home.why.text') }}</p>
                    <span class="preview-pill primary">{{ settingsStore.t('home.why.cta') }}</span>
                  </div>
                  <div class="why-preview-benefits">
                    <div v-for="benefit in previewBenefits" :key="benefit.title" class="why-benefit-preview">
                      <strong>{{ benefit.title }}</strong>
                      <p>{{ benefit.text }}</p>
                    </div>
                  </div>
                </div>

                <div v-else class="homepage-preview cta-preview">
                  <span class="section-kicker-preview light">{{ settingsStore.t('home.cta.kicker') }}</span>
                  <h3>{{ settingsStore.t('home.cta.title') }}</h3>
                  <p>{{ settingsStore.t('home.cta.text') }}</p>
                  <span class="preview-pill light">{{ settingsStore.t('home.cta.button') }}</span>
                </div>
              </article>
            </div>

            <aside class="panel homepage-editor-panel">
              <div class="panel-heading">
                <div>
                  <h2>{{ currentHomepageSection?.title || 'Homepage editor' }}</h2>
                  <p v-if="currentHomepageSection" class="homepage-editor-note">
                    Update the copy for this section. Changes apply to the public homepage immediately after save.
                  </p>
                  <p v-else class="homepage-editor-note">
                    Pick a section from the left and use its edit icon.
                  </p>
                </div>
              </div>

              <form v-if="currentHomepageSection" class="program-form" @submit.prevent="saveHomepageSection">
                <label v-for="field in currentHomepageSection.fields" :key="field.key">
                  <span>{{ field.label }}</span>
                  <textarea
                    v-if="field.type === 'textarea'"
                    v-model="homepageDraft[field.key]"
                    class="form-control"
                    :rows="field.rows || 3"
                  ></textarea>
                  <input
                    v-else
                    v-model="homepageDraft[field.key]"
                    class="form-control"
                    type="text"
                  />
                </label>
                <div class="homepage-editor-actions">
                  <button type="button" class="btn btn-outline-secondary" @click="closeHomepageEditor">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-gpe-primary" :disabled="homepageSaving">
                    {{ homepageSaving ? 'Saving...' : 'Save section' }}
                  </button>
                </div>
              </form>
            </aside>
          </div>
        </section>

        <section v-if="activeTab === 'consultations'" class="panel">
          <div class="panel-heading" style="border-bottom: 1px solid #e5edf7; padding-bottom: 1rem; margin-bottom: 1rem;">
            <h2>All consultations</h2>
            <div class="position-relative" style="width: 280px;">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 0.8rem;"></i>
              <input v-model="adminConsultationSearch" type="text" class="form-control form-control-sm" placeholder="Search by student or program..." style="padding-left: 2rem; border-radius: 8px;" />
            </div>
          </div>
          <div class="table-wrap scrollable-list">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Consultant</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in filteredAdminConsultations" :key="item.id">
                  <td>
                    <strong>{{ item.fullName }}</strong>
                    <small>{{ item.email }}</small>
                  </td>
                  <td>{{ item.program?.title || 'General inquiry' }}</td>
                  <td>
                    <div class="dropdown">
                      <button class="btn btn-sm dropdown-toggle status-badge" :class="statusClass(item.status)" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="border: none;">
                        {{ statusLabel(item.status) }}
                      </button>
                      <ul class="dropdown-menu shadow-sm" style="min-width: auto; border-radius: 8px;">
                        <li v-for="status in statuses" :key="status">
                          <button class="dropdown-item" type="button" :class="{ active: normalizeStatus(item.status) === status }" @click="updateConsultation(item.id, { status })">
                            {{ statusLabel(status) }}
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                  <td>
                    <select
                      class="form-select form-select-sm"
                      :value="item.consultantId || ''"
                      @change="updateConsultation(item.id, { consultantId: $event.target.value || null })"
                    >
                      <option value="">Unassigned</option>
                      <option v-for="consultant in consultants" :key="consultant.id" :value="consultant.id">
                        {{ userName(consultant) }}
                      </option>
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section v-if="activeTab === 'students'">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="fs-5 fw-bold mb-0">All students</h2>
            <div class="position-relative" style="width: 280px;">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 0.8rem;"></i>
              <input v-model="adminStudentSearch" type="text" class="form-control form-control-sm" placeholder="Search students by name or email..." style="padding-left: 2rem; border-radius: 8px;" />
            </div>
          </div>
          <div class="grid-list scrollable-list">
            <article v-for="student in filteredAdminStudents" :key="student.id" class="panel user-card">
            <div>
              <h2>{{ userName(student) }}</h2>
              <p>{{ student.email }}</p>
              <small>{{ student.consultations?.length || 0 }} consultations / {{ student.bookmarks?.length || 0 }} saved</small>
            </div>
            <div class="row-actions row-actions-inline">
              <button class="btn btn-sm btn-outline-primary" type="button" @click="changeUserRole(student, 'consultant')">
                Make consultant
              </button>
              <button class="btn btn-sm btn-outline-dark" type="button" @click="changeUserRole(student, 'admin')">
                Make admin
              </button>
              <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteStudent(student.id)">
                Delete
              </button>
            </div>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'admins'">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 class="fs-5 fw-bold mb-1">Admin accounts</h2>
              <p class="text-muted mb-0 small">Keep role changes explicit. Current admin access cannot be removed from the active session.</p>
            </div>
            <div class="position-relative" style="width: 280px;">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 0.8rem;"></i>
              <input v-model="adminAdminSearch" type="text" class="form-control form-control-sm" placeholder="Search admins by name or email..." style="padding-left: 2rem; border-radius: 8px;" />
            </div>
          </div>
          <div class="grid-list scrollable-list">
            <article v-for="admin in filteredAdminUsers" :key="admin.id" class="panel user-card">
              <div>
                <div class="staff-user-head">
                  <span class="role-badge role-badge-admin">admin</span>
                  <span v-if="admin.id === currentAdminId" class="self-badge">Current session</span>
                </div>
                <h2>{{ userName(admin) }}</h2>
                <p>{{ admin.email }}</p>
                <small>{{ admin.consultations?.length || 0 }} student consultations / {{ admin.assignedConsultations?.length || 0 }} assigned requests</small>
              </div>
              <div class="row-actions row-actions-inline">
                <button
                  class="btn btn-sm btn-outline-primary"
                  type="button"
                  :disabled="admin.id === currentAdminId"
                  @click="changeUserRole(admin, 'consultant')"
                >
                  Make consultant
                </button>
                <button
                  class="btn btn-sm btn-outline-secondary"
                  type="button"
                  :disabled="admin.id === currentAdminId"
                  @click="changeUserRole(admin, 'student')"
                >
                  Make student
                </button>
              </div>
            </article>
          </div>
        </section>

        <section v-if="activeTab === 'consultants'" class="consultant-admin-layout">
          <article class="panel promote-panel">
            <div class="panel-heading">
              <div>
                <h2>Create consultant profile</h2>
                <p>Promote an existing Clerk user, then assign service areas and public bio.</p>
              </div>
            </div>
            <label>
              <span>User account</span>
              <div class="promote-search-wrap">
                <i class="bi bi-search promote-search-icon"></i>
                <input
                  v-model="promoteSearch"
                  type="text"
                  class="form-control"
                  placeholder="Search by name or email..."
                  style="padding-left: 2.2rem"
                />
              </div>
              <div class="promote-user-list">
                <button
                  v-for="student in filteredStudents"
                  :key="student.id"
                  type="button"
                  :class="['promote-user-option', { selected: promoteUserId === student.id }]"
                  @click="promoteUserId = promoteUserId === student.id ? '' : student.id"
                >
                  <div class="promote-user-avatar">{{ initials(student) }}</div>
                  <div class="promote-user-info">
                    <strong>{{ userName(student) }}</strong>
                    <small>{{ student.email }}</small>
                  </div>
                  <i v-if="promoteUserId === student.id" class="bi bi-check-circle-fill text-success"></i>
                </button>
                <div v-if="filteredStudents.length === 0" class="promote-empty">
                  {{ promoteSearch ? 'No matching users' : 'No students available' }}
                </div>
              </div>
            </label>
            <button class="btn btn-gpe-primary w-100" type="button" :disabled="!promoteUserId" @click="promoteConsultant">
              Promote to consultant
            </button>
            <div class="promote-note">
              New consultants should sign up with Clerk first so email verification and login security remain handled by Clerk.
            </div>
          </article>

          <div>
            <div class="consultant-search-wrapper mb-3">
              <div class="position-relative">
                <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 1rem;"></i>
                <input
                  v-model="adminConsultantSearch"
                  type="text"
                  class="form-control"
                  placeholder="Search consultants by name or email..."
                  style="padding-left: 2.5rem; border-radius: 10px;"
                />
              </div>
            </div>

          <div class="consultant-admin-list scrollable-list">
            <article v-for="consultant in filteredAdminConsultants" :key="consultant.id" class="panel consultant-admin-card">
              <div class="consultant-admin-top">
                <div class="consultant-admin-avatar">{{ initials(consultant) }}</div>
                <div>
                  <h2>{{ userName(consultant) }}</h2>
                  <p>{{ consultant.email }}</p>
                  <div class="area-chip-row">
                    <span v-for="area in countryList(consultant)" :key="area">{{ area }}</span>
                  </div>
                </div>
              </div>

              <div class="consultant-editor-grid">
                <label>
                  <span>Countries / regions</span>
                  <div class="tag-input-wrap">
                    <div class="tag-chips">
                      <span v-for="area in countryList(consultant)" :key="area" class="tag-chip">
                        {{ area }}
                        <button type="button" @click="removeCountry(consultant, area)" class="tag-chip-x">&times;</button>
                      </span>
                    </div>
                    <input
                      type="text"
                      class="form-control form-control-sm"
                      placeholder="Type a country and press Enter..."
                      @keydown="handleCountryInputKeydown(consultant, $event)"
                      @blur="addCountryFromInput(consultant, $event)"
                    />
                  </div>
                  <small class="muted">Press Enter or comma to add a region.</small>
                </label>
                <label>
                  <span>Public bio</span>
                  <textarea
                    class="form-control"
                    rows="5"
                    maxlength="420"
                    :value="consultant.consultantBio || ''"
                    placeholder="Short introduction shown to students before booking."
                    @change="saveBio(consultant.id, $event.target.value)"
                  ></textarea>
                  <small class="muted">Shown on the student consultation page.</small>
                </label>
              </div>

              <div class="consultant-admin-footer">
                <span>{{ consultant.assignedConsultations?.length || 0 }} assigned consultations</span>
                <div class="row-actions row-actions-inline">
                  <button class="btn btn-sm btn-outline-dark" type="button" @click="changeUserRole(consultant, 'admin')">
                    <i class="bi bi-shield-lock me-1"></i>Make admin
                  </button>
                  <button class="btn btn-sm btn-outline-danger" type="button" @click="confirmDemote(consultant)">
                    <i class="bi bi-arrow-down-circle me-1"></i>Make student
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
        </section>

        <section v-if="activeTab === 'programs'" class="program-workspace">
          <aside class="panel">
            <div class="panel-heading">
              <h2>{{ editingProgramId ? 'Edit program' : 'Add program' }}</h2>
              <button v-if="editingProgramId" class="text-button" type="button" @click="resetProgramForm">
                New
              </button>
            </div>
            <form class="program-form" @submit.prevent="saveProgram">
              <div class="form-grid">
                <label><span>Title</span><input v-model="programForm.title" class="form-control" required /></label>
                <label><span>Institution</span><input v-model="programForm.institution" class="form-control" required /></label>
                <label><span>Country</span><input v-model="programForm.country" class="form-control" required /></label>
                <label><span>City</span><input v-model="programForm.city" class="form-control" /></label>
                <label><span>Type</span><input v-model="programForm.type" class="form-control" required /></label>
                <label><span>Duration</span><input v-model="programForm.durationMonths" class="form-control" type="number" /></label>
                <label><span>Tuition</span><input v-model="programForm.tuitionFee" class="form-control" type="number" step="0.01" /></label>
                <label><span>Currency</span><input v-model="programForm.currency" class="form-control" maxlength="3" /></label>
              </div>
              <label><span>Specialization</span><textarea v-model="programForm.specialization" class="form-control" rows="2"></textarea></label>
              <label><span>Description</span><textarea v-model="programForm.description" class="form-control" rows="3"></textarea></label>
              <label><span>Website</span><input v-model="programForm.websiteUrl" class="form-control" type="url" /></label>
              <div class="color-picker-field">
                <label>
                  <span>Card Color</span>
                  <div class="color-picker-row">
                    <input type="color" v-model="programForm.cardColor" class="color-input" />
                    <input type="text" v-model="programForm.cardColor" class="form-control form-control-sm" placeholder="#1a3a5c" maxlength="7" style="flex:1" />
                    <button v-if="programForm.cardColor" type="button" class="btn btn-sm btn-outline-secondary" @click="programForm.cardColor = ''" title="Use country default">
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                  <small class="muted">Leave empty to use country-based color.</small>
                </label>
              </div>
              <button class="btn btn-gpe-primary w-100" type="submit" :disabled="programSaving">
                {{ programSaving ? 'Saving...' : editingProgramId ? 'Update program' : 'Create program' }}
              </button>
            </form>
          </aside>

          <div class="grid-list-wrapper" style="min-width: 0;">
            <div class="mb-3 position-relative">
              <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 1rem;"></i>
              <input v-model="adminProgramSearch" type="text" class="form-control" placeholder="Search programs by title or institution..." style="padding-left: 2.5rem; border-radius: 10px;" />
            </div>
            <div class="grid-list scrollable-list">
              <article v-for="program in filteredAdminPrograms" :key="program.id" class="panel program-row">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <div v-if="program.cardColor" class="program-color-swatch" :style="{ background: program.cardColor }"></div>
                  <h2>{{ program.title }}</h2>
                </div>
                <p>{{ program.institution }} - {{ program.country }}</p>
                <small>{{ program.type }} / {{ program.durationMonths || '-' }} months</small>
              </div>
              <div class="row-actions">
                <button class="btn btn-sm btn-outline-primary" type="button" @click="editProgram(program)">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" type="button" @click="deleteProgram(program.id)">
                  Delete
                </button>
              </div>
            </article>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import api from '@/api'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const loading = ref(true)
const activeTab = ref('overview')
const dashboard = ref({})
const consultations = ref([])
const students = ref([])
const consultants = ref([])
const admins = ref([])
const programs = ref([])
const promoteUserId = ref('')
const promoteSearch = ref('')
const adminConsultantSearch = ref('')
const adminConsultationSearch = ref('')
const adminStudentSearch = ref('')
const adminAdminSearch = ref('')
const adminProgramSearch = ref('')
const editingProgramId = ref(null)
const programSaving = ref(false)
const homepageSaving = ref(false)
const editingHomepageSection = ref('')
const homepageDraft = ref({})
const currentAdminId = ref(null)
const statuses = ['pending', 'confirmed', 'completed', 'cancelled']

const emptyProgramForm = {
  title: '',
  institution: '',
  city: '',
  stateProvince: '',
  country: '',
  type: 'Master',
  durationMonths: '',
  tuitionFee: '',
  currency: 'AUD',
  feeBasis: 'total',
  language: 'English',
  specialization: '',
  websiteUrl: '',
  description: '',
  cardColor: '',
  notes: '',
}
const programForm = ref({ ...emptyProgramForm })

const tabs = [
  { key: 'overview', label: 'Overview', icon: 'bi bi-grid-1x2' },
  { key: 'homepage', label: 'Homepage', icon: 'bi bi-house-door' },
  { key: 'consultations', label: 'Consultations', icon: 'bi bi-calendar-check' },
  { key: 'students', label: 'Students', icon: 'bi bi-people' },
  { key: 'admins', label: 'Admins', icon: 'bi bi-shield-lock' },
  { key: 'consultants', label: 'Consultants', icon: 'bi bi-person-badge' },
  { key: 'programs', label: 'Programs', icon: 'bi bi-mortarboard' },
]

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
    note: 'Headline and support copy for the featured program cards.',
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
    note: 'Section heading and the three step descriptions.',
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
    note: 'Main explanation plus the benefit cards.',
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

const currentHomepageSection = computed(() => {
  return homepageSections.find((section) => section.key === editingHomepageSection.value) || null
})

const previewCountries = ['Australia', 'Germany', 'Japan']

const previewPrograms = computed(() => {
  return (programs.value.length ? programs.value : [
    { title: 'Software Engineering', institution: 'Global Institute', type: 'Bootcamp' },
    { title: 'International Business', institution: 'Northbridge University', type: 'Master' },
    { title: 'Data Science', institution: 'Pacific Tech', type: 'Master' },
  ]).slice(0, 3)
})

const previewSteps = computed(() => {
  return [
    {
      icon: 'bi bi-search',
      title: settingsStore.t('home.step.explore.title'),
      text: settingsStore.t('home.step.explore.text'),
    },
    {
      icon: 'bi bi-bar-chart-steps',
      title: settingsStore.t('home.step.compare.title'),
      text: settingsStore.t('home.step.compare.text'),
    },
    {
      icon: 'bi bi-calendar-check',
      title: settingsStore.t('home.step.consult.title'),
      text: settingsStore.t('home.step.consult.text'),
    },
  ]
})

const previewBenefits = computed(() => {
  return [
    {
      title: settingsStore.t('home.benefit.destinations.title'),
      text: settingsStore.t('home.benefit.destinations.text'),
    },
    {
      title: settingsStore.t('home.benefit.save.title'),
      text: settingsStore.t('home.benefit.save.text'),
    },
    {
      title: settingsStore.t('home.benefit.compare.title'),
      text: settingsStore.t('home.benefit.compare.text'),
    },
    {
      title: settingsStore.t('home.benefit.consult.title'),
      text: settingsStore.t('home.benefit.consult.text'),
    },
  ]
})

onMounted(async () => {
  await fetchAll()
  loading.value = false
})

async function fetchAll() {
  await Promise.all([
    fetchAdminMe(),
    fetchDashboard(),
    fetchConsultations(),
    fetchStudents(),
    fetchAdmins(),
    fetchConsultants(),
    fetchPrograms(),
  ])
}

async function fetchAdminMe() {
  const { data } = await api.get('/api/admin/me')
  currentAdminId.value = data.user?.id || null
}

async function fetchDashboard() {
  const { data } = await api.get('/api/admin/dashboard')
  dashboard.value = data
}

async function fetchConsultations() {
  const { data } = await api.get('/api/admin/consultations')
  consultations.value = data
}

async function fetchStudents() {
  const { data } = await api.get('/api/admin/students')
  students.value = data
}

async function fetchConsultants() {
  const { data } = await api.get('/api/admin/consultants')
  consultants.value = data
}

async function fetchAdmins() {
  const { data } = await api.get('/api/admin/admins')
  admins.value = data
}

async function fetchPrograms() {
  const { data } = await api.get('/api/admin/programs')
  programs.value = data
}

function openHomepageEditor(section) {
  editingHomepageSection.value = section.key
  homepageDraft.value = Object.fromEntries(
    section.fields.map((field) => [field.key, settingsStore.t(field.key)]),
  )
}

function closeHomepageEditor() {
  editingHomepageSection.value = ''
  homepageDraft.value = {}
}

async function saveHomepageSection() {
  if (!currentHomepageSection.value) return

  homepageSaving.value = true
  try {
    await api.patch('/api/admin/ui-text', {
      locale: 'EN',
      entries: currentHomepageSection.value.fields.map((field) => ({
        key: field.key,
        text: String(homepageDraft.value[field.key] || '').trim(),
      })),
    })
    await settingsStore.fetchUiTranslations()
    closeHomepageEditor()
  } finally {
    homepageSaving.value = false
  }
}

async function updateConsultation(id, payload) {
  const { data } = await api.patch(`/api/admin/consultations/${id}`, payload)
  consultations.value = consultations.value.map((item) => (item.id === id ? data : item))
}

async function promoteConsultant() {
  await api.patch(`/api/admin/users/${promoteUserId.value}/role`, { role: 'consultant' })
  promoteUserId.value = ''
  promoteSearch.value = ''
  await Promise.all([fetchStudents(), fetchAdmins(), fetchConsultants(), fetchDashboard()])
}

async function changeUserRole(user, role) {
  const currentRole = String(user.role || '').toLowerCase()
  if (currentRole === role) return

  const name = userName(user)
  const roleLabel = role === 'admin' ? 'admin' : role === 'consultant' ? 'consultant' : 'student'
  const actionText =
    role === 'admin'
      ? `Promote ${name} to admin?\n\nAdmins can manage students, consultants, programs, and homepage content.`
      : `Change ${name} to ${roleLabel} role?`

  if (!confirm(actionText)) return

  await api.patch(`/api/admin/users/${user.id}/role`, { role })
  await Promise.all([fetchStudents(), fetchAdmins(), fetchConsultants(), fetchDashboard()])
}

function confirmDemote(consultant) {
  const name = userName(consultant)
  if (!confirm(`Demote ${name} from consultant to student?\n\nTheir ${consultant.assignedConsultations?.length || 0} assigned consultations will remain but they will lose consultant access.`)) return
  demoteConsultant(consultant.id)
}

async function demoteConsultant(id) {
  await api.patch(`/api/admin/users/${id}/role`, { role: 'student' })
  await Promise.all([fetchStudents(), fetchAdmins(), fetchConsultants(), fetchDashboard()])
}

const filteredAdminConsultants = computed(() => {
  const query = adminConsultantSearch.value.trim().toLowerCase()
  if (!query) return consultants.value
  return consultants.value.filter((c) => {
    return (
      userName(c).toLowerCase().includes(query) ||
      (c.email || '').toLowerCase().includes(query) ||
      countryList(c).some((area) => area.toLowerCase().includes(query))
    )
  })
})

const filteredAdminConsultations = computed(() => {
  const query = adminConsultationSearch.value.trim().toLowerCase()
  if (!query) return consultations.value
  return consultations.value.filter((c) => {
    return (
      (c.fullName || '').toLowerCase().includes(query) ||
      (c.program?.title || '').toLowerCase().includes(query) ||
      (c.program?.institution || '').toLowerCase().includes(query)
    )
  })
})

const filteredAdminStudents = computed(() => {
  const query = adminStudentSearch.value.trim().toLowerCase()
  if (!query) return students.value
  return students.value.filter((s) => {
    const name = userName(s).toLowerCase()
    const email = (s.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

const filteredAdminUsers = computed(() => {
  const query = adminAdminSearch.value.trim().toLowerCase()
  if (!query) return admins.value
  return admins.value.filter((admin) => {
    const name = userName(admin).toLowerCase()
    const email = (admin.email || '').toLowerCase()
    return name.includes(query) || email.includes(query)
  })
})

const filteredAdminPrograms = computed(() => {
  const query = adminProgramSearch.value.trim().toLowerCase()
  if (!query) return programs.value
  return programs.value.filter((p) => {
    return (
      (p.title || '').toLowerCase().includes(query) ||
      (p.institution || '').toLowerCase().includes(query) ||
      (p.country || '').toLowerCase().includes(query)
    )
  })
})

function statusClass(status) {
  return {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }[normalizeStatus(status)]
}

const filteredStudents = computed(() => {
  const q = promoteSearch.value.trim().toLowerCase()
  if (!q) return students.value.slice(0, 10)
  return students.value.filter((s) => {
    const name = userName(s).toLowerCase()
    const email = (s.email || '').toLowerCase()
    return name.includes(q) || email.includes(q)
  })
})

async function addCountryFromInput(consultant, event) {
  const input = event.target
  const rawValue = input.value || ''
  const pieces = rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  if (!pieces.length) return

  input.value = ''

  const existing = consultant.consultantCountries?.map((c) => c.country) || []
  const nextCountries = [...existing]

  pieces.forEach((country) => {
    if (!nextCountries.some((item) => item.toLowerCase() === country.toLowerCase())) {
      nextCountries.push(country)
    }
  })

  if (nextCountries.length === existing.length) return

  const { data } = await api.patch(`/api/admin/consultants/${consultant.id}/countries`, {
    countries: nextCountries,
  })
  consultants.value = consultants.value.map((item) => (item.id === consultant.id ? data : item))
}

function handleCountryInputKeydown(consultant, event) {
  if (event.key !== 'Enter' && event.key !== ',') return
  event.preventDefault()
  addCountryFromInput(consultant, event)
}

async function removeCountry(consultant, area) {
  const existing = consultant.consultantCountries?.map((c) => c.country) || []
  const countries = existing.filter((c) => c !== area)
  const { data } = await api.patch(`/api/admin/consultants/${consultant.id}/countries`, { countries })
  consultants.value = consultants.value.map((item) => (item.id === consultant.id ? data : item))
}

async function saveBio(id, consultantBio) {
  const { data } = await api.patch(`/api/admin/consultants/${id}/profile`, { consultantBio })
  consultants.value = consultants.value.map((item) => (item.id === id ? data : item))
}

// Keep legacy names for any remaining references
const updateConsultantCountries = (id, value) => {
  const countries = value.split(',').map((c) => c.trim()).filter(Boolean)
  return api.patch(`/api/admin/consultants/${id}/countries`, { countries })
}
const updateConsultantBio = saveBio

async function deleteStudent(id) {
  if (!confirm('Delete this student from the database?')) return
  await api.delete(`/api/admin/students/${id}`)
  students.value = students.value.filter((student) => student.id !== id)
  await fetchDashboard()
}

async function saveProgram() {
  programSaving.value = true
  try {
    const payload = { ...programForm.value, currency: programForm.value.currency?.toUpperCase() }
    if (editingProgramId.value) {
      const { data } = await api.patch(`/api/admin/programs/${editingProgramId.value}`, payload)
      programs.value = programs.value.map((program) => (program.id === data.id ? data : program))
    } else {
      const { data } = await api.post('/api/admin/programs', payload)
      programs.value = [data, ...programs.value]
    }
    resetProgramForm()
    await fetchDashboard()
  } finally {
    programSaving.value = false
  }
}

function editProgram(program) {
  editingProgramId.value = program.id
  programForm.value = {
    ...emptyProgramForm,
    ...program,
    durationMonths: program.durationMonths ?? '',
    tuitionFee: program.tuitionFee ?? '',
    currency: program.currency || 'AUD',
    cardColor: program.cardColor || '',
  }
}

async function deleteProgram(id) {
  if (!confirm('Delete this program?')) return
  await api.delete(`/api/admin/programs/${id}`)
  programs.value = programs.value.filter((program) => program.id !== id)
  await fetchDashboard()
}

function resetProgramForm() {
  editingProgramId.value = null
  programForm.value = { ...emptyProgramForm }
}

function userName(user) {
  return [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email
}

function initials(user) {
  return userName(user)
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function countryText(consultant) {
  return consultant.consultantCountries?.map((item) => item.country).join(', ') || ''
}

function countryList(consultant) {
  const countries = consultant.consultantCountries?.map((item) => item.country).filter(Boolean) || []
  return countries.length ? countries : ['Unassigned']
}

function normalizeStatus(status) {
  return String(status || '').toLowerCase()
}

function statusLabel(status) {
  return settingsStore.t(`common.status.${normalizeStatus(status)}`)
}
</script>

<style scoped>
.admin-page {
  background: #f8fafc;
  min-height: 70vh;
  padding: 2rem 0 3rem;
}

.admin-header,
.panel-heading,
.compact-row,
.user-card,
.program-row {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
}

.admin-header {
  margin-bottom: 1rem;
}

.eyebrow {
  color: #f4a41b;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.role-pill {
  background: #0f172a;
  border-radius: 999px;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 850;
  padding: 0.45rem 0.85rem;
}

.workspace-tabs {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  display: flex;
  gap: 0.35rem;
  margin-bottom: 1rem;
  padding: 0.35rem;
}

.workspace-tab {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 8px;
  color: #475569;
  display: inline-flex;
  flex: 1;
  font-size: 0.86rem;
  font-weight: 850;
  gap: 0.45rem;
  justify-content: center;
  padding: 0.7rem;
}

.workspace-tab.active {
  background: #f4a41b;
  color: #0f172a;
}

.panel,
.stat-card {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 10px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
  padding: 1rem;
}

.loading-panel {
  text-align: center;
}

.stats-grid,
.two-col,
.program-workspace,
.homepage-admin-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 1rem;
}

.two-col {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.program-workspace {
  grid-template-columns: 380px minmax(0, 1fr);
}

.homepage-admin-layout {
  align-items: start;
  grid-template-columns: minmax(0, 1.4fr) 360px;
}

.homepage-preview-stack {
  display: grid;
  gap: 1rem;
}

.homepage-section-card.editing {
  border-color: rgba(244, 164, 27, 0.55);
  box-shadow: 0 16px 40px rgba(244, 164, 27, 0.12);
}

.homepage-section-head {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-meta {
  color: #f4a41b;
  font-size: 0.75rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  margin: 0 0 0.35rem;
  text-transform: uppercase;
}

.section-note,
.homepage-editor-note,
.hero-preview-visual small {
  color: #64748b;
  font-size: 0.86rem;
  line-height: 1.55;
  margin: 0.3rem 0 0;
}

.section-edit-button {
  align-items: center;
  background: #fff8eb;
  border: 1px solid rgba(244, 164, 27, 0.35);
  border-radius: 999px;
  color: #8a5b07;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 0.8rem;
  font-weight: 850;
  gap: 0.45rem;
  padding: 0.5rem 0.85rem;
}

.homepage-preview {
  border: 1px solid #eef2f7;
  border-radius: 12px;
  overflow: hidden;
}

.hero-preview {
  background: linear-gradient(135deg, #f7fbff 0%, #eef7ff 48%, #ffffff 100%);
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 1.05fr) minmax(260px, 0.95fr);
  padding: 1.25rem;
}

.hero-preview-copy h3,
.preview-heading-row h3,
.why-preview-copy h3,
.cta-preview h3 {
  color: #13233b;
  font-size: 1.7rem;
  font-weight: 850;
  margin: 0 0 0.65rem;
}

.hero-preview-copy p,
.preview-heading-row p,
.process-preview-card p,
.why-preview-copy p,
.why-benefit-preview p,
.cta-preview p {
  color: #475569;
  margin: 0;
}

.hero-preview-badge,
.section-kicker-preview {
  color: #2563eb;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 850;
  margin-bottom: 0.85rem;
}

.hero-preview-search {
  align-items: center;
  background: #fff;
  border: 1px solid #dbe5f0;
  border-radius: 999px;
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  margin-top: 1rem;
  padding: 0.45rem 0.45rem 0.45rem 0.9rem;
}

.hero-preview-search span {
  color: #94a3b8;
  font-size: 0.9rem;
}

.hero-preview-search button,
.preview-pill {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.82rem;
  font-weight: 850;
  padding: 0.55rem 0.9rem;
}

.hero-preview-search button,
.preview-pill.primary {
  background: #0f172a;
  border: 0;
  color: #fff;
}

.hero-preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
}

.preview-pill {
  background: #fff;
  border: 1px solid #dbe5f0;
  color: #0f172a;
}

.preview-pill.light {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.24);
  color: #fff;
}

.hero-preview-visual {
  display: grid;
  gap: 0.6rem;
}

.hero-preview-image,
.destination-preview-image {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  border-radius: 18px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1e3a8a;
  font-weight: 850;
}

.destination-preview,
.featured-preview,
.process-preview,
.why-preview {
  padding: 1.1rem;
}

.preview-heading-row {
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.preview-heading-row.center {
  justify-content: center;
  text-align: center;
}

.view-link-preview {
  color: #0a82d3;
  font-size: 0.85rem;
  font-weight: 850;
}

.destination-preview-grid,
.featured-preview-grid,
.process-preview-grid,
.why-preview-benefits {
  display: grid;
  gap: 0.85rem;
}

.destination-preview-grid,
.featured-preview-grid,
.process-preview-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.destination-preview-card,
.featured-preview-card,
.process-preview-card,
.why-benefit-preview {
  background: #fff;
  border: 1px solid #e5edf7;
  border-radius: 12px;
  padding: 0.85rem;
}

.destination-preview-card strong,
.featured-preview-card h4,
.process-preview-card strong,
.why-benefit-preview strong {
  color: #0f172a;
  display: block;
  font-size: 0.95rem;
  font-weight: 850;
  margin-top: 0.65rem;
}

.destination-preview-card small,
.featured-preview-card p {
  color: #64748b;
}

.type-chip {
  background: #eff6ff;
  border-radius: 999px;
  color: #0f4d85;
  display: inline-flex;
  font-size: 0.72rem;
  font-weight: 850;
  padding: 0.3rem 0.55rem;
}

.process-preview-icon {
  align-items: center;
  background: #0f172a;
  border-radius: 999px;
  color: #fff;
  display: flex;
  height: 42px;
  justify-content: center;
  margin-bottom: 0.75rem;
  width: 42px;
}

.why-preview {
  display: grid;
  gap: 1rem;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
}

.cta-preview {
  background: linear-gradient(135deg, #0f172a, #123556);
  color: #fff;
  display: grid;
  gap: 0.85rem;
  padding: 1.4rem;
}

.section-kicker-preview.light,
.cta-preview p {
  color: rgba(255, 255, 255, 0.82);
}

.homepage-editor-panel {
  align-self: start;
  display: grid;
  gap: 1rem;
  position: sticky;
  top: 6rem;
}

.homepage-editor-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.consultant-admin-layout {
  display: grid;
  gap: 1rem;
  grid-template-columns: 340px minmax(0, 1fr);
}

.promote-panel {
  align-self: start;
  display: grid;
  gap: 0.85rem;
  position: sticky;
  top: 6rem;
}

.promote-panel p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.promote-note {
  background: #f8fafc;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  color: #64748b;
  font-size: 0.82rem;
  line-height: 1.55;
  padding: 0.75rem;
}

.promote-search-wrap {
  position: relative;
  margin-bottom: 0.5rem;
}

.promote-search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  font-size: 0.85rem;
  pointer-events: none;
}

.promote-user-list {
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid #e5edf7;
  border-radius: 8px;
  padding: 0.3rem;
}

.promote-user-option {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.5rem 0.6rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background 0.12s ease;
}

.promote-user-option:hover {
  background: #f0f6ff;
}

.promote-user-option.selected {
  background: #eff6ff;
  outline: 2px solid #2563eb;
  outline-offset: -2px;
}

.promote-user-avatar {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 850;
}

.promote-user-info {
  min-width: 0;
  flex: 1;
}

.promote-user-info strong {
  display: block;
  font-size: 0.84rem;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promote-user-info small {
  display: block;
  color: #94a3b8;
  font-size: 0.76rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promote-empty {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-size: 0.84rem;
}

/* Tag-based country input */
.tag-input-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.25rem 0.55rem;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #0f4d85;
  font-size: 0.76rem;
  font-weight: 700;
}

.tag-chip-x {
  background: none;
  border: 0;
  color: #94a3b8;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0;
  transition: color 0.15s ease;
}

.tag-chip-x:hover {
  color: #dc2626;
}

.consultant-admin-list {
  display: grid;
  gap: 1rem;
}

.consultant-admin-card {
  display: grid;
  gap: 1rem;
}

.consultant-admin-top,
.consultant-admin-footer {
  align-items: flex-start;
  display: flex;
  gap: 0.85rem;
  justify-content: space-between;
}

.staff-user-head {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.5rem;
}

.role-badge,
.self-badge {
  border-radius: 999px;
  display: inline-flex;
  font-size: 0.7rem;
  font-weight: 850;
  padding: 0.25rem 0.5rem;
  text-transform: uppercase;
}

.role-badge-admin {
  background: #0f172a;
  color: #fff;
}

.self-badge {
  background: #eff6ff;
  color: #0f4d85;
}

.consultant-admin-top {
  border-bottom: 1px solid #eef2f7;
  justify-content: flex-start;
  padding-bottom: 0.9rem;
}

.consultant-admin-avatar {
  align-items: center;
  background: #0f172a;
  border-radius: 999px;
  color: #fff;
  display: flex;
  flex: 0 0 46px;
  font-size: 0.88rem;
  font-weight: 850;
  height: 46px;
  justify-content: center;
  width: 46px;
}

.consultant-admin-top p {
  color: #64748b;
  margin: 0.15rem 0 0.45rem;
}

.area-chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.area-chip-row span {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  color: #0f4d85;
  font-size: 0.74rem;
  font-weight: 800;
  padding: 0.24rem 0.5rem;
}

.consultant-editor-grid {
  display: grid;
  gap: 0.85rem;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
}

.consultant-admin-footer {
  align-items: center;
  border-top: 1px solid #eef2f7;
  color: #64748b;
  font-size: 0.84rem;
  padding-top: 0.85rem;
}

.stat-card span,
.muted,
.compact-row span,
.compact-row small,
.user-card p,
.user-card small,
.program-row p,
.program-row small {
  color: #64748b;
}

.stat-card strong {
  color: #0f172a;
  display: block;
  font-size: 1.8rem;
  margin-top: 0.35rem;
}

.stat-card.accent {
  border-color: rgba(244, 164, 27, 0.45);
}

.panel h2,
.user-card h2,
.program-row h2 {
  color: #0f172a;
  font-size: 1rem;
  font-weight: 850;
  margin: 0;
}

.text-button {
  background: transparent;
  border: 0;
  color: #0a82d3;
  font-weight: 850;
}

.compact-list,
.grid-list,
.program-form,
.todo-list {
  display: grid;
  gap: 0.85rem;
}

.compact-row {
  border-top: 1px solid #eef2f7;
  padding-top: 0.85rem;
}

.compact-row:first-child {
  border-top: 0;
}

.table-wrap {
  overflow-x: auto;
}

.scrollable-list {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Custom scrollbar for scrollable lists */
.scrollable-list::-webkit-scrollbar {
  width: 6px;
}
.scrollable-list::-webkit-scrollbar-track {
  background: transparent;
}
.scrollable-list::-webkit-scrollbar-thumb {
  background-color: rgba(15, 23, 42, 0.1);
  border-radius: 10px;
}

.status-badge {
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 850;
  padding: 0.35rem 0.65rem;
  white-space: nowrap;
}

.status-pending {
  background: #fff7ed;
  color: #c2410c;
}

.status-confirmed {
  background: #ecfdf3;
  color: #15803d;
}

.status-completed {
  background: #f1f5f9;
  color: #475569;
}

.status-cancelled {
  background: #fef2f2;
  color: #b91c1c;
}

td strong,
td small {
  display: block;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

label span {
  color: #64748b;
  display: block;
  font-size: 0.72rem;
  font-weight: 850;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
}

.color-picker-field {
  grid-column: 1 / -1;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-input {
  width: 40px;
  height: 36px;
  padding: 2px;
  border: 1px solid #dbe5f0;
  border-radius: 8px;
  cursor: pointer;
  background: none;
}

.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}

.program-color-swatch {
  width: 14px;
  height: 14px;
  border-radius: 4px;
  flex: 0 0 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.row-actions {
  align-items: flex-end;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.row-actions-inline {
  align-items: center;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: flex-end;
}

@media (max-width: 991.98px) {
  .admin-header,
  .panel-heading,
  .compact-row,
  .user-card,
  .program-row {
    align-items: stretch;
    flex-direction: column;
  }

  .workspace-tabs {
    overflow-x: auto;
  }

  .workspace-tab {
    flex: 0 0 auto;
  }

  .stats-grid,
  .two-col,
  .homepage-admin-layout,
  .program-workspace,
  .consultant-admin-layout,
  .consultant-editor-grid {
    grid-template-columns: 1fr;
  }

  .hero-preview,
  .why-preview,
  .destination-preview-grid,
  .featured-preview-grid,
  .process-preview-grid {
    grid-template-columns: 1fr;
  }

  .promote-panel {
    position: static;
  }

  .homepage-editor-panel {
    position: static;
  }

  .consultant-admin-footer,
  .consultant-admin-top {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 575.98px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
