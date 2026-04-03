import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { updateCategorySchema } from '@/lib/validations/category.schema'
import { updateCategory, deleteCategory } from '@/services/category.service'

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
    const parsed = updateCategorySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const result = await updateCategory(session.user.tenantId, id, parsed.data)

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
  const result = await deleteCategory(session.user.tenantId, id)

  if (!result.success) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
