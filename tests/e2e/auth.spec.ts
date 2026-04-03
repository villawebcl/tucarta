import { test, expect } from '@playwright/test'

test.describe('Autenticación', () => {
  test('muestra formulario de login', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/contraseña/i)).toBeVisible()
  })

  test('muestra error con credenciales inválidas', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel(/email/i).fill('noexiste@test.com')
    await page.getByLabel(/contraseña/i).fill('Contraseña123')
    await page.getByRole('button', { name: /iniciar sesión/i }).click()
    await expect(page.getByRole('alert')).toContainText(/email o contraseña/i)
  })

  test('redirige al dashboard rutas protegidas sin sesión', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/login/)
  })
})
