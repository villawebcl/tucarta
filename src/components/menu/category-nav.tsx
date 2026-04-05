'use client'

import { useEffect, useRef, useState } from 'react'

interface CategoryNavProps {
  categories: Array<{ id: string; nombre: string }>
  primario: string
}

export function CategoryNav({ categories, primario }: CategoryNavProps) {
  const [activeId, setActiveId] = useState<string>(categories[0]?.id ?? '')
  const navRef = useRef<HTMLUListElement>(null)

  // Resalta la categoría visible usando IntersectionObserver
  useEffect(() => {
    if (categories.length === 0) return

    const observers: IntersectionObserver[] = []

    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`)
      if (!el) return

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) setActiveId(cat.id)
        },
        { rootMargin: '-15% 0px -75% 0px' }
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [categories])

  // Centra la píldora activa dentro del nav horizontal
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const active = nav.querySelector<HTMLElement>('[data-active="true"]')
    active?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [activeId])

  return (
    <nav
      aria-label="Categorías del menú"
      className="sticky top-0 z-20 border-b border-black/[0.08] bg-white/95 backdrop-blur-md"
    >
      <div
        className="mx-auto max-w-2xl overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
        style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
      >
        <ul ref={navRef} className="flex gap-1.5 py-3">
          {categories.map((cat) => {
            const isActive = cat.id === activeId
            return (
              <li key={cat.id} className="flex-shrink-0">
                <a
                  href={`#category-${cat.id}`}
                  data-active={isActive}
                  onClick={() => setActiveId(cat.id)}
                  className="block rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 whitespace-nowrap"
                  style={
                    isActive
                      ? { backgroundColor: primario, color: '#fff' }
                      : { color: '#6b7280', backgroundColor: 'transparent' }
                  }
                >
                  {cat.nombre}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
