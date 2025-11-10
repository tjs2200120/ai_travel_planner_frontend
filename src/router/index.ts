import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/trips',
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/trips',
    name: 'Trips',
    component: () => import('@/views/Trips.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/trips/new',
    name: 'NewTrip',
    component: () => import('@/views/NewTrip.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/trips/:id',
    name: 'TripDetail',
    component: () => import('@/views/TripDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/expenses',
    name: 'Expenses',
    component: () => import('@/views/Expenses.vue'),
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const requiresAuth = to.meta.requiresAuth !== false

  if (requiresAuth && !userStore.isLoggedIn()) {
    next('/login')
  } else if ((to.path === '/login' || to.path === '/register') && userStore.isLoggedIn()) {
    next('/trips')
  } else {
    next()
  }
})

export default router
