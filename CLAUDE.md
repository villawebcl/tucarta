# TuCarta — Contexto para Claude Code

## Quién soy
Soy el único desarrollador de este proyecto. Trabajo con Claude Code como pair programmer principal.

## Reglas de código que SIEMPRE debes seguir
- TypeScript estricto, zero `any`, tipos explícitos en todo
- Código y variables en inglés, UI y mensajes al usuario en español chileno
- Separación estricta: lógica de negocio en `src/services/`, sin imports de React ahí
- Validación con Zod en cada API route antes de tocar la base de datos
- RLS de Supabase es obligatorio — nunca bypassear con service role key en rutas públicas
- Nunca dejar `console.log` en código de producción — usar un logger estructurado

## Cómo tomar decisiones
- Si hay una decisión de arquitectura no obvia, documéntala en `docs/adr/` antes de implementar
- Si algo no está especificado y hay varias opciones válidas, elige la más simple que funcione
- Ante la duda entre simple y sofisticado, elige simple

## Stack que usamos
Next.js 14 App Router · TypeScript · Supabase · Tailwind · Zod · NextAuth.js v5 · Mercado Pago SDK · Vitest · Playwright

## Comandos del proyecto
- `pnpm dev` — desarrollo
- `pnpm typecheck` — verificar tipos
- `pnpm lint` — linting
- `pnpm test` — unit tests
- `pnpm test:e2e` — tests end-to-end
