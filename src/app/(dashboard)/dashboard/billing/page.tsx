import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { getActiveSubscription } from '@/services/subscription.service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PLANES, PLAN_LIMITS } from '@/lib/constants'
import { formatCLP } from '@/lib/utils/format'

export default async function BillingPage() {
  const session = await auth()
  if (!session?.user) return null

  const [tenantResult, subResult] = await Promise.all([
    getTenantById(session.user.tenantId),
    getActiveSubscription(session.user.tenantId),
  ])

  if (!tenantResult.success) return null

  const tenant = tenantResult.data
  const subscription = subResult.success ? subResult.data : null
  const limits = PLAN_LIMITS[tenant.plan]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Plan y Pagos</h1>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-gray-900">Plan actual</h2>
        <div className="flex items-center gap-3">
          <Badge variant={tenant.plan === 'pro' ? 'info' : tenant.plan === 'basico' ? 'success' : 'default'}>
            {tenant.plan.charAt(0).toUpperCase() + tenant.plan.slice(1)}
          </Badge>
          {subscription && (
            <span className="text-sm text-gray-500">
              Próximo cobro: {new Date(subscription.next_billing_date ?? '').toLocaleDateString('es-CL')}
            </span>
          )}
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-gray-500">Productos</dt>
            <dd className="font-medium">{limits.maxItems === Infinity ? 'Ilimitados' : limits.maxItems}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Categorías</dt>
            <dd className="font-medium">{limits.maxCategories === Infinity ? 'Ilimitadas' : limits.maxCategories}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Imágenes</dt>
            <dd className="font-medium">{limits.hasImages ? 'Incluidas' : 'No incluidas'}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Analytics</dt>
            <dd className="font-medium">{limits.hasAnalytics ? 'Incluido' : 'No incluido'}</dd>
          </div>
        </dl>
      </Card>

      {tenant.plan === 'free' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {(['basico', 'pro'] as const).map((plan) => (
            <Card key={plan}>
              <h3 className="font-semibold text-gray-900">{PLANES[plan].label}</h3>
              <p className="mt-1 text-2xl font-bold text-brand-500">
                {formatCLP(PLANES[plan].precio)}/mes
              </p>
              <form action="/api/subscriptions" method="POST">
                <input type="hidden" name="plan" value={plan} />
                <button
                  type="submit"
                  className="mt-4 w-full rounded-lg bg-brand-500 py-2 text-sm font-medium text-white hover:bg-brand-600"
                >
                  Suscribirme al {PLANES[plan].label}
                </button>
              </form>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
