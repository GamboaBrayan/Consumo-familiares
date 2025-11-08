<template>
  <div class="container">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h1 style="color: var(--primary-color);">📊 Dashboard de Gastos</h1>
      <button @click="handleLogout" class="btn btn-danger">Cerrar Sesión</button>
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

        <div class="form-group" style="margin-bottom: 0;">
          <label>Fecha Específica</label>
          <input 
            type="date" 
            v-model="filtroFecha"
            style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;"
          >
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

    <!-- Tabla de gastos recientes -->
    <div class="card">
      <h2 style="margin-bottom: 16px;">📝 Registros Recientes ({{ gastosFiltrados.length }})</h2>
      
      <div v-if="cargando" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        ⏳ Cargando gastos...
      </div>

      <div v-else-if="gastosFiltrados.length === 0" style="text-align: center; padding: 40px; color: var(--text-secondary);">
        📭 No hay gastos registrados aún
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
            <tr v-for="gasto in gastosFiltrados" :key="gasto.id" style="border-bottom: 1px solid var(--border-color);">
              <td style="padding: 12px;">{{ formatearFecha(gasto.fecha) }}</td>
              <td style="padding: 12px;">{{ gasto.nombre }}</td>
              <td style="padding: 12px;">
                <span :style="{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: gasto.tipo_movimiento === 'Ingreso' ? '#d1fae5' : '#fee2e2',
                  color: gasto.tipo_movimiento === 'Ingreso' ? '#065f46' : '#991b1b'
                }">
                  {{ gasto.tipo_movimiento === 'Ingreso' ? '💵' : '💸' }} {{ gasto.tipo_movimiento }}
                </span>
              </td>
              <td style="padding: 12px;">{{ gasto.categoria }}</td>
              <td style="padding: 8px; max-width: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                {{ gasto.motivo || '-' }}
              </td>
              <td style="padding: 8px; text-align: right; font-weight: 500;" 
                  :style="{ color: gasto.tipo_movimiento === 'Ingreso' ? 'var(--success-color)' : 'var(--danger-color)' }">
                {{ gasto.tipo_movimiento === 'Ingreso' ? '+' : '-' }} S/ {{ gasto.precio_soles.toFixed(2) }}
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

const gastos = ref([])
const cargando = ref(true)
const filtroTipo = ref('')
const filtroCategoria = ref('')
const filtroNombre = ref('')
const filtroFecha = ref('')

// Cargar gastos
const cargarGastos = async () => {
  cargando.value = true
  try {
    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false })

    if (error) throw error
    gastos.value = data || []
  } catch (error) {
    console.error('Error al cargar gastos:', error)
  } finally {
    cargando.value = false
  }
}

// Gastos filtrados
const gastosFiltrados = computed(() => {
  let resultado = gastos.value

  if (filtroTipo.value) {
    resultado = resultado.filter(g => g.tipo_movimiento === filtroTipo.value)
  }

  if (filtroCategoria.value) {
    resultado = resultado.filter(g => g.categoria === filtroCategoria.value)
  }

  if (filtroNombre.value) {
    resultado = resultado.filter(g => g.nombre === filtroNombre.value)
  }

  if (filtroFecha.value) {
    resultado = resultado.filter(g => {
      const fechaGasto = new Date(g.fecha)
      const fechaLocal = new Date(fechaGasto.getTime() - fechaGasto.getTimezoneOffset() * 60000)
      const fechaFormateada = fechaLocal.toISOString().split('T')[0]
      return fechaFormateada === filtroFecha.value
    })
  }

  return resultado
})

// Nombres únicos para el filtro
const nombresUnicos = computed(() => {
  return [...new Set(gastos.value.map(g => g.nombre))].sort()
})

// Totales
const totalIngresos = computed(() => {
  return gastosFiltrados.value
    .filter(g => g.tipo_movimiento === 'Ingreso')
    .reduce((sum, g) => sum + parseFloat(g.precio_soles), 0)
})

const totalGastos = computed(() => {
  return gastosFiltrados.value
    .filter(g => g.tipo_movimiento === 'Gasto')
    .reduce((sum, g) => sum + parseFloat(g.precio_soles), 0)
})

const balance = computed(() => totalIngresos.value - totalGastos.value)

// Gastos por categoría (solo egresos)
const gastosPorCategoria = computed(() => {
  const categorias = {}
  
  gastosFiltrados.value
    .filter(g => g.tipo_movimiento === 'Gasto')
    .forEach(g => {
      if (!categorias[g.categoria]) {
        categorias[g.categoria] = 0
      }
      categorias[g.categoria] += parseFloat(g.precio_soles)
    })

  return Object.entries(categorias)
    .map(([categoria, total]) => ({ categoria, total }))
    .sort((a, b) => b.total - a.total)
})

const maxGastoCategoria = computed(() => {
  return gastosPorCategoria.value.length > 0 
    ? Math.max(...gastosPorCategoria.value.map(c => c.total))
    : 1
})

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
  router.push('/login')
}

onMounted(() => {
  cargarGastos()
})
</script>