import Image from 'next/image'
import { CategorySection } from './category-section'
import { CategoryNav } from './category-nav'
import { FUENTES, type FuenteKey } from '@/lib/constants'
import type { PublicMenu } from '@/types'

interface MenuPublicProps {
  menu: PublicMenu
}

export function MenuPublic({ menu }: MenuPublicProps) {
  const { tenant, categories } = menu
  const { primario, fondo, fuente } = tenant.colores

  // Fuente seleccionada → CSS variable cargada en el root layout
  const fuenteKey = (fuente ?? 'inter') as FuenteKey
  const fontVar = FUENTES[fuenteKey]?.variable ?? FUENTES.inter.variable
  const fontFamily = `var(${fontVar}), sans-serif`

  const hasPortada = !!tenant.portada_url

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: fondo, fontFamily }}
    >
      {/* Hero — con portada como fondo si existe, sino color sólido */}
      <header
        className="relative overflow-hidden"
        style={hasPortada ? undefined : { backgroundColor: primario }}
      >
        {/* Imagen de portada */}
        {hasPortada && (
          <>
            <div className="relative w-full" style={{ aspectRatio: '3/1', minHeight: '160px' }}>
              <Image
                src={tenant.portada_url!}
                alt={`Portada de ${tenant.nombre}`}
                fill
                sizes="100vw"
                priority
                className="object-cover"
              />
            </div>
            {/* Gradiente sobre la portada para que el contenido sea legible */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 70%, ${fondo} 100%)`,
              }}
            />
          </>
        )}

        {/* Nombre y logo — superpuestos sobre la portada o sobre el color sólido */}
        <div
          className={[
            'relative z-10 mx-auto max-w-2xl px-6 text-center',
            hasPortada ? 'absolute bottom-0 left-0 right-0 pb-6' : 'py-10',
          ].join(' ')}
        >
          {tenant.logo_url ? (
            <div className="mx-auto mb-3 h-16 w-16 overflow-hidden rounded-full ring-4 ring-white/40">
              <div className="relative h-full w-full">
                <Image
                  src={tenant.logo_url}
                  alt={`Logo de ${tenant.nombre}`}
                  fill
                  sizes="64px"
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          ) : (
            <div
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold ring-4 ring-white/30"
              style={
                hasPortada
                  ? { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
                  : { backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff' }
              }
            >
              {tenant.nombre.charAt(0).toUpperCase()}
            </div>
          )}

          <h1
            className="text-3xl font-extrabold tracking-tight drop-shadow-sm"
            style={{ color: '#fff' }}
          >
            {tenant.nombre}
          </h1>
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
            Carta Digital
          </p>
        </div>

        {/* Espaciado inferior cuando hay portada para que el contenido superpuesto no se corte */}
        {hasPortada && <div className="h-20" />}
      </header>

      {/* Navegación de categorías — sticky, client component */}
      {categories.length > 1 && (
        <CategoryNav
          categories={categories.map((c) => ({ id: c.id, nombre: c.nombre }))}
          primario={primario}
        />
      )}

      {/* Listado de categorías */}
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
