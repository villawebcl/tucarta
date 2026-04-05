import sharp from 'sharp'
import { createAdminClient } from '@/lib/supabase/server'
import {
  MAX_IMAGE_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  IMAGE_MAX_DIMENSION,
  IMAGE_QUALITY,
  BANNER_WIDTH,
  BANNER_HEIGHT,
} from '@/lib/constants'
import type { Result, AppError } from '@/types'
import { logger } from '@/lib/logger'

// Magic bytes para validar tipo MIME real (no confiar solo en la extensión)
const MAGIC_BYTES: Record<string, Uint8Array> = {
  'image/jpeg': new Uint8Array([0xff, 0xd8, 0xff]),
  'image/png': new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
  'image/webp': new Uint8Array([0x52, 0x49, 0x46, 0x46]),
}

const BUCKET = 'item-images'

/**
 * Crea el bucket de Storage si no existe.
 * Lo marca como público para que las URLs sean accesibles sin auth.
 */
async function ensureBucket(supabase: ReturnType<typeof createAdminClient>): Promise<void> {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    fileSizeLimit: MAX_IMAGE_SIZE_BYTES,
  })
  // Ignorar error si el bucket ya existe
  if (error && !error.message.includes('already exists')) {
    logger.error('ensureBucket failed', { error: error.message })
  }
}

/**
 * Detecta el tipo MIME real de un buffer comparando magic bytes.
 */
function detectMimeType(buffer: Buffer): string | null {
  for (const [mimeType, magic] of Object.entries(MAGIC_BYTES)) {
    const slice = buffer.subarray(0, magic.length)
    if (magic.every((byte, i) => slice[i] === byte)) {
      return mimeType
    }
  }
  return null
}

/**
 * Sube una imagen al Supabase Storage después de validarla y optimizarla con Sharp.
 *
 * Validaciones:
 * - Tamaño máximo: 2MB
 * - Tipo MIME real validado con magic bytes (no la extensión)
 * - Solo JPEG, PNG y WebP
 * - Resize a máximo 800x800px manteniendo aspect ratio
 * - Convertido a WebP con calidad 80
 */
export async function uploadImage(
  tenantId: string,
  file: File
): Promise<Result<{ url: string; path: string }, AppError>> {
  // Validar tamaño
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message: 'La imagen no puede superar 2MB' },
    }
  }

  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // Validar tipo MIME real con magic bytes
  const detectedMime = detectMimeType(inputBuffer)
  if (!detectedMime || !ALLOWED_IMAGE_TYPES.includes(detectedMime as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.',
      },
    }
  }

  // Procesar con Sharp: resize + convertir a WebP
  const processedBuffer = await sharp(inputBuffer)
    .resize(IMAGE_MAX_DIMENSION, IMAGE_MAX_DIMENSION, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer()

  // Nombre seguro: nunca usar el nombre original del usuario
  const { randomUUID } = await import('crypto')
  const fileName = `${randomUUID()}.webp`
  const storagePath = `${tenantId}/${fileName}`

  const supabase = createAdminClient()
  await ensureBucket(supabase)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, processedBuffer, {
      contentType: 'image/webp',
      upsert: false,
    })

  if (uploadError) {
    logger.error('uploadImage storage error', { tenantId, error: uploadError.message })
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message: `Error al subir la imagen: ${uploadError.message}` },
    }
  }

  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)

  return {
    success: true,
    data: { url: publicUrl.publicUrl, path: storagePath },
  }
}

/**
 * Sube la imagen de portada (banner 3:1) al Supabase Storage.
 * Sobreescribe cualquier portada previa del tenant.
 */
export async function uploadBanner(
  tenantId: string,
  file: File
): Promise<Result<{ url: string; path: string }, AppError>> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message: 'La imagen no puede superar 2MB' },
    }
  }

  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  const detectedMime = detectMimeType(inputBuffer)
  if (!detectedMime || !ALLOWED_IMAGE_TYPES.includes(detectedMime as typeof ALLOWED_IMAGE_TYPES[number])) {
    return {
      success: false,
      error: {
        code: 'UPLOAD_ERROR',
        message: 'Tipo de archivo no permitido. Solo se aceptan JPEG, PNG y WebP.',
      },
    }
  }

  const processedBuffer = await sharp(inputBuffer)
    .resize(BANNER_WIDTH, BANNER_HEIGHT, { fit: 'cover' })
    .webp({ quality: IMAGE_QUALITY })
    .toBuffer()

  const storagePath = `${tenantId}/portada.webp`
  const supabase = createAdminClient()
  await ensureBucket(supabase)

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, processedBuffer, {
      contentType: 'image/webp',
      upsert: true,
    })

  if (uploadError) {
    logger.error('uploadBanner storage error', { tenantId, error: uploadError.message })
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message: `Error al subir la portada: ${uploadError.message}` },
    }
  }

  // Forzar cache-bust añadiendo timestamp al URL
  const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(storagePath)
  const url = `${publicUrl.publicUrl}?t=${Date.now()}`

  return { success: true, data: { url, path: storagePath } }
}

/**
 * Elimina una imagen del Supabase Storage.
 */
export async function deleteImage(
  tenantId: string,
  path: string
): Promise<Result<void, AppError>> {
  // Verificar que el path pertenece al tenant (previene path traversal)
  if (!path.startsWith(`${tenantId}/`)) {
    return {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'No tienes permiso para eliminar esta imagen' },
    }
  }

  const supabase = createAdminClient()

  const { error } = await supabase.storage.from(BUCKET).remove([path])

  if (error) {
    return {
      success: false,
      error: { code: 'UPLOAD_ERROR', message: 'Error al eliminar la imagen' },
    }
  }

  return { success: true, data: undefined }
}
