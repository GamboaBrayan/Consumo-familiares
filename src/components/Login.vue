<template>
  <div class="container">
    <div class="card" style="max-width: 400px; margin: 230px auto;">
      <h1 style="margin-bottom: 24px; color: var(--primary-color); text-align: center;">Login Administrador</h1>
      
      <div v-if="mensaje" :class="['alert', mensajeType === 'success' ? 'alert-success' : 'alert-error']">
        {{ mensaje }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="tu@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="••••••••"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="cargando" style="width: 100%;">
          {{ cargando ? '⏳ Ingresando...' : '✅ Ingresar' }}
        </button>
      </form>

      <div style="margin-top: 24px; text-align: center; padding-top: 24px; border-top: 1px solid var(--border-color);">
        <router-link to="/" style="color: var(--primary-color); text-decoration: none; font-size: 14px;">
          ← Volver al formulario
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const email = ref('')
const password = ref('')
const mensaje = ref('')
const mensajeType = ref('success')
const cargando = ref(false)

const handleLogin = async () => {
  cargando.value = true
  mensaje.value = ''

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    mensaje.value = '✅ Login exitoso! Redirigiendo...'
    mensajeType.value = 'success'

    setTimeout(() => {
      router.push('/dashboard')
    }, 1000)

  } catch (error) {
    console.error('Error:', error)
    mensaje.value = '❌ Email o contraseña incorrectos'
    mensajeType.value = 'error'
  } finally {
    cargando.value = false
  }
}
</script>