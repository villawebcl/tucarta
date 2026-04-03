import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updateItemSchema } from '@/lib/validations/item.schema'
import { updateItem, deleteItem } from '@/services/item.service'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await params
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', session.user.tenantId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Producto no encontrado', code: 'NOT_FOUND' }, { status: 404 })
  }

  return NextResponse.json({ data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body: unknown = await request.json()
    const parsed = updateItemSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const result = await updateItem(session.user.tenantId, id, parsed.data)

    if (!result.success) {
      const status = result.error.code === 'NOT_FOUND' ? 404 : 500
      return NextResponse.json({ error: result.error.message, code: result.error.code }, { status })
    }

    return NextResponse.json({ data: result.data })
  } catch {
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const { id } = await params
  const result = await deleteItem(session.user.tenantId, id)

  if (!result.success) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
