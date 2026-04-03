import type { Item, Category, Tenant } from './index'

/** Respuesta estándar de error de la API */
export interface ApiError {
  error: string
  code: string
}

/** Respuesta de listado paginado */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

// ── Items ──────────────────────────────────────────────

export interface CreateItemRequest {
  nombre: string
  descripcion?: string | null
  precio: number
  category_id: string
  activo?: boolean
  orden?: number
}

export interface UpdateItemRequest extends Partial<CreateItemRequest> {}

export interface ItemResponse extends Item {}

// ── Categories ─────────────────────────────────────────

export interface CreateCategoryRequest {
  nombre: string
  orden?: number
  activo?: boolean
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryResponse extends Category {}

// ── Tenants ────────────────────────────────────────────

export interface UpdateTenantRequest {
  nombre?: string
  colores?: {
    primario: string
    fondo: string
  }
}

export interface TenantResponse extends Omit<Tenant, 'updated_at'> {
  updated_at: string
}

// ── Upload ─────────────────────────────────────────────

export interface UploadResponse {
  url: string
  path: string
}

// ── Subscriptions ──────────────────────────────────────

export interface CreateSubscriptionRequest {
  plan: 'basico' | 'pro'
  back_url?: string
}

export interface CreateSubscriptionResponse {
  init_point: string
  subscription_id: string
}
