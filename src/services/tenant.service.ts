import { createAdminClient } from '@/lib/supabase/server'
import type { Result, AppError, Tenant } from '@/types'
import type { RegisterInput, UpdateTenantInput } from '@/lib/validations/tenant.schema'
import bcrypt from 'bcryptjs'
import { logger } from '@/lib/logger'

const BCRYPT_COST = 12

/**
 * Crea un nuevo tenant (restaurante) junto con su usuario owner.
 * Opera como transacción lógica: si falla la creación del usuario, no se crea el tenant.
 */
export async function createTenant(
  input: RegisterInput
): Promise<Result<{ tenantId: string; userId: string }, AppError>> {
  const supabase = createAdminClient()

  // Verificar que el slug no esté tomado
  const { data: existing } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', input.slug)
    .single()

  if (existing) {
    return {
      success: false,
      error: { code: 'DUPLICATE_SLUG', message: `El nombre de URL "${input.slug}" ya está en uso` },
    }
  }

  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .insert({ slug: input.slug, nombre: input.nombreRestaurant })
    .select('id')
    .single()

  if (tenantError || !tenant) {
    logger.error('create tenant failed', { slug: input.slug, err: tenantError?.message })
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: tenantError?.message ?? 'Error al crear el restaurante' },
    }
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_COST)

  const { data: user, error: userError } = await supabase
    .from('users')
    .insert({ tenant_id: tenant.id, email: input.email, password_hash: passwordHash })
    .select('id')
    .single()

  if (userError || !user) {
    // Rollback manual del tenant
    await supabase.from('tenants').delete().eq('id', tenant.id)
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al crear el usuario' },
    }
  }

  return { success: true, data: { tenantId: tenant.id, userId: user.id } }
}

/**
 * Obtiene un tenant por su slug. Usado en la carta pública.
 */
export async function getTenantBySlug(
  slug: string
): Promise<Result<Tenant, AppError>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('activo', true)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Restaurante no encontrado' },
    }
  }

  return { success: true, data }
}

/**
 * Obtiene un tenant por su ID.
 */
export async function getTenantById(
  tenantId: string
): Promise<Result<Tenant, AppError>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single()

  if (error || !data) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Restaurante no encontrado' },
    }
  }

  return { success: true, data }
}

/**
 * Actualiza datos del tenant. Solo puede actualizarse el propio tenant.
 */
export async function updateTenant(
  tenantId: string,
  input: UpdateTenantInput
): Promise<Result<Tenant, AppError>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('tenants')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', tenantId)
    .select('*')
    .single()

  if (error || !data) {
    logger.error('update tenant failed', { tenantId, err: error?.message, details: error?.details })
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: error?.message ?? 'Error al actualizar el restaurante' },
    }
  }

  return { success: true, data }
}
