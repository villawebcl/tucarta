import Image from 'next/image'
import { CategorySection } from './category-section'
import { CategoryNav } from './category-nav'
import type { PublicMenu } from '@/types'

interface MenuPublicProps {
  menu: PublicMenu
}

export function MenuPublic({ menu }: MenuPublicProps) {
  const { tenant, categories } = menu
  const colores = tenant.colores as { primario: string; fondo: string }
  const primario = colores.primario ?? '#FF6B35'
  const fondo = colores.fondo ?? '#FFFFFF'

  return (
    <main className="min-h-screen" style={{ backgroundColor: fondo }}>

      {/* Hero del restaurante */}
      <header className="relative overflow-hidden" style={{ backgroundColor: primario }}>
        {/* Radial overlay para dar profundidad */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: [
              'radial-gradient(ellipse at 15% 85%, rgba(255,255,255,0.15) 0%, transparent 55%)',
              'radial-gradient(ellipse at 85% 15%, rgba(0,0,0,0.1) 0%, transparent 55%)',
            ].join(', '),
          }}
        />

        <div className="relative mx-auto max-w-2xl px-6 py-10 text-center">
          {tenant.logo_url ? (
            <div className="mx-auto mb-5 h-20 w-20 overflow-hidden rounded-full ring-4 ring-white/30">
              <div className="relative h-full w-full">
                <Image
                  src={tenant.logo_url}
                  alt={`Logo de ${tenant.nombre}`}
                  fill
                  sizes="80px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl font-bold ring-4 ring-white/30"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            >
              {tenant.nombre.charAt(0).toUpperCase()}
            </div>
          )}

          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {tenant.nombre}
          </h1>
          <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Carta Digital
          </p>
        </div>
      </header>

      {/* Navegación de categorías — client component con scroll activo */}
      {categories.length > 1 && (
        <CategoryNav
          categories={categories.map((c) => ({ id: c.id, nombre: c.nombre }))}
          primario={primario}
        />
      )}

      {/* Listado de categorías e items */}
      <div className="mx-auto max-w-2xl space-y-12 px-4 py-8">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <span className="text-5xl">🍽️</span>
            <p className="text-gray-500">Este restaurante aún no tiene productos en su carta.</p>
          </div>
        ) : (
          categories.map((category) => (
            <CategorySection key={category.id} category={category} primario={primario} />
          ))
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-black/5 py-8 text-center">
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
