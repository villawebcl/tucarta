import { createAdminClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Result, AppError, Category } from '@/types'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  ReorderCategoriesInput,
} from '@/lib/validations/category.schema'
import type { PlanType } from '@/types'

/**
 * Crea una nueva categoría, validando el límite del plan.
 */
export async function createCategory(
  tenantId: string,
  plan: PlanType,
  input: CreateCategoryInput
): Promise<Result<Category, AppError>> {
  const supabase = createAdminClient()
  const limit = PLAN_LIMITS[plan].maxCategories

  if (limit !== Infinity) {
    const { count } = await supabase
      .from('categories')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    if ((count ?? 0) >= limit) {
      return {
        success: false,
        error: {
          code: 'PLAN_LIMIT_REACHED',
          message: `Tu plan permite máximo ${limit} categorías. Actualiza para agregar más.`,
        },
      }
    }
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({ ...input, tenant_id: tenantId })
    .select('*')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al crear la categoría' },
    }
  }

  return { success: true, data }
}

/**
 * Obtiene todas las categorías activas de un tenant, ordenadas.
 */
export async function getCategoriesByTenant(
  tenantId: string,
  onlyActive = false
): Promise<Result<Category[], AppError>> {
  const supabase = createAdminClient()

  let query = supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('orden', { ascending: true })

  if (onlyActive) {
    query = query.eq('activo', true)
  }

  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al obtener las categorías' },
    }
  }

  return { success: true, data: data ?? [] }
}

/**
 * Actualiza una categoría, verificando que pertenezca al tenant.
 */
export async function updateCategory(
  tenantId: string,
  categoryId: string,
  input: UpdateCategoryInput
): Promise<Result<Category, AppError>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)
    .select('*')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Categoría no encontrada' },
    }
  }

  return { success: true, data }
}

/**
 * Elimina una categoría. Los items asociados son eliminados por CASCADE en la DB.
 */
export async function deleteCategory(
  tenantId: string,
  categoryId: string
): Promise<Result<void, AppError>> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId)
    .eq('tenant_id', tenantId)

  if (error) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al eliminar la categoría' },
    }
  }

  return { success: true, data: undefined }
}

/**
 * Reordena categorías en lote.
 */
export async function reorderCategories(
  tenantId: string,
  input: ReorderCategoriesInput
): Promise<Result<void, AppError>> {
  const supabase = createAdminClient()

  const updates = input.categories.map(({ id, orden }) =>
    supabase
      .from('categories')
      .update({ orden })
      .eq('id', id)
      .eq('tenant_id', tenantId)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)

  if (failed?.error) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al reordenar las categorías' },
    }
  }

  return { success: true, data: undefined }
}
