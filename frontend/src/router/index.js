import { createRouter, createWebHistory } from 'vue-router'
import { waitForClerkLoaded } from '@/auth/clerk'
import api from '@/api'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/programs',
      name: 'programs',
      component: () => import('@/views/ProgramsView.vue'),
    },
    {
      path: '/programs/:id',
      name: 'program-detail',
      component: () => import('@/views/ProgramDetailView.vue'),
    },
    {
      path: '/compare',
      name: 'compare',
      component: () => import('@/views/CompareView.vue'),
    },
    {
      path: '/bookmarks',
      name: 'bookmarks',
      component: () => import('@/views/BookmarksView.vue'),
      meta: { requiresAuth: true, roles: ['student'] },
    },
    {
      path: '/consult',
      name: 'consult',
      component: () => import('@/views/ConsultView.vue'),
      meta: { studentOnly: true },
    },
    {
      path: '/consultants',
      name: 'consultants',
      component: () => import('@/views/ConsultantsDirectoryView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true, roles: ['student'], onboarding: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/consultant',
      name: 'consultant',
      component: () => import('@/views/ConsultantView.vue'),
      meta: { requiresAuth: true, roles: ['consultant'] },
    },
    {
      path: '/consultant/consultations',
      name: 'consultant-consultations',
      component: () => import('@/views/ConsultantConsultationsView.vue'),
      meta: { requiresAuth: true, roles: ['consultant'] },
    },
    {
      path: '/consultant/students',
      name: 'consultant-students',
      component: () => import('@/views/ConsultantStudentsView.vue'),
      meta: { requiresAuth: true, roles: ['consultant'] },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/admin/programs',
      name: 'admin-programs',
      component: () => import('@/views/AdminProgramsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/admin/homepage',
      name: 'admin-homepage',
      component: () => import('@/views/AdminHomepageView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/admin/consultations',
      name: 'admin-consultations',
      component: () => import('@/views/AdminConsultationsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/admin/students',
      name: 'admin-students',
      component: () => import('@/views/AdminStudentsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/admin/consultants',
      name: 'admin-consultants',
      component: () => import('@/views/AdminConsultantsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/admin/admins',
      name: 'admin-admins',
      component: () => import('@/views/AdminAdminsView.vue'),
      meta: { requiresAuth: true, roles: ['admin'] },
    },
    {
      path: '/sign-in/:pathMatch(.*)*',
      name: 'sign-in',
      component: () => import('@/views/SignInView.vue'),
    },
    {
      path: '/sign-up/:pathMatch(.*)*',
      name: 'sign-up',
      component: () => import('@/views/SignUpView.vue'),
    },
  ],
})

router.beforeEach(async (to) => {
  const isAuthPage = to.name === 'sign-in' || to.name === 'sign-up'

  const clerk = await waitForClerkLoaded()

  if (to.meta.requiresAuth && !clerk?.isSignedIn) {
    return {
      path: '/sign-in',
      query: {
        redirect_url: to.fullPath,
      },
    }
  }

  let currentRole = null
  let currentUser = null

  async function fetchCurrentUser() {
    if (currentUser) return currentUser

    const { data } = await api.get('/api/users/me')
    currentUser = data || {}
    currentRole = currentUser.role || 'student'
    return currentUser
  }

  async function fetchCurrentRole() {
    if (currentRole) return currentRole

    await fetchCurrentUser()
    return currentRole
  }

  function isStudentProfileComplete(user) {
    if (!user || user.role !== 'student') return true

    return [
      user.firstName,
      user.lastName,
      user.phone,
      user.nationality,
      user.dateOfBirth,
      user.currentEducationLevel,
      user.preferredStudyLevel,
      user.preferredDestination,
      user.maxBudget,
      user.budgetCurrency,
    ].every(Boolean)
  }

  if (clerk?.isSignedIn && !isAuthPage) {
    try {
      const user = await fetchCurrentUser()

      if (user.role === 'student' && !isStudentProfileComplete(user) && to.name !== 'onboarding') {
        return {
          path: '/onboarding',
          query: {
            redirect_url: to.fullPath,
          },
        }
      }

      if (to.name === 'onboarding' && isStudentProfileComplete(user)) {
        return { path: '/dashboard' }
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (!to.meta.requiresAuth && !isAuthPage && !to.meta.studentOnly) {
    return true
  }

  if (to.name === 'dashboard') {
    try {
      const role = await fetchCurrentRole()

      if (role === 'admin') return { path: '/admin' }
      if (role === 'consultant') return { path: '/consultant' }
    } catch (error) {
      console.error(error)
    }
  }

  if (to.meta.studentOnly && clerk?.isSignedIn) {
    try {
      const role = await fetchCurrentRole()

      if (role === 'admin') return { path: '/admin' }
      if (role === 'consultant') return { path: '/consultant' }
    } catch (error) {
      console.error(error)
    }
  }

  if (to.meta.roles?.length) {
    try {
      const role = await fetchCurrentRole()

      if (!to.meta.roles.includes(role)) {
        return { path: '/dashboard' }
      }
    } catch (error) {
      console.error(error)
      return { path: '/dashboard' }
    }
  }

  if (isAuthPage && clerk?.isSignedIn) {
    return { path: '/dashboard' }
  }

  return true
})

export default router
