import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { generateQR } from '@/lib/qr/generator'

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

  const qr = await generateQR(slug, format)

  const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png'

  return new NextResponse(qr as Buffer, {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="qr-tucarta-${slug}.${format}"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
