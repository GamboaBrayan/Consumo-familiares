<template>
  <div class="container">
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
        <h1 style="color: var(--primary-color);">Mi Perfil</h1>
        <router-link to="/dashboard" class="btn btn-primary" style="text-decoration: none;">
          ← Volver
        </router-link>
      </div>

      <!-- Link del formulario de familia -->
      <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h2 style="margin-bottom: 16px; color: white;">🔗 Link de tu Familia</h2>
        <p style="margin-bottom: 16px; opacity: 0.9;">
          Comparte este enlace con los miembros de <strong>{{ nombreFamilia }}</strong> para que puedan registrar gastos:
        </p>
        
        <div style="background: rgba(255,255,255,0.2); padding: 16px; border-radius: 6px; margin-bottom: 16px;">
          <input 
            ref="linkInput"
            type="text" 
            :value="linkFormulario" 
            readonly
            style="width: 100%; padding: 12px; border: none; border-radius: 4px; font-family: monospace; font-size: 14px; background: white; color: #333;"
          />
        </div>

        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <button @click="copiarLink" class="btn" style="background: white; color: var(--primary-color); flex: 1; min-width: 150px;">
            {{ linkCopiado ? 'Copiado!' : 'Copiar Link' }}
          </button>
          <button @click="abrirFormulario" class="btn" style="background: rgba(255,255,255,0.2); color: white; border: 2px solid white; flex: 1; min-width: 150px;">
            Abrir Link
          </button>
        </div>
      </div>

      <!-- Información del perfil -->
      <div class="card">
        <h2 style="margin-bottom: 20px;">Información Personal</h2>
        
        <div v-if="cargando" style="text-align: center; padding: 40px; color: var(--text-secondary);">
          ⏳ Cargando perfil...
        </div>

        <div v-else-if="perfil">
          <div v-if="mensaje" :class="['alert', mensajeType === 'success' ? 'alert-success' : 'alert-error']">
            {{ mensaje }}
          </div>

          <div v-if="!editando">
            <!-- Vista de solo lectura -->
            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px;">
                Nombre Completo
              </label>
              <p style="font-size: 18px; margin: 0;">{{ perfil.nombre_completo }}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px;">
                Email
              </label>
              <p style="font-size: 18px; margin: 0;">{{ usuario?.email }}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px;">
                Familia
              </label>
              <p style="font-size: 18px; margin: 0;">{{ nombreFamilia }}</p>
            </div>

            <div style="margin-bottom: 20px;">
              <label style="display: block; font-weight: 500; color: var(--text-secondary); margin-bottom: 4px;">
                Miembro desde
              </label>
              <p style="font-size: 18px; margin: 0;">{{ formatearFecha(perfil.created_at) }}</p>
            </div>

            <button @click="editando = true" class="btn btn-primary">
                Editar Perfil
            </button>
          </div>

          <div v-else>
            <!-- Modo edición -->
            <form @submit.prevent="guardarCambios">
              <div class="form-group">
                <label for="nombre">Nombre Completo *</label>
                <input 
                  type="text" 
                  id="nombre" 
                  v-model="formEditar.nombre_completo" 
                  required 
                />
              </div>

              <div style="display: flex; gap: 12px;">
                <button type="submit" class="btn btn-primary" :disabled="guardando">
                  {{ guardando ? '⏳ Guardando...' : 'Guardar Cambios' }}
                </button>
                <button 
                  type="button" 
                  @click="cancelarEdicion" 
                  class="btn" 
                  style="background: red; color: white;"
                  :disabled="guardando"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Cambiar contraseña -->
      <div class="card">
        <h2 style="margin-bottom: 20px;">Cambiar Contraseña</h2>
        
        <div v-if="mensajePassword" :class="['alert', mensajePasswordType === 'success' ? 'alert-success' : 'alert-error']">
          {{ mensajePassword }}
        </div>

        <form @submit.prevent="cambiarPassword">
          <div class="form-group">
            <label for="nueva_password">Nueva Contraseña *</label>
            <input 
              type="password" 
              id="nueva_password" 
              v-model="formPassword.nueva_password" 
              required 
              minlength="6"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div class="form-group">
            <label for="confirmar_password">Confirmar Contraseña *</label>
            <input 
              type="password" 
              id="confirmar_password" 
              v-model="formPassword.confirmar_password" 
              required 
              minlength="6"
              placeholder="Repite la nueva contraseña"
            />
          </div>

          <button type="submit" class="btn btn-primary" :disabled="cambiandoPassword">
            {{ cambiandoPassword ? 'Cambiando...' : 'Cambiar Contraseña' }}
          </button>
        </form>
      </div>

      <!-- Cerrar sesión -->
        <button @click="handleLogout" class="btn btn-danger">
          Cerrar Sesión
        </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'
import { generarCodigoURL } from '../utils/crypto'

const router = useRouter()

