import { z } from 'zod'

export const slugSchema = z
  .string()
  .min(3, 'El slug debe tener al menos 3 caracteres')
  .max(50, 'El slug no puede exceder 50 caracteres')
  .regex(/^[a-z0-9-]+$/, 'Solo letras minúsculas, números y guiones')

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  nombreRestaurant: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  slug: slugSchema,
})

export const updateTenantSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  descripcion: z
    .string()
    .max(200, 'La descripción no puede exceder 200 caracteres')
    .nullable()
    .optional(),
  portada_url: z.string().url('URL de portada inválida').nullable().optional(),
  colores: z
    .object({
      primario: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
      fondo: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color hexadecimal inválido'),
      fuente: z
        .enum(['inter', 'playfair', 'lato', 'poppins', 'merriweather'])
        .optional(),
      layout: z.enum(['lista', 'grilla']).optional(),
    })
    .optional(),
  redes_sociales: z
    .object({
      instagram: z.string().max(50, 'Máximo 50 caracteres').optional(),
      telefono: z.string().max(20, 'Máximo 20 caracteres').optional(),
      direccion: z.string().max(150, 'Máximo 150 caracteres').optional(),
    })
    .nullable()
    .optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
