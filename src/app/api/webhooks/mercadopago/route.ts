import { NextResponse } from 'next/server'
import { verifyMercadoPagoWebhook, mpPreApproval } from '@/lib/mercadopago/client'
import { handleSubscriptionWebhook } from '@/services/subscription.service'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  const xSignature = request.headers.get('x-signature') ?? ''
  const xRequestId = request.headers.get('x-request-id') ?? ''

  const url = new URL(request.url)
  const dataId = url.searchParams.get('data.id') ?? ''

  if (!verifyMercadoPagoWebhook(xSignature, xRequestId, dataId)) {
    logger.warn('mp webhook firma inválida', { xRequestId, dataId })
    return NextResponse.json({ error: 'Firma inválida', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: { type?: string; data?: { id?: string } }
  try {
    body = await request.json() as { type?: string; data?: { id?: string } }
  } catch {
    return NextResponse.json({ error: 'Cuerpo inválido', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  // Eventos no manejados: responder 200 para que MP no reintente innecesariamente
  if (body.type !== 'subscription_preapproval') {
    return NextResponse.json({ received: true })
  }

  const subscriptionId = body.data?.id
  if (!subscriptionId) {
    return NextResponse.json({ error: 'ID no encontrado', code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  let subscription
  try {
    subscription = await mpPreApproval.get({ id: subscriptionId })
  } catch (err) {
    logger.error('mp webhook: error consultando preapproval', { subscriptionId, err })
    // 500 → MP reintentará automáticamente
    return NextResponse.json({ error: 'Error consultando MP', code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  const result = await handleSubscriptionWebhook(
    subscriptionId,
    subscription.status ?? 'pending',
    subscription.payer_id?.toString() ?? null,
    subscription.next_payment_date ?? null
  )

  if (!result.success) {
    logger.error('mp webhook: fallo al procesar suscripción', { subscriptionId, error: result.error })
    // 500 → MP reintentará automáticamente
    return NextResponse.json({ error: 'Error procesando suscripción', code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  logger.info('mp webhook procesado', { subscriptionId, status: subscription.status })
  return NextResponse.json({ received: true })
}
