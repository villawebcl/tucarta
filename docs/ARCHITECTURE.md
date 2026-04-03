# Arquitectura de TuCarta

## Visión general

TuCarta es un SaaS multi-tenant donde cada restaurante ("tenant") tiene su propia carta digital accesible por QR. El sistema está diseñado para ser simple de operar pero seguro por defecto.

## Multi-tenancy

### Estrategia de aislamiento

Usamos **schema compartido con RLS** (Row Level Security) en Supabase. Cada tabla tiene una columna `tenant_id` y políticas RLS que filtran automáticamente por `app.tenant_id`.

**Por qué no schemas separados:** El overhead operacional de cientos de schemas en Postgres supera los beneficios para este tamaño de aplicación.

**Por qué RLS como última línea:** Los services validan ownership antes de ejecutar queries, pero RLS previene fugas de datos incluso si hay un bug en la capa de aplicación.

### Resolución del tenant

```
Request → Middleware → x-tenant-slug header → Server Component → Service → DB (con RLS)
```

El middleware extrae el slug de la URL `/menu/[slug]` y lo adjunta al header `x-tenant-slug`. Esto permite que los Server Components obtengan el tenant sin re-parsear la URL.

## Capas de la aplicación

```
src/app/          ← Routing, UI, Server/Client Components
src/services/     ← Lógica de negocio (sin dependencias React)
src/lib/          ← Clients externos, validaciones, utils
```

**Regla:** `src/services/` no importa nada de React ni de Next.js. Son funciones puras o async que pueden testearse sin levantar un servidor.

## Decisiones de diseño

Ver `docs/adr/` para ADRs detallados.

## Flujo de autenticación

1. Usuario envía email/password a `POST /api/auth/callback/credentials`
2. NextAuth.js valida con bcrypt contra `users.password_hash`
3. Si válido, emite JWT (1h) con `{ userId, tenantId, role }`
4. Refresh token en cookie httpOnly dura 7 días
5. Middleware verifica JWT en rutas `/dashboard/*`

## Flujo de pagos

1. Usuario elige plan en `/dashboard/billing`
2. `POST /api/subscriptions` crea pre-aprobación en MP y retorna `init_point`
3. Usuario es redirigido a Mercado Pago para pagar
4. MP llama al webhook `POST /api/webhooks/mercadopago`
5. Webhook verifica firma HMAC, actualiza `subscriptions` y el `plan` del tenant

## Performance en la carta pública

La ruta `/menu/[slug]` es SSR con:
- `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
- Sin hidratación de React (solo Server Components)
- Registro de QR scan como fire-and-forget (no bloquea el render)
- `next/image` con `sizes` apropiados

## Seguridad

Ver `src/middleware.ts` para rate limiting y auth guard.
Ver `src/services/upload.service.ts` para validación de imágenes con magic bytes.
Ver `next.config.ts` para headers HTTP de seguridad.
