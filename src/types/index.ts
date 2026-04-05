export type { Tenant, TenantInsert, TenantUpdate } from '@/lib/supabase/types'
export type { User, UserInsert } from '@/lib/supabase/types'
export type { Category, CategoryInsert, CategoryUpdate } from '@/lib/supabase/types'
export type { Item, ItemInsert, ItemUpdate } from '@/lib/supabase/types'
export type { Subscription, QrScan } from '@/lib/supabase/types'
export type { PlanType } from '@/lib/constants'

/**
 * Categoría con sus items anidados. Usada en la carta pública.
 */
export interface CategoryWithItems {
  id: string
  nombre: string
  orden: number
  items: Array<{
    id: string
    nombre: string
    descripcion: string | null
    precio: number
    imagen_url: string | null
    orden: number
    destacado: boolean
    popular: boolean
  }>
}

export type LayoutCarta = 'lista' | 'grilla'

export interface RedesSociales {
  instagram?: string
  telefono?: string
  direccion?: string
}

/**
 * Datos públicos de un tenant necesarios para renderizar la carta.
 */
export interface PublicMenu {
  tenant: {
    id: string
    slug: string
    nombre: string
    descripcion: string | null
    logo_url: string | null
    portada_url: string | null
    whatsapp: string | null
    redes_sociales: RedesSociales | null
    colores: {
      primario: string
      fondo: string
      fuente?: string
      layout?: LayoutCarta
    }
  }
  categories: CategoryWithItems[]
}

/**
 * Patrón Result para manejo de errores tipados sin excepciones.
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Error de negocio tipado con código para diferenciar el tipo de fallo.
 */
export interface AppError {
  code:
    | 'NOT_FOUND'
    | 'UNAUTHORIZED'
    | 'PLAN_LIMIT_REACHED'
    | 'VALIDATION_ERROR'
    | 'DUPLICATE_SLUG'
    | 'UPLOAD_ERROR'
    | 'PAYMENT_ERROR'
    | 'INTERNAL_ERROR'
  message: string
}
