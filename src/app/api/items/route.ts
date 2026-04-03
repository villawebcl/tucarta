import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createItemSchema } from '@/lib/validations/item.schema'
import { createItem, getItemsByTenant } from '@/services/item.service'
import { getTenantById } from '@/services/tenant.service'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const result = await getItemsByTenant(session.user.tenantId)
  if (!result.success) {
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
    const parsed = createItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const tenantResult = await getTenantById(session.user.tenantId)
    if (!tenantResult.success) {
      return NextResponse.json({ error: 'Restaurante no encontrado', code: 'NOT_FOUND' }, { status: 404 })
    }

    const result = await createItem(session.user.tenantId, tenantResult.data.plan, parsed.data)

    if (!result.success) {
      const status = result.error.code === 'PLAN_LIMIT_REACHED' ? 403 : 500
      return NextResponse.json({ error: result.error.message, code: result.error.code }, { status })
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