const perfil = ref(null)
const usuario = ref(null)
const familia = ref(null)
const cargando = ref(true)
const editando = ref(false)
const guardando = ref(false)
const cambiandoPassword = ref(false)
const linkCopiado = ref(false)
const linkInput = ref(null)

const mensaje = ref('')
const mensajeType = ref('success')
const mensajePassword = ref('')
const mensajePasswordType = ref('success')

const formEditar = ref({
  nombre_completo: ''
})

const formPassword = ref({
  nueva_password: '',
  confirmar_password: ''
})

// Obtener nombre de la familia
const nombreFamilia = computed(() => {
  return familia.value?.nombre || 'Sin asignar'
})

// Generar link del formulario con código encriptado
const linkFormulario = computed(() => {
  if (!familia.value?.codigo_acceso) return ''
  
  const codigoEncriptado = generarCodigoURL(familia.value.codigo_acceso)
  const baseUrl = window.location.origin
  return `${baseUrl}/formulario?codigo=${codigoEncriptado}`
})

// Copiar link al portapapeles
const copiarLink = async () => {
  try {
    await navigator.clipboard.writeText(linkFormulario.value)
    linkCopiado.value = true
    
    setTimeout(() => {
      linkCopiado.value = false
    }, 3000)
  } catch (error) {
    // Fallback para navegadores antiguos
    if (linkInput.value) {
      linkInput.value.select()
      document.execCommand('copy')
      linkCopiado.value = true
      
      setTimeout(() => {
        linkCopiado.value = false
      }, 3000)
    }
  }
}

// Abrir formulario en nueva pestaña
const abrirFormulario = () => {
  window.open(linkFormulario.value, '_blank')
}

// Cargar perfil del usuario
const cargarPerfil = async () => {
  cargando.value = true
  try {
    // Obtener usuario actual
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    
    if (!user) {
      router.push('/')
      return
    }
    
    usuario.value = user

    // Obtener perfil con familia
    const { data: perfilData, error: perfilError } = await supabase
      .from('perfiles')
      .select(`
        *,
        familias (
          id,
          nombre,
          codigo_acceso
        )
      `)
      .eq('id', user.id)
      .single()

    if (perfilError) throw perfilError
    perfil.value = perfilData
    familia.value = perfilData.familias

  } catch (error) {
    console.error('Error al cargar perfil:', error)
    mensaje.value = '❌ Error al cargar el perfil'
    mensajeType.value = 'error'
  } finally {
    cargando.value = false
  }
}

// Editar perfil
const cancelarEdicion = () => {
  editando.value = false
  mensaje.value = ''
  formEditar.value.nombre_completo = perfil.value.nombre_completo
}

const guardarCambios = async () => {
  guardando.value = true
  mensaje.value = ''

  try {
    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre_completo: formEditar.value.nombre_completo,
        updated_at: new Date().toISOString()
      })
      .eq('id', usuario.value.id)

    if (error) throw error

    perfil.value.nombre_completo = formEditar.value.nombre_completo
    editando.value = false
    mensaje.value = '✅ Perfil actualizado correctamente'
    mensajeType.value = 'success'

    setTimeout(() => {
      mensaje.value = ''
    }, 3000)

  } catch (error) {
    console.error('Error al guardar:', error)
    mensaje.value = '❌ Error al guardar los cambios'
    mensajeType.value = 'error'
  } finally {
    guardando.value = false
  }
}

// Cambiar contraseña
const cambiarPassword = async () => {
  if (formPassword.value.nueva_password !== formPassword.value.confirmar_password) {
    mensajePassword.value = '❌ Las contraseñas no coinciden'
    mensajePasswordType.value = 'error'
    return
  }

  if (formPassword.value.nueva_password.length < 6) {
    mensajePassword.value = '❌ La contraseña debe tener mínimo 6 caracteres'
    mensajePasswordType.value = 'error'
    return
  }

  cambiandoPassword.value = true
  mensajePassword.value = ''

  try {
    const { error } = await supabase.auth.updateUser({
      password: formPassword.value.nueva_password
    })

    if (error) throw error

    mensajePassword.value = '✅ Contraseña actualizada correctamente'
    mensajePasswordType.value = 'success'

    // Limpiar formulario
    formPassword.value = {
      nueva_password: '',
      confirmar_password: ''
    }

    setTimeout(() => {
      mensajePassword.value = ''
    }, 3000)

  } catch (error) {
    console.error('Error al cambiar contraseña:', error)
    mensajePassword.value = '❌ Error al cambiar la contraseña'
    mensajePasswordType.value = 'error'
  } finally {
    cambiandoPassword.value = false
  }
}

// Cerrar sesión
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

// Formatear fecha
const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

onMounted(async () => {
  await cargarPerfil()
  if (perfil.value) {
    formEditar.value.nombre_completo = perfil.value.nombre_completo
  }
})
</script>