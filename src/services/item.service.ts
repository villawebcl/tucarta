import { createAdminClient } from '@/lib/supabase/server'
import { PLAN_LIMITS } from '@/lib/constants'
import type { Result, AppError, Item, CategoryWithItems } from '@/types'
import type { CreateItemInput, UpdateItemInput } from '@/lib/validations/item.schema'
import type { PlanType } from '@/types'

/**
 * Crea un nuevo item del menú, validando límites del plan.
 */
export async function createItem(
  tenantId: string,
  plan: PlanType,
  input: CreateItemInput
): Promise<Result<Item, AppError>> {
  const supabase = createAdminClient()
  const limit = PLAN_LIMITS[plan].maxItems

  if (limit !== Infinity) {
    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)

    if ((count ?? 0) >= limit) {
      return {
        success: false,
        error: {
          code: 'PLAN_LIMIT_REACHED',
          message: `Tu plan permite máximo ${limit} productos. Actualiza para agregar más.`,
        },
      }
    }
  }

  // Verificar que la categoría pertenece al tenant
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('id', input.category_id)
    .eq('tenant_id', tenantId)
    .single()

  if (!category) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Categoría no encontrada' },
    }
  }

  const { data, error } = await supabase
    .from('items')
    .insert({ ...input, tenant_id: tenantId })
    .select('*')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al crear el producto' },
    }
  }

  return { success: true, data }
}

/**
 * Obtiene todos los items de un tenant, opcionalmente filtrados por categoría.
 */
export async function getItemsByTenant(
  tenantId: string,
  options?: { categoryId?: string; onlyActive?: boolean }
): Promise<Result<Item[], AppError>> {
  const supabase = createAdminClient()

  let query = supabase
    .from('items')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('orden', { ascending: true })

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options?.onlyActive) {
    query = query.eq('activo', true)
  }

  const { data, error } = await query

  if (error) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al obtener los productos' },
    }
  }

  return { success: true, data: data ?? [] }
}

/**
 * Obtiene el menú completo de un tenant con categorías e items anidados.
 * Usado para renderizar la carta pública.
 */
export async function getPublicMenu(
  tenantId: string
): Promise<Result<CategoryWithItems[], AppError>> {
  const supabase = createAdminClient()

  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, nombre, orden')
    .eq('tenant_id', tenantId)
    .eq('activo', true)
    .order('orden', { ascending: true })

  if (catError) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al obtener el menú' },
    }
  }

  if (!categories || categories.length === 0) {
    return { success: true, data: [] }
  }

  const categoryIds = categories.map((c) => c.id)

  const { data: items, error: itemsError } = await supabase
    .from('items')
    .select('id, category_id, nombre, descripcion, precio, imagen_url, orden')
    .eq('tenant_id', tenantId)
    .eq('activo', true)
    .in('category_id', categoryIds)
    .order('orden', { ascending: true })

  if (itemsError) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al obtener los productos' },
    }
  }

  const categoriesWithItems: CategoryWithItems[] = categories.map((cat) => ({
    ...cat,
    items: (items ?? [])
      .filter((item) => item.category_id === cat.id)
      .map((item) => ({
        id: item.id,
        nombre: item.nombre,
        descripcion: item.descripcion,
        precio: item.precio,
        imagen_url: item.imagen_url,
        orden: item.orden,
      })),
  }))

  return { success: true, data: categoriesWithItems }
}

/**
 * Actualiza un item, verificando que pertenezca al tenant.
 */
export async function updateItem(
  tenantId: string,
  itemId: string,
  input: UpdateItemInput
): Promise<Result<Item, AppError>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('items')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .eq('tenant_id', tenantId)
    .select('*')
    .single()

  if (error || !data) {
    return {
      success: false,
      error: { code: 'NOT_FOUND', message: 'Producto no encontrado' },
    }
  }

  return { success: true, data }
}

/**
 * Elimina un item del menú.
 */
export async function deleteItem(
  tenantId: string,
  itemId: string
): Promise<Result<void, AppError>> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId)
    .eq('tenant_id', tenantId)

  if (error) {
    return {
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Error al eliminar el producto' },
    }
  }

  return { success: true, data: undefined }
}
