import { describe, it, expect } from 'vitest'
import { formatCLP, slugify, truncate } from '@/lib/utils/format'

describe('formatCLP', () => {
  it('formatea números como pesos chilenos', () => {
    expect(formatCLP(9990)).toBe('$9.990')
    expect(formatCLP(0)).toBe('$0')
    expect(formatCLP(1000000)).toBe('$1.000.000')
  })

  it('no incluye decimales', () => {
    expect(formatCLP(9990)).not.toContain(',')
  })
})

describe('slugify', () => {
  it('convierte texto a slug lowercase sin tildes', () => {
    expect(slugify('Las Empanadas de Don Pepe')).toBe('las-empanadas-de-don-pepe')
    expect(slugify('Café Señora Rosa')).toBe('cafe-senora-rosa')
  })

  it('reemplaza espacios con guiones', () => {
    expect(slugify('restaurante el sol')).toBe('restaurante-el-sol')
  })

  it('elimina caracteres especiales', () => {
    expect(slugify('La Parrilla & Grill!')).toBe('la-parrilla-grill')
  })

  it('trunca a 50 caracteres', () => {
    const longText = 'a'.repeat(60)
    expect(slugify(longText).length).toBeLessThanOrEqual(50)
  })
})

describe('truncate', () => {
  it('trunca texto largo con ellipsis', () => {
    expect(truncate('Texto muy largo que supera el límite', 20)).toBe('Texto muy largo qu...')
  })

  it('devuelve el texto completo si es menor al límite', () => {
    expect(truncate('Texto corto', 50)).toBe('Texto corto')
  })
})
