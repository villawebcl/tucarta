import Image from 'next/image'
import { formatCLP } from '@/lib/utils/format'
import type { LayoutCarta } from '@/types'

interface ItemCardProps {
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  destacado?: boolean
  popular?: boolean
  primario?: string
  layout?: LayoutCarta
}

export function ItemCard({
  nombre,
  descripcion,
  precio,
  imagen_url,
  destacado = false,
  popular = false,
  primario = '#FF6B35',
  layout = 'lista',
}: ItemCardProps) {
  if (layout === 'grilla') {
    return <ItemCardGrilla {...{ nombre, descripcion, precio, imagen_url, destacado, popular, primario }} />
  }
  return <ItemCardLista {...{ nombre, descripcion, precio, imagen_url, destacado, popular, primario }} />
}

// ── Variante lista (horizontal) ───────────────────────────────────────────────

function ItemCardLista({ nombre, descripcion, precio, imagen_url, destacado, popular, primario }: Omit<ItemCardProps, 'layout'>) {
  return (
    <article className="group relative flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="min-w-0">
          <Badges destacado={destacado ?? false} popular={popular ?? false} />
          <h3 className="font-semibold leading-snug text-gray-900">{nombre}</h3>
          {descripcion && (
            <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">{descripcion}</p>
          )}
        </div>
        <p className="text-base font-bold" style={{ color: primario }}>{formatCLP(precio)}</p>
      </div>

      {imagen_url ? (
        <div className="relative w-28 flex-shrink-0 overflow-hidden sm:w-32">
          <Image
            src={imagen_url}
            alt={nombre}
            fill
            sizes="(max-width: 640px) 112px, 128px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      ) : (
        <div
          className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
          style={{ backgroundColor: primario, opacity: 0.5 }}
        />
      )}
    </article>
  )
}

// ── Variante grilla (vertical) ────────────────────────────────────────────────

function ItemCardGrilla({ nombre, descripcion, precio, imagen_url, destacado, popular, primario }: Omit<ItemCardProps, 'layout'>) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      {/* Imagen o placeholder de color */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {imagen_url ? (
          <Image
            src={imagen_url}
            alt={nombre}
            fill
            sizes="(max-width: 672px) 50vw, 336px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="h-full w-full opacity-20"
            style={{ backgroundColor: primario }}
          />
        )}
      </div>

      {/* Contenido */}
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div>
          <Badges destacado={destacado ?? false} popular={popular ?? false} />
          <h3 className="font-semibold leading-snug text-gray-900 line-clamp-2">{nombre}</h3>
          {descripcion && (
            <p className="mt-0.5 text-xs leading-relaxed text-gray-500 line-clamp-2">{descripcion}</p>
          )}
        </div>
        <p className="mt-auto text-sm font-bold" style={{ color: primario }}>{formatCLP(precio)}</p>
      </div>
    </article>
  )
}

// ── Badges compartidos ────────────────────────────────────────────────────────

function Badges({ destacado, popular }: { destacado: boolean; popular: boolean }) {
  if (!destacado && !popular) return null
  return (
    <div className="mb-1.5 flex flex-wrap gap-1">
      {destacado && (
        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
          Recomendado
        </span>
      )}
      {popular && (
        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-600 ring-1 ring-rose-200">
          El más pedido
        </span>
      )}
    </div>
  )
}
