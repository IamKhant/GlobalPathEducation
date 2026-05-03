import { createRouter, createWebHistory } from 'vue-router'
import { waitForClerkLoaded } from '@/auth/clerk'

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
      meta: { requiresAuth: true },
    },
    {
      path: '/consult',
      name: 'consult',
      component: () => import('@/views/ConsultView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
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

  if (!to.meta.requiresAuth && !isAuthPage) {
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

  if (isAuthPage && clerk?.isSignedIn) {
    return { path: '/dashboard' }
  }

  return true
})

export default router
