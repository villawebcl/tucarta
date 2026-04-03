import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 bg-white">
        <div className="p-6">
          <span className="text-xl font-bold text-brand-500">TuCarta</span>
        </div>
        <nav className="px-4 pb-6">
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
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <header className="border-b border-gray-200 bg-white px-8 py-4">
          <p className="text-sm text-gray-500">
            {session.user.email}
          </p>
        </header>
        <main className="flex-1 px-8 py-8">{children}</main>
      </div>
    </div>
  )
}
