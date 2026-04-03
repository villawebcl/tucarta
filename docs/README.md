# TuCarta

Carta digital con código QR para restaurantes chilenos. Crea y actualiza tu menú desde el celular, sin técnicos ni comisiones.

## Arquitectura

```
                                    ┌─────────────────────────────────────┐
                                    │           VERCEL EDGE               │
                                    │  ┌──────────────────────────────┐   │
  Cliente ──── HTTPS ────────────▶  │  │     Next.js 14 (App Router)  │   │
  (navegador/QR)                    │  │                               │   │
                                    │  │  ┌──────────┐ ┌───────────┐  │   │
                                    │  │  │ /menu/   │ │/dashboard/│  │   │
                                    │  │  │ [slug]   │ │  (auth)   │  │   │
                                    │  │  │  (SSR)   │ │           │  │   │
                                    │  │  └────┬─────┘ └─────┬─────┘  │   │
                                    │  │       │              │        │   │
                                    │  │  ┌────▼──────────────▼─────┐  │   │
                                    │  │  │     src/services/       │  │   │
                                    │  │  │  tenant | item | upload  │  │   │
                                    │  │  └────────────┬────────────┘  │   │
                                    │  └───────────────│───────────────┘   │
                                    └──────────────────│───────────────────┘
                                                       │
                              ┌────────────────────────┼───────────────┐
                              │                        │               │
                       ┌──────▼──────┐        ┌───────▼──────┐  ┌────▼─────┐
                       │  Supabase   │        │  Supabase    │  │  Supabase │
                       │  Postgres   │        │   Storage    │  │   Auth    │
                       │  (+ RLS)    │        │ (item-images)│  │  (futuro) │
                       └─────────────┘        └──────────────┘  └──────────┘
```

**Multi-tenant:** cada restaurante es un `tenant` con un `slug` único. Las rutas `/menu/[slug]` sirven la carta pública. El middleware adjunta `x-tenant-slug` al request para evitar re-parsear la URL.

**Seguridad en capas:**
1. Middleware: rate limiting + JWT guard
2. Services: validación de plan, ownership de recursos
3. Supabase RLS: última línea de defensa, datos aislados por `tenant_id`

## Setup local

### Requisitos

- Node.js ≥ 20
- pnpm ≥ 9
- Cuenta en [Supabase](https://supabase.com)
- (Opcional) Cuenta en [Mercado Pago](https://www.mercadopago.cl/developers)

### 1. Clonar e instalar

```bash
git clone https://github.com/tu-org/tucarta.git
cd tucarta
pnpm install
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Crear el schema en Supabase

En el SQL Editor de Supabase, ejecutar:

```bash
# Copiar contenido de supabase/migrations/001_initial.sql
```

También crear el bucket `item-images` en Supabase Storage con acceso público.

### 4. Ejecutar en desarrollo

```bash
pnpm dev
```

Abrir [http://localhost:3000](http://localhost:3000).

## Comandos

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm typecheck` | Verificación de tipos TypeScript |
| `pnpm lint` | ESLint |
| `pnpm format` | Formatear con Prettier |
| `pnpm format:check` | Verificar formato |
| `pnpm test` | Tests unitarios e integración (Vitest) |
| `pnpm test:watch` | Tests en modo watch |
| `pnpm test:e2e` | Tests E2E (Playwright) |

## Planes

| | Gratis | Básico | Pro |
|---|---|---|---|
| Precio | $0 | $9.990/mes | $19.990/mes |
| Productos | 10 | 50 | Ilimitados |
| Categorías | 3 | 10 | Ilimitadas |
| Imágenes | ❌ | ✅ | ✅ |
| Analytics QR | ❌ | ❌ | ✅ |

## Decisiones de arquitectura

Ver [docs/adr/](./adr/) para las decisiones tomadas durante el desarrollo.

## Stack

- **Framework:** Next.js 14 con App Router
- **DB:** Supabase (Postgres + Storage + Auth)
- **Auth:** NextAuth.js v5 con JWT
- **Pagos:** Mercado Pago
- **Estilos:** Tailwind CSS v3
- **Testing:** Vitest + Playwright + MSW
- **Deploy:** Vercel
