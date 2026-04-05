'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FUENTES, type FuenteKey } from '@/lib/constants'
import type { LayoutCarta, RedesSociales, Tenant } from '@/types'

interface SettingsFormProps {
  tenant: Tenant
}

type Colores = { primario: string; fondo: string; fuente?: string; layout?: LayoutCarta }

export function SettingsForm({ tenant }: SettingsFormProps) {
  const coloresInit = (tenant.colores ?? {}) as Colores
  const redesInit = (tenant.redes_sociales ?? {}) as RedesSociales

  const [primario, setPrimario] = useState(coloresInit.primario ?? '#FF6B35')
  const [fondo, setFondo] = useState(coloresInit.fondo ?? '#FFFFFF')
  const [fuente, setFuente] = useState<FuenteKey>((coloresInit.fuente as FuenteKey) ?? 'inter')
  const [layout, setLayout] = useState<LayoutCarta>(coloresInit.layout ?? 'lista')
  const [portadaUrl, setPortadaUrl] = useState<string | null>(tenant.portada_url ?? null)
  const [descripcion, setDescripcion] = useState(tenant.descripcion ?? '')
  const [instagram, setInstagram] = useState(redesInit.instagram ?? '')
  const [telefono, setTelefono] = useState(redesInit.telefono ?? '')
  const [direccion, setDireccion] = useState(redesInit.direccion ?? '')

  const [saving, setSaving] = useState(false)
  const [uploadingPortada, setUploadingPortada] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const portadaRef = useRef<HTMLInputElement>(null)

  // ── Upload portada ────────────────────────────────────────────────────────
  async function handlePortadaChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingPortada(true)
    setErrorMsg('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('type', 'portada')

      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json() as { data?: { url: string }; error?: string }

      if (!res.ok || !json.data) {
        setErrorMsg(json.error ?? 'Error al subir la portada')
        return
      }
      setPortadaUrl(json.data.url)
    } finally {
      setUploadingPortada(false)
      if (portadaRef.current) portadaRef.current.value = ''
    }
  }

  // ── Guardar configuración ─────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const redes: RedesSociales = {}
      if (instagram.trim()) redes.instagram = instagram.trim()
      if (telefono.trim()) redes.telefono = telefono.trim()
      if (direccion.trim()) redes.direccion = direccion.trim()

      const res = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: descripcion.trim() || null,
          portada_url: portadaUrl,
          colores: { primario, fondo, fuente, layout },
          redes_sociales: Object.keys(redes).length > 0 ? redes : null,
        }),
      })
      const json = await res.json() as { error?: string }

      if (!res.ok) {
        setErrorMsg(json.error ?? 'Error al guardar')
        return
      }
      setSuccessMsg('¡Cambios guardados! Refresca tu carta para verlos.')
    } finally {
      setSaving(false)
    }
  }

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">

      {/* ── Descripción ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Descripción del negocio</h2>
        <p className="mb-4 text-sm text-gray-500">
          Aparece bajo el nombre en la carta. Máximo 200 caracteres.
        </p>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          maxLength={200}
          rows={2}
          placeholder="Ej: Cocina italiana desde 1985 · Delivery hasta las 2 AM"
          className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-right text-xs text-gray-400">{descripcion.length}/200</p>
      </section>

      {/* ── Portada ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Imagen de portada</h2>
        <p className="mb-4 text-sm text-gray-500">
          Aparece como fondo del encabezado de tu carta. Recomendado: 1200 × 400 px.
        </p>

        <div
          className="relative mb-4 w-full overflow-hidden rounded-xl bg-gray-100"
          style={{ aspectRatio: '3/1' }}
        >
          {portadaUrl ? (
            <Image
              src={portadaUrl}
              alt="Portada"
              fill
              sizes="(max-width: 672px) 100vw, 672px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-gray-400">
              Sin portada — se usará el color principal
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <input
            ref={portadaRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handlePortadaChange}
          />
          <Button
            variant="secondary"
            disabled={uploadingPortada}
            onClick={() => portadaRef.current?.click()}
          >
            {uploadingPortada ? 'Subiendo…' : portadaUrl ? 'Cambiar portada' : 'Subir portada'}
          </Button>
          {portadaUrl && (
            <Button
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700"
              onClick={() => setPortadaUrl(null)}
            >
              Quitar portada
            </Button>
          )}
        </div>
      </section>

      {/* ── Colores ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Colores</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <ColorPicker
            label="Color principal"
            hint="Botones, precios y acentos"
            value={primario}
            onChange={setPrimario}
          />
          <ColorPicker
            label="Color de fondo"
            hint="Fondo de la carta"
            value={fondo}
            onChange={setFondo}
          />
        </div>

        {/* Preview mini de la carta */}
        <div className="mt-5 overflow-hidden rounded-xl border border-gray-200" style={{ backgroundColor: fondo }}>
          <div className="px-4 py-3" style={{ backgroundColor: primario }}>
            <p className="text-sm font-bold text-white">Vista previa — {tenant.nombre}</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-gray-800">Plato de ejemplo</p>
            <p className="text-sm font-bold" style={{ color: primario }}>$8.900</p>
          </div>
        </div>
      </section>

      {/* ── Fuente ────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-900">Tipografía</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(Object.entries(FUENTES) as [FuenteKey, typeof FUENTES[FuenteKey]][]).map(([key, meta]) => {
            const isActive = fuente === key
            return (
              <button
                key={key}
                onClick={() => setFuente(key)}
                className="flex flex-col items-start gap-1 rounded-xl border-2 p-4 text-left transition-all"
                style={{
                  borderColor: isActive ? primario : '#e5e7eb',
                  backgroundColor: isActive ? `${primario}0d` : '#fff',
                  fontFamily: `var(--font-${key}), sans-serif`,
                }}
              >
                <span
                  className="text-xl font-bold leading-none text-gray-900"
                  style={{ fontFamily: `var(--font-${key}), sans-serif` }}
                >
                  Hola
                </span>
                <span className="text-sm font-medium text-gray-700">{meta.nombre}</span>
                <span className="text-xs text-gray-400">{meta.descripcion}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ── Layout ────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Disposición de productos</h2>
        <p className="mb-4 text-sm text-gray-500">
          Elige cómo se muestran los productos en tu carta.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <LayoutOption
            value="lista"
            current={layout}
            primario={primario}
            onClick={() => setLayout('lista')}
            label="Lista"
            descripcion="Texto a la izquierda, imagen a la derecha"
            preview={<LayoutPreviewLista primario={primario} />}
          />
          <LayoutOption
            value="grilla"
            current={layout}
            primario={primario}
            onClick={() => setLayout('grilla')}
            label="Grilla"
            descripcion="Imagen arriba, texto abajo — ideal para fotos"
            preview={<LayoutPreviewGrilla primario={primario} />}
          />
        </div>
      </section>

      {/* ── Redes sociales ────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Contacto e información</h2>
        <p className="mb-4 text-sm text-gray-500">
          Se muestra en el pie de tu carta. Deja vacío lo que no quieras mostrar.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Instagram</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">@</span>
              <Input
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace(/^@/, ''))}
                placeholder="mi_restaurante"
                maxLength={50}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">Teléfono</label>
            <Input
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              placeholder="+56 9 1234 5678"
              maxLength={20}
              type="tel"
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium text-gray-700">Dirección</label>
            <Input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Av. Providencia 1234, Santiago"
              maxLength={150}
            />
          </div>
        </div>
      </section>

      {/* ── Acciones ──────────────────────────────────────────────── */}
      {errorMsg && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{errorMsg}</p>
      )}
      {successMsg && (
        <p className="rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">{successMsg}</p>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving || uploadingPortada}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}

