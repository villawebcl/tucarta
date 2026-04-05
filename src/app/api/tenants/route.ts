import { NextResponse } from 'next/server'
import { registerSchema } from '@/lib/validations/tenant.schema'
import { createTenant } from '@/services/tenant.service'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  // 5 registros por hora por IP
  const ip = getClientIp(request)
  if (!checkRateLimit(`register:${ip}`, 5, 60 * 60 * 1000)) {
    logger.warn('registro rate limited', { ip })
    return NextResponse.json(
      { error: 'Demasiados intentos. Intenta de nuevo más tarde.', code: 'RATE_LIMITED' },
      { status: 429 }
    )
  }

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
      logger.error('crear tenant falló', { slug: parsed.data.slug, code: result.error.code })
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: statusMap[result.error.code] ?? 400 }
      )
    }

    logger.info('tenant creado', { tenantId: result.data.tenantId })
    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch {
    logger.error('registro: error inesperado', { ip })
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
