import { ItemCard } from './item-card'
import type { CategoryWithItems } from '@/types'

interface CategorySectionProps {
  category: CategoryWithItems
  primario?: string
}

export function CategorySection({ category, primario = '#FF6B35' }: CategorySectionProps) {
  if (category.items.length === 0) return null

  return (
    <section aria-labelledby={`cat-title-${category.id}`}>
      {/* Scroll target con offset para la nav sticky */}
      <div id={`category-${category.id}`} className="-mt-4 pt-4 scroll-mt-16 mb-5">
        <h2
          id={`cat-title-${category.id}`}
          className="text-2xl font-extrabold tracking-tight text-gray-900"
        >
          {category.nombre}
        </h2>
        {/* Línea decorativa con el color del restaurante */}
        <div
          className="mt-2 h-1 w-10 rounded-full"
          style={{ backgroundColor: primario }}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {category.items.map((item) => (
          <ItemCard key={item.id} {...item} primario={primario} />
        ))}
      </div>
    </section>
  )
}
