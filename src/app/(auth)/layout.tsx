export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="text-3xl font-extrabold text-brand-500">TuCarta</span>
          <p className="mt-2 text-sm text-gray-500">Carta digital para restaurantes</p>
        </div>
        {children}
      </div>
    </div>
  )
}
