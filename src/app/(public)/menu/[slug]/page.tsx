import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { MenuPublic } from '@/components/menu/menu-public'
import { getTenantBySlug } from '@/services/tenant.service'
import { getPublicMenu } from '@/services/item.service'
import { sha256 } from '@/lib/utils/format'
import { createAdminClient } from '@/lib/supabase/server'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const result = await getTenantBySlug(slug)

  if (!result.success) {
    return { title: 'Carta no encontrada' }
  }

  return {
    title: `${result.data.nombre} — Carta digital`,
    description: `Consulta el menú de ${result.data.nombre} y haz tu pedido.`,
  }
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params

  const headersList = await headers()
  const tenantResult = await getTenantBySlug(slug)

  if (!tenantResult.success) {
    notFound()
  }

  const tenant = tenantResult.data
  const menuResult = await getPublicMenu(tenant.id)

  if (!menuResult.success) {
    notFound()
  }

  // Registrar scan en background (no bloquea el render)
  const userAgent = headersList.get('user-agent') ?? null
  const forwardedFor = headersList.get('x-forwarded-for') ?? ''
  const ip = forwardedFor.split(',')[0]?.trim() ?? 'unknown'

  // Fire-and-forget: no await para no bloquear el render
  sha256(ip).then(async (ipHash) => {
    const supabase = createAdminClient()
    await supabase.from('qr_scans').insert({
      tenant_id: tenant.id,
      user_agent: userAgent,
      ip_hash: ipHash,
    })
  })

  const colores = tenant.colores as { primario?: string; fondo?: string } | null

  return (
    <MenuPublic
      menu={{
        tenant: {
          id: tenant.id,
          slug: tenant.slug,
          nombre: tenant.nombre,
          logo_url: tenant.logo_url,
          colores: {
            primario: colores?.primario ?? '#FF6B35',
            fondo: colores?.fondo ?? '#FFFFFF',
          },
        },
        categories: menuResult.data,
      }}
    />
  )
}
