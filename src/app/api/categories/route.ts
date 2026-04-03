import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createCategorySchema } from '@/lib/validations/category.schema'
import { createCategory, getCategoriesByTenant } from '@/services/category.service'
import { getTenantById } from '@/services/tenant.service'
import { getEffectivePlan } from '@/lib/constants'
import { logger } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const result = await getCategoriesByTenant(session.user.tenantId)
  if (!result.success) {
    logger.error('get categories failed', { tenantId: session.user.tenantId, code: result.error.code })
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 500 })
  }

  return NextResponse.json({ data: result.data })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body: unknown = await request.json()
    const parsed = createCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Datos inválidos', code: 'VALIDATION_ERROR' }, { status: 400 })
    }

    const tenantResult = await getTenantById(session.user.tenantId)
    if (!tenantResult.success) {
      return NextResponse.json({ error: 'Restaurante no encontrado', code: 'NOT_FOUND' }, { status: 404 })
    }

    const plan = getEffectivePlan(tenantResult.data)
    const result = await createCategory(session.user.tenantId, plan, parsed.data)

    if (!result.success) {
      const status = result.error.code === 'PLAN_LIMIT_REACHED' ? 403 : 500
      logger.warn('create category blocked', { tenantId: session.user.tenantId, code: result.error.code })
      return NextResponse.json({ error: result.error.message, code: result.error.code }, { status })
    }

    logger.info('category created', { tenantId: session.user.tenantId, id: result.data.id })
    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch (err) {
    logger.error('create category exception', { tenantId: session.user.tenantId, err: String(err) })
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
