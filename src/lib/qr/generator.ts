import QRCode from 'qrcode'

export type QRFormat = 'png' | 'svg' | 'dataurl'

export interface QROptions {
  /** Color del módulo QR (por defecto negro) */
  color?: string
  /** Color de fondo (por defecto blanco) */
  background?: string
  /** Tamaño en píxeles para PNG */
  size?: number
  /** Margen alrededor del QR (en módulos) */
  margin?: number
}

/**
 * Genera un código QR para la URL de la carta de un restaurante.
 *
 * @param slug - Slug único del restaurante
 * @param format - Formato de salida ('png' | 'svg' | 'dataurl')
 * @param options - Opciones de apariencia
 * @returns Buffer para PNG, string para SVG/dataurl
 */
export async function generateQR(
  slug: string,
  format: QRFormat = 'png',
  options: QROptions = {}
): Promise<Buffer | string> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tucarta.cl'
  const url = `${appUrl}/menu/${slug}`

  const qrOptions: QRCode.QRCodeToBufferOptions & QRCode.QRCodeToStringOptions = {
    errorCorrectionLevel: 'H', // Alta corrección para permitir logo superpuesto
    margin: options.margin ?? 2,
    color: {
      dark: options.color ?? '#000000',
      light: options.background ?? '#FFFFFF',
    },
    ...(format === 'png' && {
      width: options.size ?? 512,
    }),
  }

  switch (format) {
    case 'png':
      return QRCode.toBuffer(url, qrOptions)
    case 'svg':
      return QRCode.toString(url, { ...qrOptions, type: 'svg' })
    case 'dataurl':
      return QRCode.toDataURL(url, qrOptions)
    default:
      throw new Error(`Formato QR no soportado: ${format}`)
  }
}
