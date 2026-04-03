import { z } from 'zod'

export const createCategorySchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(80, 'El nombre no puede exceder 80 caracteres'),
  orden: z.number().int().min(0).optional().default(0),
  activo: z.boolean().optional().default(true),
})

export const updateCategorySchema = createCategorySchema.partial()

export const reorderCategoriesSchema = z.object({
  categories: z.array(
    z.object({
      id: z.string().uuid(),
      orden: z.number().int().min(0),
    })
  ),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>
