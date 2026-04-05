/**
 * Seed de datos de demostración para TuCarta.
 *
 * Crea un restaurante de ejemplo con carta completa, imágenes y personalización:
 *   Email:      demo@tucarta.cl
 *   Contraseña: Demo1234!
 *   Carta:      http://localhost:3000/menu/la-terraza-demo
 *
 * Uso:
 *   npx tsx scripts/seed-demo.ts
 *
 * Requiere en el entorno:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
// Cargar .env.local manualmente (sin dep externa)
import { readFileSync } from 'fs'
try {
  const env = readFileSync('.env.local', 'utf-8')
  for (const line of env.split('\n')) {
    const match = line.match(/^([^#=\s][^=]*)=(.*)$/)
    if (match?.[1] && match?.[2]) process.env[match[1].trim()] ??= match[2].trim().replace(/^['"]|['"]$/g, '')
  }
} catch { /* archivo no existe, se asume que las vars ya están en el entorno */ }

// ─── Config ──────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// ─── Helpers de imágenes ──────────────────────────────────────────────────────
// Usa Picsum Photos con seed fijo → misma imagen siempre, sin API key

function img(seed: string, w = 800, h = 600) {
  return `https://picsum.photos/seed/${seed}/${w}/${h}`
}

// ─── Datos del restaurante demo ───────────────────────────────────────────────

const DEMO_SLUG = 'la-terraza-demo'
const DEMO_EMAIL = 'demo@tucarta.cl'
const DEMO_PASSWORD = 'Demo1234!'

const TENANT = {
  slug: DEMO_SLUG,
  nombre: 'La Terraza',
  descripcion: 'Cocina chilena de autor · Vista al jardín · Desde 1994',
  plan: 'pro' as const,
  whatsapp: '+56912345678',
  portada_url: img('restaurant-terrace', 1200, 400),
  colores: {
    primario: '#2D6A4F',
    fondo: '#F8F5F0',
    fuente: 'playfair',
    layout: 'lista',
  },
  redes_sociales: {
    instagram: 'laterrazachile',
    telefono: '+56 2 2345 6789',
    direccion: 'Av. El Bosque Norte 180, Las Condes, Santiago',
  },
  trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
}

// ─── Categorías ───────────────────────────────────────────────────────────────

const CATEGORIES = [
  { nombre: 'Entradas',             orden: 1 },
  { nombre: 'Sopas y Cremas',       orden: 2 },
  { nombre: 'Platos Principales',   orden: 3 },
  { nombre: 'Pastas y Arroces',     orden: 4 },
  { nombre: 'Postres',              orden: 5 },
  { nombre: 'Bebidas',              orden: 6 },
]

// ─── Ítems por categoría ──────────────────────────────────────────────────────

type ItemDef = {
  nombre: string
  descripcion: string
  precio: number
  orden: number
  imagen_url?: string
  destacado?: boolean
  popular?: boolean
}

