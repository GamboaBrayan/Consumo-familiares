import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import Registro from '../components/Registro.vue'
import Dashboard from '../components/Dashboard.vue'
import Perfil from '../components/Perfil.vue'
import FormularioGastos from '../components/FormularioGastos.vue'
import { supabase } from '../supabase'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/registro',
    name: 'Registro',
    component: Registro
  },
  {
    path: '/formulario',
    name: 'Formulario',
    component: FormularioGastos
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: Perfil,
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
      next('/')
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router