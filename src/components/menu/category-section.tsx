import { ItemCard } from './item-card'
import type { CategoryWithItems, LayoutCarta } from '@/types'

interface CategorySectionProps {
  category: CategoryWithItems
  primario?: string
  layout?: LayoutCarta
}

export function CategorySection({ category, primario = '#FF6B35', layout = 'lista' }: CategorySectionProps) {
  if (category.items.length === 0) return null

  return (
    <section aria-labelledby={`cat-title-${category.id}`}>
      {/* Scroll target con offset para la nav sticky */}
      <div id={`category-${category.id}`} className="-mt-4 pt-4 scroll-mt-20 mb-5">
        <h2
          id={`cat-title-${category.id}`}
          className="text-2xl font-extrabold tracking-tight text-gray-900"
        >
          {category.nombre}
        </h2>
        <div
          className="mt-2 h-1 w-10 rounded-full"
          style={{ backgroundColor: primario }}
        />
      </div>

      <div className={layout === 'grilla' ? 'grid grid-cols-2 gap-3' : 'grid gap-3 sm:grid-cols-2'}>
        {category.items.map((item) => (
          <ItemCard key={item.id} {...item} primario={primario} layout={layout} />
        ))}
      </div>
    </section>
  )
}
