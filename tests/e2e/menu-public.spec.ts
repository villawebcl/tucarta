import { test, expect } from '@playwright/test'

test.describe('Carta pública', () => {
  test('muestra 404 para un slug inexistente', async ({ page }) => {
    await page.goto('/menu/restaurante-que-no-existe-xyz-123')
    await expect(page.getByRole('heading', { name: /404/i })).toBeVisible()
  })

  test('tiene estructura correcta de accesibilidad', async ({ page }) => {
    // Asume que existe un tenant demo en el entorno de test
    await page.goto('/menu/demo')

    // Verificar que hay un heading principal
    await expect(page.locator('h1')).toBeVisible()

    // Verificar que la página tiene lang=es
    const lang = await page.getAttribute('html', 'lang')
    expect(lang).toBe('es')
  })
})
