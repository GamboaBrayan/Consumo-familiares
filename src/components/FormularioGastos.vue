<template>
  <div class="container">
    <div class="card" style="max-width: 600px; margin: 40px auto;">
      <h1 style="margin-bottom: 24px; color: var(--primary-color);">💰 Registro de Consumo Familiar</h1>
      
      <div v-if="mensaje" :class="['alert', mensajeType === 'success' ? 'alert-success' : 'alert-error']">
        {{ mensaje }}
      </div>

      <form @submit.prevent="guardarGasto">
        <div class="form-group">
          <label for="nombre">Nombre *</label>
          <select id="nombre" v-model="form.nombre" required>
            <option value="">Selecciona...</option>
            <option value="Jorge Quilla">Jorge Quilla</option>
            <option value="Flor Luyo">Flor Luyo</option>
            <option value="Martín Quilla">Martín Quilla</option>
            <option value="Gerardo Quilla">Gerardo Quilla</option>
            <option value="Carlos Quilla">Carlos Quilla</option>
          </select>
        </div>

        <div class="form-group">
          <label for="tipo">Tipo de Movimiento *</label>
          <select id="tipo" v-model="form.tipo_movimiento" required>
            <option value="">Selecciona...</option>
            <option value="Ingreso">💵 Ingreso</option>
            <option value="Gasto">💸 Gasto</option>
          </select>
        </div>

        <div class="form-group">
          <label for="categoria">Categoría *</label>
          <select id="categoria" v-model="form.categoria" required @change="handleCategoriaChange">
            <option value="">Selecciona...</option>
            <option value="Comida">🍔 Comida</option>
            <option value="Pasajes">🚌 Pasajes</option>
            <option value="Dinero Fisico">💵 Dinero Fisico</option>
            <option value="Yapeo">📱 Yapeo</option>
            <option value="Mercado">🛒 Mercado</option>
            <option value="Transferencia Bancaria">🏦 Transferencia Bancaria</option>
            <option value="Ropa">👕 Ropa</option>
            <option value="Mascotas">🐾 Mascotas</option>
            <option value="Viajes">✈️ Viajes</option>
            <option value="Tecnologia">💻 Tecnologia</option>
            <option value="Otros">📦 Otros</option>
          </select>
        </div>

        <!-- Campo que aparece solo cuando selecciona "Otros" -->
        <div class="form-group" v-if="form.categoria === 'Otros'">
          <label for="categoria_otro">Especificar Categoría *</label>
          <input 
            type="text" 
            id="categoria_otro" 
            v-model="form.categoria_otro" 
            required 
            placeholder="¿Qué tipo de gasto es?"
          />
        </div>

        <div class="form-group">
          <label for="motivo">Motivo (opcional)</label>
          <textarea 
            id="motivo" 
            v-model="form.motivo" 
            rows="3" 
            placeholder="Descripción breve del gasto"
            style="resize: vertical; min-height: 80px;"
          ></textarea>
        </div>

        <div class="form-group">
          <label for="precio">Precio en Soles *</label>
          <input 
            type="number" 
            id="precio" 
            v-model.number="form.precio_soles" 
            step="0.01" 
            min="1" 
            required 
            placeholder="Mínimo S/ 0.50"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary"
          :disabled="guardando"
          style="width: 30%; display: block; margin: 16px auto 0;"
        >
          {{ guardando ? '⏳ Guardando...' : 'Registrar' }}
        </button>
      </form>

      <div style="margin-top: 24px; text-align: center; padding-top: 24px; border-top: 1px solid var(--border-color);">
        <p style="color: var(--text-secondary); font-size: 14px;">
          ¿Administrador? 
          <router-link to="/login" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">
            Ir al Dashboard
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const form = ref({
  nombre: '',
  tipo_movimiento: '',
  categoria: '',
  categoria_otro: '',
  motivo: '',
  precio_soles: null
})

const mensaje = ref('')
const mensajeType = ref('success')
const guardando = ref(false)

const handleCategoriaChange = () => {
  // Limpiar el campo "categoria_otro" si no es "Otros"
  if (form.value.categoria !== 'Otros') {
    form.value.categoria_otro = ''
  }
}

const guardarGasto = async () => {
  // Validar que el precio sea mínimo 1
  if (form.value.precio_soles < 0.5) {
    mensaje.value = '❌ El precio debe ser mínimo S/ 0.50.'
    mensajeType.value = 'error'
    return
  }

  guardando.value = true
  mensaje.value = ''

  try {
    // Si seleccionó "Otros", usar el texto personalizado
    const categoriaFinal = form.value.categoria === 'Otros' 
      ? `Otros: ${form.value.categoria_otro}`
      : form.value.categoria

    const { data, error } = await supabase
      .from('gastos')
      .insert([
        {
          nombre: form.value.nombre,
          tipo_movimiento: form.value.tipo_movimiento,
          categoria: categoriaFinal,
          motivo: form.value.motivo || null,
          precio_soles: form.value.precio_soles
        }
      ])

    if (error) throw error

    mensaje.value = '✅ ¡Registrado exitosamente!'
    mensajeType.value = 'success'

    // Limpiar formulario
    form.value = {
      nombre: '',
      tipo_movimiento: '',
      categoria: '',
      categoria_otro: '',
      motivo: '',
      precio_soles: null
    }

    setTimeout(() => {
      mensaje.value = ''
    }, 3000)

  } catch (error) {
    console.error('Error:', error)
    mensaje.value = '❌ Error al registrar. Intenta nuevamente.'
    mensajeType.value = 'error'
  } finally {
    guardando.value = false
  }
}
</script>