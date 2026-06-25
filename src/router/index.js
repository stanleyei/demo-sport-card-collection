import { createRouter, createWebHistory } from 'vue-router'
import DrawView from '../views/DrawView.vue'
import LoginView from '../views/LoginView.vue'
import MemberView from '../views/MemberView.vue'
import CardDetailView from '../views/CardDetailView.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
  { path: '/', name: 'draw', component: DrawView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/member', name: 'member', component: MemberView, meta: { requiresAuth: true } },
  { path: '/member/card/:uid', name: 'card-detail', component: CardDetailView, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// 會員中心需登入，未登入導向登入頁
router.beforeEach((to) => {
  const { isLoggedIn } = useAuth()
  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: 'login' }
  }
})

export default router
