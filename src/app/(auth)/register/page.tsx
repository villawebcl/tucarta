'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { slugify } from '@/lib/utils/format'

export default function RegisterPage() {
  const router = useRouter()

  const [values, setValues] = useState({
    email: '',
    password: '',
    nombreRestaurant: '',
    slug: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleNombreChange(nombre: string) {
    setValues((v) => ({
      ...v,
      nombreRestaurant: nombre,
      slug: slugify(nombre),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al crear la cuenta')
        return
      }

      // Auto-login con las credenciales recién creadas
      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: '/dashboard',
      })

      if (!result || result.error || !result.ok) {
        // La cuenta se creó pero el login falló — redirigir a login igual
        router.push('/login?registered=true')
        return
      }

      if (result.url) {
        window.location.href = result.url
        return
      }

      router.replace('/dashboard')
      router.refresh()
    } catch {
      setError('No se pudo crear la cuenta. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h1 className="mb-6 text-xl font-bold text-gray-900">Crear tu carta gratis</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          label="Nombre del restaurante"
          required
          value={values.nombreRestaurant}
          onChange={(e) => handleNombreChange(e.target.value)}
          placeholder="Las Empanadas de Don Pepe"
        />
        <Input
          label="URL de tu carta"
          required
          value={values.slug}
          onChange={(e) => setValues((v) => ({ ...v, slug: e.target.value }))}
          hint={`tucarta.cl/menu/${values.slug || 'tu-restaurante'}`}
          placeholder="las-empanadas-de-don-pepe"
        />
        <Input
          label="Email"
          type="email"
          required
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          placeholder="tu@email.com"
        />
        <Input
          label="Contraseña"
          type="password"
          required
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          placeholder="••••••••"
          hint="Mínimo 8 caracteres, una mayúscula y un número"
        />
        <Button type="submit" loading={loading} className="w-full">
          Crear mi carta gratis
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-medium text-brand-500 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </Card>
  )
}
