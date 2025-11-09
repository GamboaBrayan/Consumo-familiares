<template>
  <div class="container">
    <div class="card" style="max-width: 500px; margin: 60px auto;">
      <h1 style="margin-bottom: 24px; color: var(--primary-color); text-align: center;">📝 Crear Cuenta</h1>
      
      <div v-if="mensaje" :class="['alert', mensajeType === 'success' ? 'alert-success' : 'alert-error']">
        {{ mensaje }}
      </div>

      <form @submit.prevent="handleRegistro">
        <div class="form-group">
          <label for="nombre">Nombre Completo *</label>
          <input 
            type="text" 
            id="nombre" 
            v-model="form.nombre_completo" 
            required 
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div class="form-group">
          <label for="familia">¿De qué familia eres? *</label>
          <select id="familia" v-model="form.familia_id" required>
            <option value="">Selecciona tu familia...</option>
            <option v-for="familia in familias" :key="familia.id" :value="familia.id">
              {{ familia.nombre }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="email">Email *</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            required 
            placeholder="tu@email.com"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña *</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required 
            minlength="6"
            placeholder="Mínimo 6 caracteres"
          />
        </div>

        <div class="form-group">
          <label for="password_confirm">Confirmar Contraseña *</label>
          <input 
            type="password" 
            id="password_confirm" 
            v-model="form.password_confirm" 
            required 
            minlength="6"
            placeholder="Repite tu contraseña"
          />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="registrando" style="width: 100%;">
          {{ registrando ? '⏳ Creando cuenta...' : '✅ Registrarse' }}
        </button>
      </form>

      <div style="margin-top: 24px; text-align: center; padding-top: 24px; border-top: 1px solid var(--border-color);">
        <p style="color: var(--text-secondary); font-size: 14px;">
          ¿Ya tienes cuenta? 
          <router-link to="/" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
            Inicia sesión
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const form = ref({
  nombre_completo: '',
  familia_id: '',
  email: '',
  password: '',
  password_confirm: ''
})

const familias = ref([])
const mensaje = ref('')
const mensajeType = ref('success')
const registrando = ref(false)

// Cargar lista de familias
const cargarFamilias = async () => {
  try {
    const { data, error } = await supabase
      .from('familias')
      .select('id, nombre')
      .order('nombre')

    if (error) throw error
    familias.value = data || []
  } catch (error) {
    console.error('Error al cargar familias:', error)
    mensaje.value = '❌ Error al cargar familias'
    mensajeType.value = 'error'
  }
}

const handleRegistro = async () => {
  // Validar contraseñas
  if (form.value.password !== form.value.password_confirm) {
    mensaje.value = '❌ Las contraseñas no coinciden'
    mensajeType.value = 'error'
    return
  }

  if (form.value.password.length < 6) {
    mensaje.value = '❌ La contraseña debe tener mínimo 6 caracteres'
    mensajeType.value = 'error'
    return
  }

  registrando.value = true
  mensaje.value = ''

  try {
    // Crear usuario en Supabase Auth con metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: {
          nombre_completo: form.value.nombre_completo,
          familia_id: form.value.familia_id
        }
      }
    })

    if (authError) throw authError

    if (!authData.user) {
      throw new Error('No se pudo crear el usuario')
    }

    mensaje.value = '✅ ¡Cuenta creada exitosamente! Redirigiendo...'
    mensajeType.value = 'success'

    // Redirigir al dashboard después de 2 segundos
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

  } catch (error) {
    console.error('Error en registro:', error)
    
    if (error.message.includes('already registered')) {
      mensaje.value = '❌ Este email ya está registrado'
    } else if (error.message.includes('Invalid email')) {
      mensaje.value = '❌ Email inválido'
    } else {
      mensaje.value = `❌ Error al crear la cuenta: ${error.message}`
    }
    
    mensajeType.value = 'error'
  } finally {
    registrando.value = false
  }
}

onMounted(() => {
  cargarFamilias()
})
</script>