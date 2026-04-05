'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ItemForm } from '@/components/dashboard/item-form'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { PLAN_LIMITS, getEffectivePlan } from '@/lib/constants'
import type { PlanType } from '@/types'

interface ItemData {
  nombre: string
  descripcion: string
  precio: string
  category_id: string
  activo: boolean
  imagen_url: string | null
  destacado: boolean
  popular: boolean
}

export default function EditItemPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = params['itemId'] as string
  const isNew = itemId === 'nuevo'

  const [item, setItem] = useState<ItemData | null>(null)
  const [categories, setCategories] = useState<Array<{ id: string; nombre: string }>>([])
  const [plan, setPlan] = useState<PlanType>('free')
  const [trialEndsAt, setTrialEndsAt] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    async function load() {
      const [catsRes, tenantRes] = await Promise.all([
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/tenant').then((r) => r.json()),
      ])

      setCategories((catsRes as { data?: Array<{ id: string; nombre: string }> }).data ?? [])
      const tenantData = (tenantRes as { data?: { plan?: PlanType; trial_ends_at?: string | null } }).data
      setPlan(tenantData?.plan ?? 'free')
      setTrialEndsAt(tenantData?.trial_ends_at ?? null)

      if (!isNew) {
        const itemRes = await fetch(`/api/items/${itemId}`).then((r) => r.json()) as { data?: {
          nombre: string
          descripcion: string | null
          precio: number
          category_id: string
          activo: boolean
          imagen_url: string | null
          destacado: boolean
          popular: boolean
        }}
        if (itemRes?.data) {
          const d = itemRes.data
          setItem({
            nombre: d.nombre,
            descripcion: d.descripcion ?? '',
            precio: String(d.precio),
            category_id: d.category_id,
            activo: d.activo,
            imagen_url: d.imagen_url,
            destacado: d.destacado ?? false,
            popular: d.popular ?? false,
          })
        }
      }
      setLoading(false)
    }

    load()
  }, [itemId, isNew])

  async function handleSubmit(values: ItemData) {
    setSaveError('')
    const payload = { ...values, precio: Number(values.precio) }

    const response = await fetch(isNew ? '/api/items' : `/api/items/${itemId}`, {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (response.ok) {
      router.push('/dashboard/menu')
      router.refresh()
      return
    }

    const json = await response.json() as { error?: string }
    setSaveError(json.error ?? 'Error al guardar el producto')
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    setDeleting(true)
    await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    router.push('/dashboard/menu')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isNew ? 'Agregar producto' : 'Editar producto'}
      </h1>

      {saveError && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {saveError}
        </div>
      )}

      <Card>
        <ItemForm
          initialValues={item ?? undefined}
          categories={categories}
          hasImages={PLAN_LIMITS[getEffectivePlan({ plan, trial_ends_at: trialEndsAt })].hasImages}
          hasUpselling={PLAN_LIMITS[getEffectivePlan({ plan, trial_ends_at: trialEndsAt })].hasUpselling}
          onSubmit={handleSubmit}
          submitLabel={isNew ? 'Agregar producto' : 'Guardar cambios'}
        />
      </Card>

      {!isNew && (
        <Button variant="danger" onClick={handleDelete} loading={deleting} className="w-full">
          Eliminar producto
        </Button>
      )}
    </div>
  )
}
