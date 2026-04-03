import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'TuCarta — Carta digital con QR para restaurantes chilenos',
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-brand-500">TuCarta</span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
            >
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-4 py-24 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900">
          Tu carta digital con QR{' '}
          <span className="text-brand-500">en minutos</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl text-gray-500">
          Crea y actualiza el menú de tu restaurante desde el celular. Sin técnicos, sin
          comisiones, sin complicaciones.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-xl bg-brand-500 px-8 py-4 text-lg font-semibold text-white hover:bg-brand-600"
          >
            Crear mi carta gratis
          </Link>
          <Link
            href="/menu/demo"
            className="rounded-xl border border-gray-300 px-8 py-4 text-lg font-semibold text-gray-700 hover:bg-gray-50"
          >
            Ver ejemplo
          </Link>
        </div>
      </section>

      {/* Planes */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
            Planes simples y transparentes
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                name: 'Gratis',
                price: '$0',
                features: ['10 productos', '3 categorías', 'Carta con QR', 'Soporte básico'],
              },
              {
                name: 'Básico',
                price: '$9.990/mes',
                features: ['50 productos', '10 categorías', 'Imágenes de productos', 'Soporte prioritario'],
                highlighted: true,
              },
              {
                name: 'Pro',
                price: '$19.990/mes',
                features: ['Productos ilimitados', 'Categorías ilimitadas', 'Analytics de escaneos', 'Soporte premium'],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'border-brand-500 bg-brand-500 text-white shadow-lg'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className={`mt-2 text-3xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-8 block rounded-lg px-4 py-2 text-center text-sm font-medium ${
                    plan.highlighted
                      ? 'bg-white text-brand-500 hover:bg-gray-50'
                      : 'bg-brand-500 text-white hover:bg-brand-600'
                  }`}
                >
                  Comenzar
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
