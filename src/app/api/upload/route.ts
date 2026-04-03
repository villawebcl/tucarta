import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { uploadImage, uploadBanner } from '@/services/upload.service'
import { getTenantById } from '@/services/tenant.service'
import { PLAN_LIMITS } from '@/lib/constants'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const type = formData.get('type') ?? 'item'

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ningún archivo', code: 'VALIDATION_ERROR' }, { status: 400 })
    }

    // Las imágenes de ítem requieren plan con imágenes; la portada es libre para todos
    if (type === 'item') {
      const tenantResult = await getTenantById(session.user.tenantId)
      if (!tenantResult.success) {
        return NextResponse.json({ error: 'Restaurante no encontrado', code: 'NOT_FOUND' }, { status: 404 })
      }
      if (!PLAN_LIMITS[tenantResult.data.plan].hasImages) {
        return NextResponse.json(
          { error: 'Tu plan no incluye subida de imágenes. Actualiza a Plan Básico o Pro.', code: 'PLAN_LIMIT_REACHED' },
          { status: 403 }
        )
      }
    }

    const result =
      type === 'portada'
        ? await uploadBanner(session.user.tenantId, file)
        : await uploadImage(session.user.tenantId, file)

    if (!result.success) {
      logger.warn('upload failed', { tenantId: session.user.tenantId, type, code: result.error.code })
      return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 400 })
    }

    logger.info('upload ok', { tenantId: session.user.tenantId, type, path: result.data.path })
    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (err) {
    logger.error('upload exception', { tenantId: session.user.tenantId, err: String(err) })
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
