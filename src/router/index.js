import { createRouter, createWebHistory } from 'vue-router'
import FormularioGastos from '../components/FormularioGastos.vue'
import Login from '../components/Login.vue'
import Dashboard from '../components/Dashboard.vue'
import { supabase } from '../supabase'

const routes = [
  {
    path: '/',
    name: 'Formulario',
    component: FormularioGastos
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Guard para proteger rutas
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      next('/login')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router