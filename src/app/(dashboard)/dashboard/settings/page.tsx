import type { Metadata } from 'next'
import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { Card } from '@/components/ui/card'

export const metadata: Metadata = { title: 'Configuración' }

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user) return null

  const tenantResult = await getTenantById(session.user.tenantId)
  const tenant = tenantResult.success ? tenantResult.data : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-1 text-sm text-gray-500">
          Personaliza el aspecto de tu carta pública.
        </p>
      </div>

      {/* Datos de solo lectura */}
      <Card>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Tu restaurante
        </h2>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-500">Nombre</dt>
            <dd className="font-medium text-gray-900">{tenant?.nombre}</dd>
          </div>
          <div>
            <dt className="text-gray-500">URL de tu carta</dt>
            <dd className="font-medium text-brand-600">
              <a
                href={`/menu/${tenant?.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                /menu/{tenant?.slug}
              </a>
            </dd>
          </div>
        </dl>
      </Card>

      {/* Formulario de apariencia */}
      {tenant ? (
        <SettingsForm tenant={tenant} />
      ) : (
        <p className="text-sm text-gray-500">No se pudo cargar la configuración.</p>
      )}
    </div>
  )
}
