export default function MenuLoading() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header skeleton */}
      <div className="h-16 animate-pulse bg-gray-200" />

      {/* Content skeleton */}
      <div className="mx-auto max-w-2xl space-y-8 px-4 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                  <div className="h-20 w-20 animate-pulse rounded-lg bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-full animate-pulse rounded bg-gray-200" />
                    <div className="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
