import { auth, signOut } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTenantById } from '@/services/tenant.service'
import { trialDaysLeft } from '@/lib/constants'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const tenantResult = await getTenantById(session.user.tenantId)
  const tenant = tenantResult.success ? tenantResult.data : null
  const daysLeft = trialDaysLeft(tenant?.trial_ends_at ?? null)
  const trialActive = daysLeft > 0

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="p-6">
          <span className="text-xl font-bold text-brand-500">TuCarta</span>
        </div>
        <nav className="flex-1 px-4 pb-4">
          <ul className="space-y-1">
            {[
              { href: '/dashboard', label: 'Inicio', icon: '🏠' },
              { href: '/dashboard/categories', label: 'Categorías', icon: '🗂️' },
              { href: '/dashboard/menu', label: 'Productos', icon: '📋' },
              { href: '/dashboard/qr', label: 'Código QR', icon: '📱' },
              { href: '/dashboard/settings', label: 'Configuración', icon: '⚙️' },
              { href: '/dashboard/billing', label: 'Plan y Pagos', icon: '💳' },
            ].map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Cerrar sesión */}
        <div className="border-t border-gray-100 px-4 py-3">
          <form action={async () => { 'use server'; await signOut({ redirectTo: '/login' }) }}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path fillRule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-1.08a.75.75 0 1 0-1.004-1.11l-2.5 2.5a.75.75 0 0 0 0 1.08l2.5 2.5a.75.75 0 1 0 1.004-1.11L8.704 10.75H18.25A.75.75 0 0 0 19 10Z" clipRule="evenodd" />
              </svg>
              Cerrar sesión
            </button>
          </form>
        </div>

        {/* Banner trial en sidebar */}
        {trialActive && (
          <div className="mx-3 mb-4 rounded-xl bg-brand-50 p-3 text-center">
            <p className="text-xs font-semibold text-brand-700">
              Prueba gratuita
            </p>
            <p className="mt-0.5 text-2xl font-extrabold text-brand-600">
              {daysLeft}
            </p>
            <p className="text-xs text-brand-500">
              {daysLeft === 1 ? 'día restante' : 'días restantes'}
            </p>
            <Link
              href="/dashboard/billing"
              className="mt-2 block rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
            >
              Ver planes
            </Link>
          </div>
        )}
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Banner de aviso cuando quedan pocos días */}
        {trialActive && daysLeft <= 7 && (
          <div className="flex items-center justify-between gap-4 bg-amber-50 px-8 py-3 border-b border-amber-200">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Tu prueba gratuita termina en {daysLeft} {daysLeft === 1 ? 'día' : 'días'}.</span>
              {' '}Después solo tendrás acceso al plan gratuito básico.
            </p>
            <Link
              href="/dashboard/billing"
              className="flex-shrink-0 rounded-lg bg-amber-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-amber-700"
            >
              Contratar plan
            </Link>
          </div>
        )}

        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-8 py-4">
          <p className="text-sm text-gray-500">{session.user.email}</p>
          {tenant?.slug && (
            <a
              href={`/menu/${tenant.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:border-gray-300 hover:bg-gray-50"
            >
              Ver carta
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5 text-gray-400">
                <path fillRule="evenodd" d="M4.22 11.78a.75.75 0 0 1 0-1.06L9.44 5.5H5.75a.75.75 0 0 1 0-1.5h5.5a.75.75 0 0 1 .75.75v5.5a.75.75 0 0 1-1.5 0V6.56l-5.22 5.22a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
              </svg>
            </a>
          )}
        </header>

        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
