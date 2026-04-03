import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getTenantById, updateTenant } from '@/services/tenant.service'
import { updateTenantSchema } from '@/lib/validations/tenant.schema'
import { logger } from '@/lib/logger'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const result = await getTenantById(session.user.tenantId)

  if (!result.success) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 404 })
  }

  const { ...tenant } = result.data
  return NextResponse.json({ data: tenant })
}

export async function PATCH(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const parsed = updateTenantSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Datos inválidos', code: 'VALIDATION_ERROR' },
      { status: 422 }
    )
  }

  const result = await updateTenant(session.user.tenantId, parsed.data)

  if (!result.success) {
    logger.error('patch tenant failed', { tenantId: session.user.tenantId, code: result.error.code })
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 500 })
  }

  logger.info('tenant updated', { tenantId: session.user.tenantId })
  return NextResponse.json({ data: result.data })
}
