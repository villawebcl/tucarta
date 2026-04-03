import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { generateQR } from '@/lib/qr/generator'
import { logger } from '@/lib/logger'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Verificar que el slug pertenece al tenant autenticado
  const tenantResult = await getTenantById(session.user.tenantId)
  if (!tenantResult.success) {
    return NextResponse.json({ error: 'Restaurante no encontrado', code: 'NOT_FOUND' }, { status: 404 })
  }

  const { slug } = await params

  if (tenantResult.data.slug !== slug) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const url = new URL(request.url)
  const format = url.searchParams.get('format') === 'svg' ? 'svg' : 'png'

  let qr: Buffer
  try {
    qr = await generateQR(slug, format) as Buffer
  } catch (err) {
    logger.error('qr generation failed', { slug, format, err: String(err) })
    return NextResponse.json({ error: 'Error al generar el QR', code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  logger.info('qr generated', { slug, format })
  const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png'

  return new NextResponse(new Uint8Array(qr), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="qr-tucarta-${slug}.${format}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
