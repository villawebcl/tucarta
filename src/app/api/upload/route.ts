import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { uploadImage } from '@/services/upload.service'
import { getTenantById } from '@/services/tenant.service'
import { PLAN_LIMITS } from '@/lib/constants'

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  // Verificar que el plan permite imágenes
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

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No se recibió ningún archivo', code: 'VALIDATION_ERROR' }, { status: 400 })
    }

    const result = await uploadImage(session.user.tenantId, file)

    if (!result.success) {
      return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 400 })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
