import { z } from 'zod'

export const createItemSchema = z.object({
  nombre: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional()
    .nullable(),
  precio: z
    .number()
    .int('El precio debe ser un número entero en CLP')
    .min(0, 'El precio no puede ser negativo')
    .max(99_999_999, 'Precio fuera de rango'),
  category_id: z.string().uuid('ID de categoría inválido'),
  activo: z.boolean().optional().default(true),
  orden: z.number().int().min(0).optional().default(0),
  destacado: z.boolean().optional().default(false),
  popular: z.boolean().optional().default(false),
})

export const updateItemSchema = createItemSchema.partial().omit({ category_id: true }).extend({
  category_id: z.string().uuid('ID de categoría inválido').optional(),
})

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema>
