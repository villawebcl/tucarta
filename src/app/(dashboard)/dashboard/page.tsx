import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { getItemsByTenant } from '@/services/item.service'
import { getCategoriesByTenant } from '@/services/category.service'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanBadge } from '@/components/dashboard/plan-badge'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) return null

  const [tenantResult, itemsResult, categoriesResult] = await Promise.all([
    getTenantById(session.user.tenantId),
    getItemsByTenant(session.user.tenantId),
    getCategoriesByTenant(session.user.tenantId),
  ])

  const tenant = tenantResult.success ? tenantResult.data : null
  const itemCount = itemsResult.success ? itemsResult.data.length : 0
  const categoryCount = categoriesResult.success ? categoriesResult.data.length : 0

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hola, {tenant?.nombre ?? 'tu restaurante'}
          </h1>
          <p className="mt-1 text-gray-500">Gestiona tu carta digital desde acá</p>
        </div>
        {tenant && <PlanBadge plan={tenant.plan} />}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Productos</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-brand-500">{itemCount}</p>
          <Link href="/dashboard/menu" className="mt-2 text-sm text-brand-500 hover:underline">
            Gestionar →
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categorías</CardTitle>
          </CardHeader>
          <p className="text-3xl font-bold text-brand-500">{categoryCount}</p>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mi carta</CardTitle>
          </CardHeader>
          {tenant && (
            <Link
              href={`/menu/${tenant.slug}`}
              target="_blank"
              className="text-sm text-brand-500 hover:underline"
            >
              Ver carta pública →
            </Link>
          )}
        </Card>
      </div>
    </div>
  )
}
