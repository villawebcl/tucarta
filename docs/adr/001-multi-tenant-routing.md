# ADR 001: Estrategia de routing multi-tenant

**Fecha:** 2024-01-01
**Estado:** Aprobado

## Contexto

TuCarta sirve a múltiples restaurantes desde el mismo servidor. Necesitamos una forma de identificar el tenant en cada request y aislar sus datos.

## Opciones consideradas

### Opción A: Subdominios (`lasempanaditas.tucarta.cl`)
- ✅ URL limpia y profesional
- ✅ Posible configurar SSL wildcard en Vercel
- ❌ Requiere wildcard domains en Vercel (plan Pro)
- ❌ Más complejo para MVP

### Opción B: Rutas (`/menu/lasempanaditas`)
- ✅ Funciona en cualquier plan de Vercel
- ✅ Sin configuración extra de DNS
- ✅ Fácil de migrar a subdominios después
- ❌ URL menos "premium"

## Decisión

**Opción B para el MVP**, con arquitectura preparada para migrar a subdominios.

El middleware resuelve el tenant desde el slug en la URL y lo adjunta como header `x-tenant-slug`. Cuando se migre a subdominios, solo hay que cambiar cómo el middleware extrae el slug (del hostname en vez de la URL path), sin cambiar nada en los Server Components ni services.

## Consecuencias

- La carta pública vive en `/menu/[slug]`
- El middleware es la única pieza que cambia en la migración a subdominios
- Vercel wildcard domains: `*.tucarta.cl → tucarta.cl` (cuando estemos listos)
