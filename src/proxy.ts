import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'

// Rate limiting en memoria (desarrollo). En producción usar Upstash Redis.
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

interface RateLimitConfig {
  limit: number
  windowMs: number
}

function getRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith('/api/auth')) return { limit: 10, windowMs: 60_000 }
  if (pathname.startsWith('/api')) return { limit: 60, windowMs: 60_000 }
  if (pathname.startsWith('/menu')) return { limit: 200, windowMs: 60_000 }
  return { limit: 120, windowMs: 60_000 }
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

function checkRateLimit(key: string, config: RateLimitConfig): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs })
    return true
  }

  if (entry.count >= config.limit) return false

  entry.count++
  return true
}

function jsonError(message: string, code: string, status: number): NextResponse {
  return NextResponse.json({ error: message, code }, { status })
}

export default auth(async function middleware(request) {
  const { pathname } = request.nextUrl
  const ip = getClientIp(request)
  const rateLimitKey = `${ip}:${pathname}`
  const rateLimitConfig = getRateLimitConfig(pathname)

  // 1. Rate limiting
  if (!checkRateLimit(rateLimitKey, rateLimitConfig)) {
    return jsonError('Demasiadas solicitudes. Intenta más tarde.', 'RATE_LIMIT_EXCEEDED', 429)
  }

  // 2. Protección de rutas del dashboard
  if (pathname.startsWith('/dashboard')) {
    const session = request.auth
    if (!session?.user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // 3. Adjuntar slug del tenant a los headers para rutas /menu/[slug]
  const menuMatch = pathname.match(/^\/menu\/([a-z0-9-]+)/)
  if (menuMatch) {
    const slug = menuMatch[1]
    const response = NextResponse.next()
    if (slug) {
      response.headers.set('x-tenant-slug', slug)
    }
    return response
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
