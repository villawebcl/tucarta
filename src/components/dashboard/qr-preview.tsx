'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface QRPreviewProps {
  slug: string
  qrDataUrl: string
}

export function QRPreview({ slug, qrDataUrl }: QRPreviewProps) {
  const [downloading, setDownloading] = useState(false)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tucarta.cl'
  const menuUrl = `${appUrl}/menu/${slug}`

  async function downloadQR(format: 'png' | 'svg') {
    setDownloading(true)
    try {
      const response = await fetch(`/api/qr/${slug}?format=${format}`)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-tucarta-${slug}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="Código QR de tu carta digital" className="h-48 w-48" />
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">URL de tu carta:</p>
        <a
          href={menuUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 text-sm font-medium text-brand-600 hover:underline"
        >
          {menuUrl}
        </a>
      </div>

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadQR('png')}
          loading={downloading}
        >
          Descargar PNG
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadQR('svg')}
          loading={downloading}
        >
          Descargar SVG
        </Button>
      </div>
    </div>
  )
}
