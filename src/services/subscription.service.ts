import { mpPreApproval } from '@/lib/mercadopago/client'
import { createAdminClient } from '@/lib/supabase/server'
import { PLANES } from '@/lib/constants'
import type { Result, AppError, Subscription } from '@/types'

/**
 * Inicia el flujo de suscripción con Mercado Pago.
 * Retorna la URL de pago para redirigir al usuario.
 */
export async function createSubscription(
  tenantId: string,
  userEmail: string,
  plan: 'basico' | 'pro',
  backUrl?: string
): Promise<Result<{ init_point: string; subscription_id: string }, AppError>> {
  const planConfig = PLANES[plan]
  if (!planConfig.mp_plan_id) {
    return {
      success: false,
      error: { code: 'PAYMENT_ERROR', message: 'Plan no configurado' },
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tucarta.cl'

  try {
    const subscription = await mpPreApproval.create({
      body: {
        preapproval_plan_id: planConfig.mp_plan_id,
        payer_email: userEmail,
        back_url: backUrl || `${appUrl}/dashboard/billing`,
        external_reference: tenantId,
        status: 'pending',
      },
    })

    return {
      success: true,
      data: {
        init_point: subscription.init_point ?? '',
        subscription_id: subscription.id ?? '',
      },
    }
  } catch (err) {
    return {
      success: false,
      error: { code: 'PAYMENT_ERROR', message: 'Error al crear la suscripción' },
    }
  }
}

/**
 * Procesa el webhook de Mercado Pago para actualizar el estado de la suscripción.
 */
export async function handleSubscriptionWebhook(
  mpSubscriptionId: string,
  status: string,
  payerId: string | null,
  nextBillingDate: string | null
): Promise<Result<void, AppError>> {
  const supabase = createAdminClient()

  const validStatuses = ['authorized', 'paused', 'cancelled', 'pending'] as const
  type ValidStatus = typeof validStatuses[number]

  const normalizedStatus: ValidStatus = validStatuses.includes(status as ValidStatus)
    ? (status as ValidStatus)
    : 'pending'

  // Buscar suscripción existente
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('id, tenant_id')
    .eq('mp_subscription_id', mpSubscriptionId)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: normalizedStatus,
        mp_payer_id: payerId,
        next_billing_date: nextBillingDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) {
      return {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al actualizar la suscripción' },
      }
    }

    // Actualizar plan del tenant si la suscripción fue autorizada
    if (normalizedStatus === 'authorized') {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('plan')
        .eq('id', existing.id)
        .single()

      if (sub) {
        await supabase
          .from('tenants')
          .update({ plan: sub.plan })
          .eq('id', existing.tenant_id)
      }
    } else if (normalizedStatus === 'cancelled') {
      await supabase
        .from('tenants')
        .update({ plan: 'free' })
        .eq('id', existing.tenant_id)
    }
  }

  return { success: true, data: undefined }
}

/**
 * Obtiene la suscripción activa de un tenant.
 */
export async function getActiveSubscription(
  tenantId: string
): Promise<Result<Subscription | null, AppError>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'authorized')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al obtener la suscripción' },
    }
  }

  return { success: true, data: data ?? null }
}
