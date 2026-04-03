import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/tenant.schema'
import { createTenant } from '@/services/tenant.service'

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const result = await createTenant(parsed.data)

    if (!result.success) {
      const statusMap: Record<string, number> = {
        DUPLICATE_SLUG: 409,
        INTERNAL_ERROR: 500,
      }
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: statusMap[result.error.code] ?? 400 }
      )
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
