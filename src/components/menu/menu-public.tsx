import Image from 'next/image'
import { CategorySection } from './category-section'
import { CategoryNav } from './category-nav'
import { FUENTES, type FuenteKey } from '@/lib/constants'
import type { LayoutCarta, PublicMenu } from '@/types'

interface MenuPublicProps {
  menu: PublicMenu
}

export function MenuPublic({ menu }: MenuPublicProps) {
  const { tenant, categories } = menu
  const { primario, fondo, fuente, layout } = tenant.colores

  const fuenteKey = (fuente ?? 'inter') as FuenteKey
  const fontVar = FUENTES[fuenteKey]?.variable ?? FUENTES.inter.variable
  const fontFamily = `var(${fontVar}), sans-serif`
  const cartaLayout: LayoutCarta = layout ?? 'lista'

  const hasPortada = !!tenant.portada_url
  const redes = tenant.redes_sociales

  return (
    <main className="min-h-screen" style={{ backgroundColor: fondo, fontFamily }}>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <header className="relative h-44 overflow-hidden sm:h-52">
        {hasPortada ? (
          <Image src={tenant.portada_url!} alt="" fill sizes="100vw" priority className="object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: primario }} />
        )}

        {hasPortada && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/65" />
        )}

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center pb-5 text-center">
          {tenant.logo_url ? (
            <div className="mb-2 h-12 w-12 overflow-hidden rounded-full ring-2 ring-white/50">
              <div className="relative h-full w-full">
                <Image
                  src={tenant.logo_url}
                  alt={`Logo de ${tenant.nombre}`}
                  fill
                  sizes="48px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div
              className="mb-2 flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ring-2 ring-white/40"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              {tenant.nombre.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow">
            {tenant.nombre}
          </h1>

          {tenant.descripcion ? (
            <p className="mt-1 max-w-xs px-4 text-xs leading-snug text-white/80 drop-shadow">
              {tenant.descripcion}
            </p>
          ) : (
            <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
              Carta Digital
            </p>
          )}
        </div>
      </header>

      {/* ── Navegación de categorías ───────────────────────────────── */}
      {categories.length > 1 && (
        <CategoryNav
          categories={categories.map((c) => ({ id: c.id, nombre: c.nombre }))}
          primario={primario}
        />
      )}

      {/* ── Productos ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl space-y-12 px-4 py-8">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="text-5xl">🍽️</span>
            <p className="text-gray-500">Este restaurante aún no tiene productos en su carta.</p>
          </div>
        ) : (
          categories.map((category) => (
            <CategorySection
              key={category.id}
              category={category}
              primario={primario}
              layout={cartaLayout}
            />
          ))
        )}
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-black/5 px-4 py-8 text-center">
        {(redes?.instagram || redes?.telefono || redes?.direccion) && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-500">
            {redes.instagram && (
              <a
                href={`https://instagram.com/${redes.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-gray-700"
              >
                <InstagramIcon className="h-4 w-4" />
                @{redes.instagram}
              </a>
            )}
            {redes.telefono && (
              <a
                href={`tel:${redes.telefono.replace(/\s/g, '')}`}
                className="flex items-center gap-1.5 hover:text-gray-700"
              >
                <PhoneIcon className="h-4 w-4" />
                {redes.telefono}
              </a>
            )}
            {redes.direccion && (
              <span className="flex items-center gap-1.5">
                <PinIcon className="h-4 w-4" />
                {redes.direccion}
              </span>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400">
          Carta digital creada con{' '}
          <a
            href={process.env.NEXT_PUBLIC_APP_URL}
            className="font-medium hover:underline"
            style={{ color: primario }}
          >
            TuCarta
          </a>
        </p>
      </footer>
    </main>
  )
}

// ── Íconos inline (evita dep extra) ──────────────────────────────────────────

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 12a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3 1.18h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.09 9a16 16 0 0 0 7.91 7.91l1.18-1.18a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}

function PinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
