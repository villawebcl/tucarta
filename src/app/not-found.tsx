import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
      <h1 className="text-6xl font-extrabold text-brand-500">404</h1>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">
        Esta carta no existe
      </h2>
      <p className="mt-2 text-gray-500">
        El restaurante que buscas no está registrado en TuCarta o su carta está inactiva.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-lg bg-brand-500 px-6 py-3 font-medium text-white hover:bg-brand-600"
      >
        Volver al inicio
      </Link>
    </main>
  )
}
