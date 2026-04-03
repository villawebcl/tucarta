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
      {/* Hero — altura fija, imagen o color como fondo, título siempre superpuesto */}
      <header className="relative h-44 overflow-hidden sm:h-52">
        {/* Fondo: portada o color sólido */}
        {hasPortada ? (
          <Image
            src={tenant.portada_url!}
            alt=""
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ backgroundColor: primario }} />
        )}

        {/* Gradiente inferior para que el texto sea legible sobre la portada */}
        {hasPortada && (
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/65" />
        )}

        {/* Contenido centrado verticalmente en la parte inferior */}
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
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">
            Carta Digital
          </p>
        </div>
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
