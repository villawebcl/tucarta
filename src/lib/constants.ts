/**
 * Límites de uso según el plan del restaurante.
 * Validados en src/services/ antes de cada operación.
 */
export const PLAN_LIMITS = {
  free: {
    maxItems: 10,
    maxCategories: 3,
    hasImages: false,
    hasAnalytics: false,
    hasUpselling: false,
  },
  basico: {
    maxItems: 50,
    maxCategories: 10,
    hasImages: true,
    hasAnalytics: false,
    hasUpselling: false,
  },
  pro: {
    maxItems: Infinity,
    maxCategories: Infinity,
    hasImages: true,
    hasAnalytics: true,
    hasUpselling: true,
  },
} as const

/**
 * Planes de suscripción con precios en CLP.
 */
export const PLANES = {
  basico: {
    precio: 9990,
    label: 'Plan Básico',
    mp_plan_id: process.env.MP_PLAN_BASICO_ID,
  },
  pro: {
    precio: 19990,
    label: 'Plan Pro',
    mp_plan_id: process.env.MP_PLAN_PRO_ID,
  },
} as const

export type PlanType = 'free' | 'basico' | 'pro'

/** Tamaño máximo de imagen subida: 2MB */
export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024

/** Tipos MIME de imagen permitidos */
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Dimensiones máximas al procesar con Sharp */
export const IMAGE_MAX_DIMENSION = 800

/** Calidad de compresión WebP */
export const IMAGE_QUALITY = 80

/** Dimensiones de imagen de portada banner (3:1 ratio) */
export const BANNER_WIDTH = 1200
export const BANNER_HEIGHT = 400

/**
 * Fuentes disponibles para personalizar la carta.
 * `variable` es el nombre de la CSS custom property cargada en el root layout.
 */
export const FUENTES = {
  inter: { nombre: 'Inter', descripcion: 'Moderna y limpia', variable: '--font-inter' },
  playfair: { nombre: 'Playfair Display', descripcion: 'Elegante y clásica', variable: '--font-playfair' },
  lato: { nombre: 'Lato', descripcion: 'Amigable y versátil', variable: '--font-lato' },
  poppins: { nombre: 'Poppins', descripcion: 'Redonda y actual', variable: '--font-poppins' },
  merriweather: { nombre: 'Merriweather', descripcion: 'Legible y clásica', variable: '--font-merriweather' },
} as const

export type FuenteKey = keyof typeof FUENTES

/**
 * Devuelve el plan efectivo del tenant.
 * Durante el período de prueba, todos los tenants tienen acceso Pro completo.
 */
export function getEffectivePlan(tenant: {
  plan: PlanType
  trial_ends_at: string | null
}): PlanType {
  if (tenant.trial_ends_at && new Date(tenant.trial_ends_at) > new Date()) {
    return 'pro'
  }
  return tenant.plan
}

/**
 * Días restantes de prueba. Devuelve 0 si el trial expiró o no existe.
 */
export function trialDaysLeft(trial_ends_at: string | null): number {
  if (!trial_ends_at) return 0
  const ms = new Date(trial_ends_at).getTime() - Date.now()
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)))
}
