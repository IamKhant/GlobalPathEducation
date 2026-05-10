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
      path: '/admin',
      name: 'admin',
      component: () => import('@/views/AdminView.vue'),
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

  if (!to.meta.requiresAuth && !isAuthPage && !to.meta.studentOnly) {
    return true
  }

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

  async function fetchCurrentRole() {
    if (currentRole) return currentRole

    const { data } = await api.get('/api/users/me')
    currentRole = data?.role || 'student'
    return currentRole
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