// ── Subcomponente: selector de color ──────────────────────────────────────────

interface ColorPickerProps {
  label: string
  hint: string
  value: string
  onChange: (v: string) => void
}

function ColorPicker({ label, hint, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <p className="text-xs text-gray-400">{hint}</p>
      <div className="flex items-center gap-3">
        <label className="relative h-10 w-10 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-300 shadow-sm">
          <div className="h-full w-full" style={{ backgroundColor: value }} />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        <Input
          value={value}
          onChange={(e) => {
            const v = e.target.value
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v)
          }}
          className="w-28 font-mono uppercase"
          maxLength={7}
        />
      </div>
    </div>
  )
}

// ── Subcomponente: opción de layout ──────────────────────────────────────────

interface LayoutOptionProps {
  value: LayoutCarta
  current: LayoutCarta
  primario: string
  onClick: () => void
  label: string
  descripcion: string
  preview: React.ReactNode
}

function LayoutOption({ value, current, primario, onClick, label, descripcion, preview }: LayoutOptionProps) {
  const isActive = current === value
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-3 rounded-xl border-2 p-4 text-left transition-all"
      style={{
        borderColor: isActive ? primario : '#e5e7eb',
        backgroundColor: isActive ? `${primario}0d` : '#fff',
      }}
    >
      <div className="w-full overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
        {preview}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{descripcion}</p>
      </div>
    </button>
  )
}

function LayoutPreviewLista({ primario }: { primario: string }) {
  return (
    <div className="space-y-1.5 p-2">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center gap-2 rounded-lg bg-white p-2 shadow-sm">
          <div className="flex-1">
            <div className="h-2 w-16 rounded bg-gray-200" />
            <div className="mt-1 h-1.5 w-10 rounded" style={{ backgroundColor: primario, opacity: 0.6 }} />
          </div>
          <div className="h-8 w-8 flex-shrink-0 rounded-md bg-gray-200" />
        </div>
      ))}
    </div>
  )
}

function LayoutPreviewGrilla({ primario }: { primario: string }) {
  return (
    <div className="grid grid-cols-2 gap-1.5 p-2">
      {[1, 2].map((i) => (
        <div key={i} className="rounded-lg bg-white shadow-sm">
          <div className="h-10 w-full rounded-t-lg bg-gray-200" />
          <div className="p-1.5">
            <div className="h-2 w-10 rounded bg-gray-200" />
            <div className="mt-1 h-1.5 w-7 rounded" style={{ backgroundColor: primario, opacity: 0.6 }} />
          </div>
        </div>
      ))}
    </div>
  )
}
