import { NextResponse } from 'next/server'
import { verifyMercadoPagoWebhook } from '@/lib/mercadopago/client'
import { handleSubscriptionWebhook } from '@/services/subscription.service'
import { mpPreApproval } from '@/lib/mercadopago/client'

export async function POST(request: Request) {
  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''

  const url = new URL(request.url)
  const dataId = url.searchParams.get('data.id') ?? ''

  if (!verifyMercadoPagoWebhook(xSignature, xRequestId, dataId)) {
    return NextResponse.json({ error: 'Firma inválida', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json() as { type?: string; data?: { id?: string } }

    if (body.type === 'subscription_preapproval') {
      const subscriptionId = body.data?.id
      if (!subscriptionId) {
        return NextResponse.json({ error: 'ID no encontrado', code: 'VALIDATION_ERROR' }, { status: 400 })
      }

      const subscription = await mpPreApproval.get({ id: subscriptionId })

      await handleSubscriptionWebhook(
        subscriptionId,
        subscription.status ?? 'pending',
        subscription.payer_id?.toString() ?? null,
        subscription.next_payment_date ?? null
      )
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Error interno', code: 'INTERNAL_ERROR' }, { status: 500 })
  }
}
