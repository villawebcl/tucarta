'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface ItemFormValues {
  nombre: string
  descripcion: string
  precio: string
  category_id: string
  activo: boolean
  imagen_url: string | null
}

interface Category {
  id: string
  nombre: string
}

interface ItemFormProps {
  initialValues?: Partial<ItemFormValues>
  categories: Category[]
  /** Si el plan permite imágenes */
  hasImages?: boolean
  onSubmit: (values: ItemFormValues) => Promise<void>
  submitLabel?: string
}

export function ItemForm({
  initialValues,
  categories,
  hasImages = false,
  onSubmit,
  submitLabel = 'Guardar',
}: ItemFormProps) {
  const [values, setValues] = useState<ItemFormValues>({
    nombre: initialValues?.nombre ?? '',
    descripcion: initialValues?.descripcion ?? '',
    precio: initialValues?.precio ?? '',
    category_id: initialValues?.category_id ?? categories[0]?.id ?? '',
    activo: initialValues?.activo ?? true,
    imagen_url: initialValues?.imagen_url ?? null,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof ItemFormValues, string>>>({})
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageError, setImageError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function validate(): boolean {
    const newErrors: Partial<Record<keyof ItemFormValues, string>> = {}

    if (!values.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (values.nombre.length > 100) newErrors.nombre = 'Máximo 100 caracteres'
    if (!values.category_id) newErrors.category_id = 'Selecciona una categoría'

    const precio = Number(values.precio)
    if (!values.precio || isNaN(precio)) newErrors.precio = 'Ingresa un precio válido'
    else if (precio < 0) newErrors.precio = 'El precio no puede ser negativo'
    else if (!Number.isInteger(precio)) newErrors.precio = 'El precio debe ser en pesos enteros'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImageError('')
    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const json = await res.json() as { data?: { url: string }; error?: string }

      if (!res.ok) {
        setImageError(json.error ?? 'Error al subir la imagen')
        return
      }

      setValues((v) => ({ ...v, imagen_url: json.data?.url ?? null }))
    } finally {
      setUploadingImage(false)
      // Limpiar el input para permitir re-seleccionar el mismo archivo
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  function removeImage() {
    setValues((v) => ({ ...v, imagen_url: null }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      await onSubmit(values)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Input
        label="Nombre del producto"
        required
        value={values.nombre}
        onChange={(e) => setValues((v) => ({ ...v, nombre: e.target.value }))}
        error={errors.nombre}
        placeholder="Ej: Empanada de pino"
        maxLength={100}
      />

      <Textarea
        label="Descripción"
        value={values.descripcion}
        onChange={(e) => setValues((v) => ({ ...v, descripcion: e.target.value }))}
        placeholder="Describe el producto..."
        maxLength={500}
      />

      <Input
        label="Precio (CLP)"
        type="number"
        required
        min={0}
        step={1}
        value={values.precio}
        onChange={(e) => setValues((v) => ({ ...v, precio: e.target.value }))}
        error={errors.precio}
        placeholder="Ej: 3500"
      />

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-gray-700">
          Categoría <span className="text-red-500">*</span>
        </label>
        {categories.length === 0 ? (
          <p className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
            No tienes categorías.{' '}
            <a href="/dashboard/categories" className="font-medium underline">
              Crea una primero →
            </a>
          </p>
        ) : (
          <select
            id="category"
            value={values.category_id}
            onChange={(e) => setValues((v) => ({ ...v, category_id: e.target.value }))}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        )}
        {errors.category_id && (
          <p className="text-xs text-red-600">{errors.category_id}</p>
        )}
      </div>

      {/* Imagen — solo visible en planes que lo permiten */}
      <div className="flex flex-col gap-1">
        <span className="text-sm font-medium text-gray-700">Imagen</span>

        {!hasImages ? (
          <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">
            Las imágenes están disponibles desde el{' '}
            <a href="/dashboard/billing" className="font-medium text-brand-500 hover:underline">
              Plan Básico
            </a>
            .
          </p>
        ) : values.imagen_url ? (
          <div className="flex items-center gap-4">
            <div className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
              <Image
                src={values.imagen_url}
                alt="Imagen del producto"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={removeImage}>
              Quitar imagen
            </Button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
              id="imagen-upload"
            />
            <label
              htmlFor="imagen-upload"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-sm text-gray-500 transition hover:border-brand-400 hover:text-brand-500 ${uploadingImage ? 'pointer-events-none opacity-60' : ''}`}
            >
              {uploadingImage ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Subiendo imagen…
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Subir imagen (JPG, PNG o WebP, máx. 2MB)
                </>
              )}
            </label>
            {imageError && <p className="mt-1 text-xs text-red-600">{imageError}</p>}
          </div>
        )}
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={values.activo}
          onChange={(e) => setValues((v) => ({ ...v, activo: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
        />
        Disponible en la carta
      </label>

      <Button type="submit" loading={loading} disabled={uploadingImage} className="w-full">
        {submitLabel}
      </Button>
    </form>
  )
}
