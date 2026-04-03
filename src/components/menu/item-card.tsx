import Image from 'next/image'
import { formatCLP } from '@/lib/utils/format'

interface ItemCardProps {
  nombre: string
  descripcion: string | null
  precio: number
  imagen_url: string | null
  primario?: string
}

export function ItemCard({ nombre, descripcion, precio, imagen_url, primario = '#FF6B35' }: ItemCardProps) {
  return (
    <article className="group relative flex overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      {/* Contenido textual */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-3 p-4">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug text-gray-900">{nombre}</h3>
          {descripcion && (
            <p className="mt-1 text-sm leading-relaxed text-gray-500 line-clamp-2">
              {descripcion}
            </p>
          )}
        </div>

        {/* Precio */}
        <p className="text-base font-bold" style={{ color: primario }}>
          {formatCLP(precio)}
        </p>
      </div>

      {/* Imagen a la derecha */}
      {imagen_url && (
        <div className="relative w-28 flex-shrink-0 overflow-hidden sm:w-32">
          <Image
            src={imagen_url}
            alt={nombre}
            fill
            sizes="(max-width: 640px) 112px, 128px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}

      {/* Borde lateral de color cuando no hay imagen */}
      {!imagen_url && (
        <div
          className="absolute left-0 top-0 h-full w-1 rounded-l-2xl"
          style={{ backgroundColor: primario, opacity: 0.5 }}
        />
      )}
    </article>
  )
}
