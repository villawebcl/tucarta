'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FUENTES, type FuenteKey } from '@/lib/constants'
import type { Tenant } from '@/types'

interface SettingsFormProps {
  tenant: Tenant
}

type Colores = { primario: string; fondo: string; fuente?: string }

export function SettingsForm({ tenant }: SettingsFormProps) {
  const coloresInit = (tenant.colores ?? {}) as Colores
  const [primario, setPrimario] = useState(coloresInit.primario ?? '#FF6B35')
  const [fondo, setFondo] = useState(coloresInit.fondo ?? '#FFFFFF')
  const [fuente, setFuente] = useState<FuenteKey>((coloresInit.fuente as FuenteKey) ?? 'inter')
  const [portadaUrl, setPortadaUrl] = useState<string | null>(tenant.portada_url ?? null)

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
      // Limpiar input para permitir re-subir el mismo archivo
      if (portadaRef.current) portadaRef.current.value = ''
    }
  }

  // ── Guardar configuración ─────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    setSuccessMsg('')
    setErrorMsg('')
    try {
      const res = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portada_url: portadaUrl,
          colores: { primario, fondo, fuente },
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

      {/* ── Portada ───────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-base font-semibold text-gray-900">Imagen de portada</h2>
        <p className="mb-4 text-sm text-gray-500">
          Aparece como fondo del encabezado de tu carta. Recomendado: 1200 × 400 px.
        </p>

        {/* Preview */}
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
        {/* Swatch clickeable */}
        <label className="relative h-10 w-10 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg border border-gray-300 shadow-sm">
          <div className="h-full w-full" style={{ backgroundColor: value }} />
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
        </label>
        {/* Input hex */}
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
