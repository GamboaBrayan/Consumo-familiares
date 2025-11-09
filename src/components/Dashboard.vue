<template>
  <div class="container">
    <!-- Encabezado -->
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
      <h1 style="color: var(--primary-color); margin: 0;">📊 Dashboard de Gastos</h1>
      <div style="display: flex; gap: 12px;">
        <router-link to="/perfil" class="btn btn-primary" style="text-decoration: none;">
         Mi Perfil
        </router-link>
        <button @click="handleLogout" class="btn btn-danger">Cerrar Sesión</button>
      </div>
    </div>

    <!-- Resumen de totales -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
      <div class="card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <h3 style="margin-bottom: 8px; font-size: 16px; opacity: 0.9;">Total Ingresos</h3>
        <p style="font-size: 32px; font-weight: bold; margin: 0;">S/ {{ totalIngresos.toFixed(2) }}</p>
      </div>
      <div class="card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white;">
        <h3 style="margin-bottom: 8px; font-size: 16px; opacity: 0.9;">Total Gastos</h3>
        <p style="font-size: 32px; font-weight: bold; margin: 0;">S/ {{ totalGastos.toFixed(2) }}</p>
      </div>
      <div class="card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white;">
        <h3 style="margin-bottom: 8px; font-size: 16px; opacity: 0.9;">Balance</h3>
        <p style="font-size: 32px; font-weight: bold; margin: 0;">S/ {{ balance.toFixed(2) }}</p>
      </div>
    </div>

    <!-- Filtros -->
    <div class="card">
      <h2 style="margin-bottom: 16px;">🔍 Filtros</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
        <div class="form-group" style="margin-bottom: 0;">
          <label>Tipo de Movimiento</label>
          <select v-model="filtroTipo">
            <option value="">Todos</option>
            <option value="Ingreso">Ingresos</option>
            <option value="Gasto">Gastos</option>
          </select>
        </div>

        <div class="form-group" style="margin-bottom: 0;">
          <label>Categoría</label>
          <select v-model="filtroCategoria">
            <option value="">Todas</option>
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

        <div class="form-group" style="margin-bottom: 0;">
          <label>Nombre</label>
          <select v-model="filtroNombre">
            <option value="">Todos</option>
            <option v-for="nombre in nombresUnicos" :key="nombre" :value="nombre">{{ nombre }}</option>
          </select>
        </div>

        <!-- 🔍 Filtro por fecha exacta -->
        <div class="form-group" style="margin-bottom: 0;">
          <label>Fecha Exacta</label>
          <input type="date" v-model="filtroFecha" />
        </div>
      </div>
    </div>

    <!-- Estadísticas por categoría -->
    <div class="card">
      <h2 style="margin-bottom: 16px;">📈 Gastos por Categoría</h2>
      <div v-if="gastosPorCategoria.length > 0">
        <div v-for="cat in gastosPorCategoria" :key="cat.categoria" 
             style="margin-bottom: 12px; padding: 12px; background: var(--bg-color); border-radius: 6px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-weight: 500;">{{ cat.categoria }}</span>
            <span style="font-weight: bold; color: var(--primary-color);">S/ {{ cat.total.toFixed(2) }}</span>
          </div>
          <div style="background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden;">
            <div :style="{
              width: (cat.total / maxGastoCategoria * 100) + '%',
              height: '100%',
              background: 'var(--primary-color)',
              transition: 'width 0.3s'
            }"></div>
          </div>
        </div>
      </div>
      <p v-else style="color: var(--text-secondary); text-align: center; padding: 20px;">
        No hay datos para mostrar
      </p>
    </div>

    <!-- Tabla de registros -->
    <div class="card">
      <h2 style="margin-bottom: 16px;">📝 Registros Recientes ({{ registrosFiltrados.length }})</h2>

      <div v-if="cargando" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        ⏳ Cargando registros...
      </div>

      <div v-else-if="registrosFiltrados.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        📭 No hay registros aún
      </div>

      <div v-else style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: var(--bg-color); text-align: left;">
              <th style="padding: 12px; border-bottom: 2px solid var(--border-color);">Fecha</th>
              <th style="padding: 12px; border-bottom: 2px solid var(--border-color);">Nombre</th>
              <th style="padding: 12px; border-bottom: 2px solid var(--border-color);">Tipo</th>
              <th style="padding: 12px; border-bottom: 2px solid var(--border-color);">Categoría</th>
              <th style="padding: 12px; border-bottom: 2px solid var(--border-color);">Motivo</th>
              <th style="padding: 12px; border-bottom: 2px solid var(--border-color); text-align: right;">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="registro in registrosFiltrados" :key="registro.id" style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 12px;">{{ formatearFecha(registro.fecha) }}</td>
              <td style="padding: 12px;">{{ registro.nombre }}</td>
              <td style="padding: 12px;">
                <span :style="{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: registro.tipo_movimiento === 'Ingreso' ? '#d1fae5' : '#fee2e2',
                  color: registro.tipo_movimiento === 'Ingreso' ? '#065f46' : '#991b1b'
                }">
                  {{ registro.tipo_movimiento === 'Ingreso' ? '' : '' }} {{ registro.tipo_movimiento }}
                </span>
              </td>
              <td style="padding: 12px;">{{ registro.categoria }}</td>
              <td style="
                padding: 12px;
                max-width: 400px; /* Aumenta el ancho permitido */
                white-space: normal; /* Permite saltos de línea */
                word-wrap: break-word; /* Ajusta texto largo */
                line-height: 1.4;
              ">
                {{ registro.motivo || '-' }}
              </td>
              <td style="padding: 12px; text-align: right; font-weight: 500;" 
                  :style="{ color: registro.tipo_movimiento === 'Ingreso' ? 'var(--success-color)' : 'var(--danger-color)' }">
                {{ registro.tipo_movimiento === 'Ingreso' ? '+' : '-' }} S/ {{ registro.precio_soles.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()

const registros = ref([])
const cargando = ref(true)
const filtroTipo = ref('')
const filtroCategoria = ref('')
const filtroNombre = ref('')
const filtroFecha = ref('') // ✅ Nuevo filtro
const familiaId = ref(null)

// Cargar registros
const cargarRegistros = async () => {
  cargando.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return router.push('/')

    const { data: perfil } = await supabase
      .from('perfiles')
      .select('familia_id')
      .eq('id', user.id)
      .single()

    familiaId.value = perfil?.familia_id

    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .eq('familia_id', familiaId.value)
      .order('fecha', { ascending: false })

    if (error) throw error
    registros.value = data || []
  } catch (e) {
    console.error('Error al cargar registros:', e)
  } finally {
    cargando.value = false
  }
}

// Registros filtrados
const registrosFiltrados = computed(() => {
  let resultado = registros.value

  if (filtroTipo.value)
    resultado = resultado.filter(r => r.tipo_movimiento === filtroTipo.value)

  if (filtroCategoria.value)
    resultado = resultado.filter(r => r.categoria === filtroCategoria.value)

  if (filtroNombre.value)
    resultado = resultado.filter(r => r.nombre === filtroNombre.value)

  // ✅ Filtro de fecha exacta
  if (filtroFecha.value) {
    const fechaSeleccionada = new Date(filtroFecha.value)
    resultado = resultado.filter(r => {
      const fechaRegistro = new Date(r.fecha)
      return (
        fechaRegistro.getFullYear() === fechaSeleccionada.getFullYear() &&
        fechaRegistro.getMonth() === fechaSeleccionada.getMonth() &&
        fechaRegistro.getDate() === fechaSeleccionada.getDate()
      )
    })
  }

  return resultado
})

// Nombres únicos
const nombresUnicos = computed(() => [...new Set(registros.value.map(r => r.nombre))].sort())

// Totales
const totalIngresos = computed(() =>
  registrosFiltrados.value.filter(r => r.tipo_movimiento === 'Ingreso')
    .reduce((sum, r) => sum + parseFloat(r.precio_soles), 0)
)

const totalGastos = computed(() =>
  registrosFiltrados.value.filter(r => r.tipo_movimiento === 'Gasto')
    .reduce((sum, r) => sum + parseFloat(r.precio_soles), 0)
)

const balance = computed(() => totalIngresos.value - totalGastos.value)

// Gastos por categoría
const gastosPorCategoria = computed(() => {
  const categorias = {}
  registrosFiltrados.value
    .filter(r => r.tipo_movimiento === 'Gasto')
    .forEach(r => {
      categorias[r.categoria] = (categorias[r.categoria] || 0) + parseFloat(r.precio_soles)
    })
  return Object.entries(categorias)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
})

const maxGastoCategoria = computed(() => gastosPorCategoria.value.length > 0 
  ? Math.max(...gastosPorCategoria.value.map(c => c.total)) : 1)

// Formatear fecha
const formatearFecha = (fecha) => {
  const date = new Date(fecha)
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Logout
const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

onMounted(cargarRegistros)
</script>
