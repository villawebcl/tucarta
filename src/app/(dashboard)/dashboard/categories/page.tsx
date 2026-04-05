'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Badge } from '@/components/ui/badge'

interface Category {
  id: string
  nombre: string
  orden: number
  activo: boolean
}

interface CategoryFormValues {
  nombre: string
  activo: boolean
}

const COMMON_CATEGORY_EXAMPLES = [
  'Entradas',
  'Para tomar',
  'Bebidas',
  'Platos principales',
  'Platos de fondo',
  'Promociones',
  'Combos',
  'Menú del día',
  'Sandwiches',
  'Hamburguesas',
  'Pizzas',
  'Pastas',
  'Ensaladas',
  'Sopas',
  'Acompañamientos',
  'Salsas',
  'Jugos',
  'Cafetería',
  'Postres',
]

function normalizeCategoryName(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState<CategoryFormValues>({ nombre: '', activo: true })
  const [error, setError] = useState('')

  const load = useCallback(async () => {
    const res = await fetch('/api/categories')
    const json = await res.json() as { data?: Category[] }
    setCategories(json.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openCreate() {
    setEditing(null)
    setForm({ nombre: '', activo: true })
    setError('')
    setModalOpen(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setForm({ nombre: cat.nombre, activo: cat.activo })
    setError('')
    setModalOpen(true)
  }

  async function handleSave() {
    if (!form.nombre.trim()) {
      setError('El nombre es requerido')
      return
    }
    setSaving(true)
    setError('')

    try {
      const url = editing ? `/api/categories/${editing.id}` : '/api/categories'
      const method = editing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await res.json() as { error?: string }

      if (!res.ok) {
        setError(json.error ?? 'Error al guardar')
        return
      }

      setModalOpen(false)
      await load()
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta categoría? Se eliminarán también todos sus productos.')) return
    setDeleting(id)
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setDeleting(null)
    await load()
  }

  const normalizedCurrentName = normalizeCategoryName(form.nombre)
  const existingCategoryNames = new Set(
    categories
      .filter((cat) => !editing || cat.id !== editing.id)
      .map((cat) => normalizeCategoryName(cat.nombre))
  )
  const suggestedCategories = COMMON_CATEGORY_EXAMPLES.filter((name) => {
    const normalizedName = normalizeCategoryName(name)

    if (existingCategoryNames.has(normalizedName)) return false
    if (!normalizedCurrentName) return true

    return normalizedName.includes(normalizedCurrentName)
  }).slice(0, 8)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categorías</h1>
          <p className="mt-1 text-sm text-gray-500">
            Organiza tu carta en secciones. Crea las categorías antes de agregar productos.
          </p>
        </div>
        <Button onClick={openCreate}>+ Nueva categoría</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">No tienes categorías aún</p>
          <button
            onClick={openCreate}
            className="mt-3 text-sm font-medium text-brand-500 hover:underline"
          >
            Crea tu primera categoría →
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Nombre</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Orden</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{cat.nombre}</td>
                  <td className="px-6 py-4 text-gray-500">{cat.orden}</td>
                  <td className="px-6 py-4">
                    <Badge variant={cat.activo ? 'success' : 'default'}>
                      {cat.activo ? 'Activa' : 'Oculta'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEdit(cat)}
                        className="text-brand-500 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        disabled={deleting === cat.id}
                        className="text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deleting === cat.id ? 'Eliminando…' : 'Eliminar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar categoría' : 'Nueva categoría'}
      >
        <div className="space-y-4">
          <Input
            label="Nombre"
            required
            value={form.nombre}
            onChange={(e) => setForm((v) => ({ ...v, nombre: e.target.value }))}
            error={error}
            placeholder="Ej: Entradas, Bebidas, Postres"
            maxLength={80}
            autoFocus
          />

          {!editing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-gray-700">Ejemplos frecuentes</p>
                <p className="text-xs text-gray-500">Haz clic para usar uno</p>
              </div>

              {suggestedCategories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {suggestedCategories.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setForm((v) => ({ ...v, nombre: name }))}
                      className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Ya usas las categorías más comunes o no hay coincidencias para lo que escribiste.
                </p>
              )}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => setForm((v) => ({ ...v, activo: e.target.checked }))}
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
            />
            Visible en la carta
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} loading={saving}>
              {editing ? 'Guardar cambios' : 'Crear categoría'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
