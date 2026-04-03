/**
 * Seed de datos demo para TuCarta.
 * Crea un restaurante completo con categorías e items de ejemplo.
 *
 * Uso: node scripts/seed-demo.mjs
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Leer .env.local manualmente (sin dotenv)
function loadEnv() {
  const envPath = resolve(__dirname, '../.env.local')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  for (const line of lines) {
    const [key, ...rest] = line.split('=')
    if (key && rest.length) {
      const value = rest.join('=').replace(/^["']|["']$/g, '').trim()
      if (value) process.env[key.trim()] = value
    }
  }
}

loadEnv()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

// ─── Datos del restaurante demo ───────────────────────────────────────────────

const SLUG = 'la-picada-de-don-jorge'
const EMAIL = 'jorge@lapicada.cl'
const PASSWORD = 'Demo1234'

const MENU = [
  {
    categoria: 'Entradas',
    items: [
      { nombre: 'Empanadas de pino (2 un.)', descripcion: 'Empanadas horneadas rellenas de pino tradicional con carne, cebolla, huevo y aceituna.', precio: 3200 },
      { nombre: 'Churrasco italiano', descripcion: 'Pan amasado con lomo de vacuno, palta, tomate y mayonesa.', precio: 4500 },
      { nombre: 'Sopaipillas con pebre (6 un.)', descripcion: 'Sopaipillas caseras servidas con pebre chileno tradicional.', precio: 2500 },
    ],
  },
  {
    categoria: 'Platos de fondo',
    items: [
      { nombre: 'Cazuela de vacuno', descripcion: 'Cazuela tradicional con plateada, papas, choclo, zapallo y fideos. Acompañada de arroz.', precio: 8900 },
      { nombre: 'Pollo a la plancha', descripcion: 'Pechuga de pollo a la plancha con puré de papa y ensalada chilena.', precio: 7500 },
      { nombre: 'Pastel de choclo', descripcion: 'Pastel de choclo con pino, pollo, huevo duro y aceitunas. Masa de choclo dulce.', precio: 9200 },
      { nombre: 'Lomo a lo pobre', descripcion: 'Lomo de vacuno con papas fritas, huevos fritos y cebolla caramelizada.', precio: 10500 },
    ],
  },
  {
    categoria: 'Ensaladas',
    items: [
      { nombre: 'Ensalada chilena', descripcion: 'Tomate y cebolla aliñados con sal, aceite y cilantro.', precio: 2900 },
      { nombre: 'Ensalada mixta', descripcion: 'Lechuga, tomate, zanahoria, pepino y palmitos con aderezo a elección.', precio: 3500 },
    ],
  },
  {
    categoria: 'Bebidas',
    items: [
      { nombre: 'Bebida en lata', descripcion: 'Coca-Cola, Fanta, Sprite o Schop (355ml).', precio: 1500 },
      { nombre: 'Agua mineral (500ml)', descripcion: 'Con o sin gas.', precio: 1200 },
      { nombre: 'Jugo natural', descripcion: 'Mango, naranja o piña. Preparado al momento.', precio: 2500 },
      { nombre: 'Terremoto', descripcion: 'Tradicional bebida chilena con vino pipeño, helado de piña y fernet.', precio: 3800 },
    ],
  },
  {
    categoria: 'Postres',
    items: [
      { nombre: 'Leche asada', descripcion: 'Clásico postre chileno de leche asada con caramelo.', precio: 2800 },
      { nombre: 'Torta mil hojas', descripcion: 'Porción de torta mil hojas con manjar y crema.', precio: 3200 },
    ],
  },
]

// ─── Ejecución ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Iniciando seed demo...\n')

  // 1. Eliminar datos previos del slug (idempotente)
  const { data: existing } = await supabase.from('tenants').select('id').eq('slug', SLUG).single()
  if (existing) {
    console.log(`⚠️  Ya existe tenant con slug "${SLUG}". Eliminando datos previos...`)
    await supabase.from('tenants').delete().eq('id', existing.id)
  }

  // 2. Crear tenant
  const { data: tenant, error: tErr } = await supabase
    .from('tenants')
    .insert({
      slug: SLUG,
      nombre: 'La Picada de Don Jorge',
      colores: { primario: '#C0392B', fondo: '#FDF6EC' },
      plan: 'basico',
    })
    .select('id')
    .single()

  if (tErr || !tenant) {
    console.error('❌ Error creando tenant:', tErr?.message)
    process.exit(1)
  }
  console.log(`✅ Tenant creado: "${SLUG}" (id: ${tenant.id})`)

  // 3. Crear usuario owner
  const hash = await bcrypt.hash(PASSWORD, 12)
  const { error: uErr } = await supabase
    .from('users')
    .insert({ tenant_id: tenant.id, email: EMAIL, password_hash: hash, role: 'owner' })

  if (uErr) {
    console.error('❌ Error creando usuario:', uErr.message)
    process.exit(1)
  }
  console.log(`✅ Usuario creado: ${EMAIL} / ${PASSWORD}`)

  // 4. Crear categorías e items
  for (let i = 0; i < MENU.length; i++) {
    const { categoria, items } = MENU[i]

    const { data: cat, error: cErr } = await supabase
      .from('categories')
      .insert({ tenant_id: tenant.id, nombre: categoria, orden: i })
      .select('id')
      .single()

    if (cErr || !cat) {
      console.error(`❌ Error creando categoría "${categoria}":`, cErr?.message)
      continue
    }

    const itemsToInsert = items.map((item, j) => ({
      tenant_id: tenant.id,
      category_id: cat.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio,
      orden: j,
      activo: true,
    }))

    const { error: iErr } = await supabase.from('items').insert(itemsToInsert)

    if (iErr) {
      console.error(`❌ Error insertando items en "${categoria}":`, iErr.message)
    } else {
      console.log(`   📋 ${categoria}: ${items.length} productos`)
    }
  }

  // 5. Resumen
  console.log('\n─────────────────────────────────────────')
  console.log('🎉 Seed completado exitosamente!\n')
  console.log(`  🍽️  Carta pública:  http://localhost:3000/menu/${SLUG}`)
  console.log(`  🔐 Dashboard:      http://localhost:3000/login`)
  console.log(`  📧 Email:          ${EMAIL}`)
  console.log(`  🔑 Contraseña:     ${PASSWORD}`)
  console.log('─────────────────────────────────────────\n')
}

main()
