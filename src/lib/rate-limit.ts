/**
 * Rate limiter in-memory con sliding window.
 *
 * Limitación conocida: en entornos serverless cada instancia tiene su propio
 * store, por lo que el límite aplica por instancia, no globalmente.
 * Es suficiente para un MVP — bloquea ataques de fuerza bruta básicos.
 * Para producción a escala, reemplazar con Upstash Redis.
 */

interface Entry {
  count: number
  resetAt: number
}

const store = new Map<string, Entry>()

// Limpiar entradas expiradas cada 5 minutos para evitar memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key)
    }
  }, 5 * 60 * 1000)
}

/**
 * Verifica si la key está dentro del límite permitido.
 * Retorna true si se permite la petición, false si debe bloquearse.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false

  entry.count++
  return true
}

/**
 * Extrae la IP del cliente desde los headers de la request.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() ?? 'unknown'
}
