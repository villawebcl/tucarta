import { MercadoPagoConfig, PreApproval, PreApprovalPlan, Payment } from 'mercadopago'

/**
 * Instancia singleton del cliente de Mercado Pago.
 * Configurado con el access token de la variable de entorno.
 */
const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  options: {
    timeout: 5000,
  },
})

export const mpPreApproval = new PreApproval(mpClient)
export const mpPreApprovalPlan = new PreApprovalPlan(mpClient)
export const mpPayment = new Payment(mpClient)

/**
 * Verifica la firma del webhook de Mercado Pago.
 * Previene requests fraudulentos al endpoint /api/webhooks/mercadopago.
 */
export function verifyMercadoPagoWebhook(
  xSignature: string,
  xRequestId: string,
  dataId: string
): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${xSignature.split(',')[0]?.split('=')[1] ?? ''};`

  try {
    const crypto = require('crypto') as typeof import('crypto')
    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(manifest)
    const expectedSignature = hmac.digest('hex')
    const receivedSignature = xSignature.split(',')[1]?.split('=')[1] ?? ''
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(receivedSignature)
    )
  } catch {
    return false
  }
}
