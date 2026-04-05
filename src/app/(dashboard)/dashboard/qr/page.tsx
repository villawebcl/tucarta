import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'
import { generateQR } from '@/lib/qr/generator'
import { QRPreview } from '@/components/dashboard/qr-preview'
import { Card } from '@/components/ui/card'

export default async function QRPage() {
  const session = await auth()
  if (!session?.user) return null

  const tenantResult = await getTenantById(session.user.tenantId)
  if (!tenantResult.success) return null

  const { slug } = tenantResult.data
  const qrDataUrl = await generateQR(slug, 'dataurl') as string

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Tu código QR</h1>

      <Card>
        <QRPreview slug={slug} qrDataUrl={qrDataUrl} />
      </Card>

      <div className="rounded-xl bg-brand-50 p-4 text-sm text-brand-700">
        <p className="font-medium">Cómo usar tu QR:</p>
        <ol className="mt-2 list-decimal space-y-1 pl-4">
          <li>Descarga el código QR en PNG</li>
          <li>Imprímelo y ponlo en las mesas de tu local</li>
          <li>Los clientes lo escanean y ven tu carta en el celular</li>
        </ol>
      </div>
    </div>
  )
}
