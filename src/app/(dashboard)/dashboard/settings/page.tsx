import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { Card } from '@/components/ui/card'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) return null

  const tenantResult = await getTenantById(session.user.tenantId)
  const tenant = tenantResult.success ? tenantResult.data : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>

      <Card>
        <h2 className="mb-4 text-base font-semibold text-gray-900">Tu restaurante</h2>
        <dl className="space-y-3 text-sm">
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500">Nombre:</dt>
            <dd className="font-medium text-gray-900">{tenant?.nombre}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-32 text-gray-500">URL de tu carta:</dt>
            <dd className="font-medium text-brand-500">
              /menu/{tenant?.slug}
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-gray-400">
          Para cambiar el nombre o colores de tu carta, escríbenos a soporte@tucarta.cl
        </p>
      </Card>
    </div>
  )
}
