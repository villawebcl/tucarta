import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { createSubscription } from '@/services/subscription.service'
import { z } from 'zod'

const createSubscriptionSchema = z.object({
  plan: z.enum(['basico', 'pro']),
  back_url: z.string().url().optional(),
})

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    // Soporta tanto JSON como form data (el billing page usa un <form>)
    let body: unknown
    const contentType = request.headers.get('content-type') ?? ''

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      body = Object.fromEntries(formData.entries())
    } else {
      body = await request.json()
    }

    const parsed = createSubscriptionSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', code: 'VALIDATION_ERROR' },
        { status: 400 }
      )
    }

    const tenantResult = await getTenantById(session.user.tenantId)
    if (!tenantResult.success) {
      return NextResponse.json({ error: 'Restaurante no encontrado', code: 'NOT_FOUND' }, { status: 404 })
    }

    // No permitir suscribirse si ya tiene plan activo del mismo tipo
    if (tenantResult.data.plan === parsed.data.plan) {
      return NextResponse.json(
        { error: 'Ya tienes este plan activo', code: 'DUPLICATE_SUBSCRIPTION' },
        { status: 409 }
      )
    }

    const result = await createSubscription(
      session.user.tenantId,
      session.user.email,
      parsed.data.plan,
      parsed.data.back_url
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.message, code: result.error.code },
        { status: 500 }
      )
    }

    // Si viene de un form HTML, redirigir directo al init_point de MP
    if (contentType.includes('application/x-www-form-urlencoded')) {
      return NextResponse.redirect(result.data.init_point, 303)
    }

    return NextResponse.json({ data: result.data }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
