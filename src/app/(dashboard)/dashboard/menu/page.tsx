import { auth } from '@/lib/auth/config'
import { getItemsByTenant } from '@/services/item.service'
import { getCategoriesByTenant } from '@/services/category.service'
import { getTenantById } from '@/services/tenant.service'
import { formatCLP } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

export default async function MenuManagePage() {
  const session = await auth()
  if (!session?.user) return null

  const [itemsResult, categoriesResult, tenantResult] = await Promise.all([
    getItemsByTenant(session.user.tenantId),
    getCategoriesByTenant(session.user.tenantId),
    getTenantById(session.user.tenantId),
  ])

  const items = itemsResult.success ? itemsResult.data : []
  const categories = categoriesResult.success ? categoriesResult.data : []
  const plan = tenantResult.success ? tenantResult.data.plan : 'free'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mi Carta</h1>
        <Link
          href="/dashboard/menu/nuevo"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          + Agregar producto
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-400">Aún no tienes productos en tu carta</p>
          <Link
            href="/dashboard/menu/nuevo"
            className="mt-4 inline-block text-sm font-medium text-brand-500 hover:underline"
          >
            Agrega tu primer producto →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Producto</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Categoría</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Precio</th>
                <th className="px-6 py-3 text-left font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => {
                const category = categories.find((c) => c.id === item.category_id)
                return (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">{item.nombre}</span>
                      <span className="ml-2 inline-flex gap-1">
                        {item.destacado && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            Recom.
                          </span>
                        )}
                        {item.popular && (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rose-700">
                            Popular
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{category?.nombre ?? '—'}</td>
                    <td className="px-6 py-4 text-gray-900">{formatCLP(item.precio)}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.activo ? 'success' : 'default'}>
                        {item.activo ? 'Disponible' : 'Oculto'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/menu/${item.id}`}
                        className="text-brand-500 hover:underline"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