const ITEMS: Record<string, ItemDef[]> = {

  'Entradas': [
    {
      nombre: 'Ceviche de Reineta',
      descripcion: 'Reineta fresca marinada en limón de pica, cebolla morada, cilantro y ají amarillo. Con choclo y camote.',
      precio: 8900,
      orden: 1,
      imagen_url: img('ceviche-fish', 800, 600),
      destacado: true,
      popular: true,
    },
    {
      nombre: 'Empanadas de Queso (3 un.)',
      descripcion: 'Empanadas fritas rellenas con queso mantecoso derretido. Servidas con merkén y pebre casero.',
      precio: 5900,
      orden: 2,
      imagen_url: img('empanadas-cheese', 800, 600),
      popular: true,
    },
    {
      nombre: 'Tabla de Quesos y Fiambres',
      descripcion: 'Selección de quesos nacionales, jamón serrano, longaniza artesanal, aceitunas y tostadas de masa madre.',
      precio: 12900,
      orden: 3,
      imagen_url: img('cheese-board', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Sopaipillas con Pebre',
      descripcion: 'Sopaipillas caseras crujientes con pebre de tomate, cilantro y ají verde.',
      precio: 3900,
      orden: 4,
      imagen_url: img('sopaipillas-bread', 800, 600),
    },
    {
      nombre: 'Causa de Atún y Palta',
      descripcion: 'Papa amarilla sazonada con limón y ají amarillo, rellena de atún en mayonesa casera y palta fresca.',
      precio: 7500,
      orden: 5,
      imagen_url: img('causa-peruvian', 800, 600),
    },
    {
      nombre: 'Carpaccio de Vacuno',
      descripcion: 'Láminas finas de filete con rúcula, alcaparras, parmesano y vinagreta de mostaza Dijon.',
      precio: 10900,
      orden: 6,
      imagen_url: img('beef-carpaccio', 800, 600),
      destacado: true,
    },
  ],

  'Sopas y Cremas': [
    {
      nombre: 'Cazuela de Vacuno',
      descripcion: 'Cazuela tradicional con plateada, papa, choclo, zapallo y arroz. Cocida a fuego lento por 4 horas.',
      precio: 11900,
      orden: 1,
      imagen_url: img('beef-stew', 800, 600),
      popular: true,
    },
    {
      nombre: 'Crema de Zapallo',
      descripcion: 'Crema de zapallo camote con jengibre, leche de coco y semillas de zapallo tostadas.',
      precio: 6900,
      orden: 2,
      imagen_url: img('pumpkin-soup', 800, 600),
    },
    {
      nombre: 'Sopa de Mariscos',
      descripcion: 'Caldo de mariscos con choritos, almejas, camarones y cebolla, al estilo del norte chico.',
      precio: 9900,
      orden: 3,
      imagen_url: img('seafood-soup', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Caldillo de Congrio',
      descripcion: 'El clásico chileno inmortalizado por Neruda. Congrio dorado con papas, tomate, cebolla y perejil.',
      precio: 13900,
      orden: 4,
      imagen_url: img('fish-broth', 800, 600),
      popular: true,
      destacado: true,
    },
  ],

  'Platos Principales': [
    {
      nombre: 'Lomo a lo Pobre',
      descripcion: 'Medallón de lomo liso a la plancha con papas fritas, huevo frito y cebolla caramelizada. El clásico de la casa.',
      precio: 16900,
      orden: 1,
      imagen_url: img('beef-steak-plate', 800, 600),
      destacado: true,
      popular: true,
    },
    {
      nombre: 'Salmón a la Mantequilla',
      descripcion: 'Filete de salmón atlántico en salsa de mantequilla con alcaparras, acompañado de puré rústico y ensalada verde.',
      precio: 18500,
      orden: 2,
      imagen_url: img('salmon-butter', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Pastel de Choclo',
      descripcion: 'Clásico pastel con pino de carne, pollo, aceitunas y huevo duro. Cocinado en paila de greda.',
      precio: 11900,
      orden: 3,
      imagen_url: img('corn-pie-chilean', 800, 600),
      popular: true,
    },
    {
      nombre: 'Pollo al Ajillo',
      descripcion: 'Presas de pollo doradas con ajo, pimentón, vino blanco y perejil fresco. Acompañado de arroz y ensalada.',
      precio: 12500,
      orden: 4,
      imagen_url: img('garlic-chicken', 800, 600),
    },
    {
      nombre: 'Osobuco Braseado',
      descripcion: 'Osobuco de vacuno cocinado 6 horas con vino tinto, verduras y hierbas. Servido con gnocchi de papa.',
      precio: 21900,
      orden: 5,
      imagen_url: img('braised-ossobuco', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Hamburguesa La Terraza',
      descripcion: 'Medallón 200g de vacuno con cheddar, cebolla caramelizada, tomate, lechuga y salsa secreta. Con papas fritas.',
      precio: 10900,
      orden: 6,
      imagen_url: img('burger-gourmet', 800, 600),
      popular: true,
    },
    {
      nombre: 'Pechuga Rellena',
      descripcion: 'Pechuga de pollo rellena con espinaca y queso de cabra, en salsa de champiñones al vino blanco.',
      precio: 14500,
      orden: 7,
      imagen_url: img('stuffed-chicken', 800, 600),
    },
  ],

  'Pastas y Arroces': [
    {
      nombre: 'Pasta al Pesto de Albahaca',
      descripcion: 'Penne con pesto casero de albahaca fresca, piñones, parmesano y aceite de oliva virgen extra.',
      precio: 9900,
      orden: 1,
      imagen_url: img('pasta-pesto', 800, 600),
      popular: true,
    },
    {
      nombre: 'Fettuccine con Mariscos',
      descripcion: 'Fettuccine fresco con camarones, choritos y calamar en salsa bisque de mariscos y crema.',
      precio: 14900,
      orden: 2,
      imagen_url: img('seafood-pasta', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Risotto de Champiñones',
      descripcion: 'Arroz arborio cremoso con mix de champiñones silvestres, parmesano y aceite de trufa.',
      precio: 12900,
      orden: 3,
      imagen_url: img('mushroom-risotto', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Lasaña de la Casa',
      descripcion: 'Lasaña con capas de pasta fresca, ragú de vacuno, bechamel artesanal y queso gratinado.',
      precio: 11500,
      orden: 4,
      imagen_url: img('lasagna-baked', 800, 600),
      popular: true,
    },
  ],

  'Postres': [
    {
      nombre: 'Leche Asada',
      descripcion: 'Postre tradicional chileno horneado a baño maría, con caramelo artesanal y canela.',
      precio: 4500,
      orden: 1,
      imagen_url: img('leche-asada-caramel', 800, 600),
      popular: true,
    },
    {
      nombre: 'Kuchen de Berries',
      descripcion: 'Torta alemana con masa crocante, crema pastelera y cobertura de frutillas, arándanos y frambuesas.',
      precio: 5500,
      orden: 2,
      imagen_url: img('berry-cake', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Brownie con Helado',
      descripcion: 'Brownie tibio de chocolate amargo con helado de vainilla de Madagascar y salsa de caramelo salado.',
      precio: 6500,
      orden: 3,
      imagen_url: img('brownie-icecream', 800, 600),
      destacado: true,
      popular: true,
    },
    {
      nombre: 'Crème Brûlée',
      descripcion: 'Crema de vainilla con costra de azúcar quemada al momento. Servida con frutas de temporada.',
      precio: 5900,
      orden: 4,
      imagen_url: img('creme-brulee', 800, 600),
    },
    {
      nombre: 'Cheesecake de Maracuyá',
      descripcion: 'Cheesecake cremoso con base de galleta y coulis de maracuyá fresco.',
      precio: 5500,
      orden: 5,
      imagen_url: img('cheesecake-passion', 800, 600),
      popular: true,
    },
  ],

  'Bebidas': [
    {
      nombre: 'Limonada Natural',
      descripcion: 'Limonada exprimida al momento con hojas de menta y azúcar de caña. Sin gas.',
      precio: 2900,
      orden: 1,
      imagen_url: img('lemonade-mint', 800, 600),
      popular: true,
    },
    {
      nombre: 'Agua Mineral (500ml)',
      descripcion: 'Agua mineral con o sin gas.',
      precio: 1500,
      orden: 2,
    },
    {
      nombre: 'Jugos Naturales',
      descripcion: 'Exprimido de naranja, maracuyá o sandía. Pregunta por la fruta del día.',
      precio: 3200,
      orden: 3,
      imagen_url: img('fresh-juice', 800, 600),
    },
    {
      nombre: 'Vino de la Casa (copa)',
      descripcion: 'Cabernet Sauvignon o Chardonnay seleccionado por nuestra sommelier.',
      precio: 4900,
      orden: 4,
      imagen_url: img('wine-glass', 800, 600),
      destacado: true,
    },
    {
      nombre: 'Cerveza Artesanal',
      descripcion: 'Rubia, roja o stout de productores locales. Pregunta por la selección del día.',
      precio: 4200,
      orden: 5,
      imagen_url: img('craft-beer', 800, 600),
      popular: true,
    },
    {
      nombre: 'Café de Especialidad',
      descripcion: 'Espresso, americano, cappuccino o flat white. Granos de origen único tostados en Santiago.',
      precio: 2500,
      orden: 6,
      imagen_url: img('specialty-coffee', 800, 600),
    },
    {
      nombre: 'Cóctel de la Casa',
      descripcion: 'Pisco sour clásico chileno o el trago del día según temporada. Pregunta al mesero.',
      precio: 6900,
      orden: 7,
      imagen_url: img('cocktail-sour', 800, 600),
      destacado: true,
    },
  ],
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Iniciando seed de demostración...\n')

  // 1. Verificar si ya existe
  const { data: existing } = await supabase
    .from('tenants')
    .select('id, slug')
    .eq('slug', DEMO_SLUG)
    .single()

  if (existing) {
    console.log(`⚠️  El restaurante "${DEMO_SLUG}" ya existe (id: ${existing.id}).`)
    console.log('   Elimínalo manualmente en Supabase si quieres recrearlo.')
    process.exit(0)
  }

  // 2. Crear tenant
  console.log(`📍 Creando tenant: ${TENANT.nombre} (${DEMO_SLUG})`)
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert(TENANT)
    .select('id')
    .single()

  if (tenantError || !tenant) {
    console.error('❌ Error creando tenant:', tenantError?.message)
    process.exit(1)
  }
  console.log(`   ✅ Tenant creado: ${tenant.id}`)

  // 3. Crear usuario owner
  console.log(`👤 Creando usuario: ${DEMO_EMAIL}`)
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({
      tenant_id: tenant.id,
      email: DEMO_EMAIL,
      password_hash: passwordHash,
      role: 'owner',
    })
    .select('id')
    .single()

  if (userError || !user) {
    console.error('❌ Error creando usuario:', userError?.message)
    await supabase.from('tenants').delete().eq('id', tenant.id)
    process.exit(1)
  }
  console.log(`   ✅ Usuario creado: ${user.id}`)

  // 4. Crear categorías
  console.log('\n📂 Creando categorías...')
  const categoryIds: Record<string, string> = {}

  for (const cat of CATEGORIES) {
    const { data: category, error: catError } = await supabase
      .from('categories')
      .insert({ tenant_id: tenant.id, ...cat })
      .select('id, nombre')
      .single()

    if (catError || !category) {
      console.error(`❌ Error creando categoría "${cat.nombre}":`, catError?.message)
      continue
    }

    categoryIds[category.nombre] = category.id
    console.log(`   ✅ ${category.nombre}`)
  }

  // 5. Crear ítems
  console.log('\n🍽️  Creando productos...')
  let totalItems = 0
  let totalImgs = 0

  for (const [catNombre, items] of Object.entries(ITEMS)) {
    const categoryId = categoryIds[catNombre]
    if (!categoryId) {
      console.warn(`   ⚠️  Categoría "${catNombre}" no encontrada, saltando.`)
      continue
    }

    for (const item of items) {
      const { error: itemError } = await supabase.from('items').insert({
        tenant_id: tenant.id,
        category_id: categoryId,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        orden: item.orden,
        imagen_url: item.imagen_url ?? null,
        destacado: item.destacado ?? false,
        popular: item.popular ?? false,
        activo: true,
      })

      if (itemError) {
        console.error(`   ❌ Error creando "${item.nombre}":`, itemError.message)
      } else {
        totalItems++
        if (item.imagen_url) totalImgs++
      }
    }

    console.log(`   ✅ ${items.length} productos en "${catNombre}"`)
  }

  // 6. Resumen
  const totalCats = Object.keys(categoryIds).length
  console.log('\n' + '─'.repeat(52))
  console.log('✅ Seed completado!\n')
  console.log(`  🏠 Restaurante  : ${TENANT.nombre}`)
  console.log(`  🔗 Carta pública: http://localhost:3000/menu/${DEMO_SLUG}`)
  console.log(`  📧 Email        : ${DEMO_EMAIL}`)
  console.log(`  🔑 Contraseña   : ${DEMO_PASSWORD}`)
  console.log(`  📦 Plan         : Pro (trial 30 días)`)
  console.log(`  📂 Categorías   : ${totalCats}`)
  console.log(`  🍽️  Productos    : ${totalItems} (${totalImgs} con imagen)`)
  console.log('─'.repeat(52))
}

seed().catch((err) => {
  console.error('Error inesperado:', err)
  process.exit(1)
})
