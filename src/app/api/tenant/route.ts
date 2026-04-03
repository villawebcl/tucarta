import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { getTenantById } from '@/services/tenant.service'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'No autorizado', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const result = await getTenantById(session.user.tenantId)

  if (!result.success) {
    return NextResponse.json({ error: result.error.message, code: result.error.code }, { status: 404 })
  }

  // Nunca exponer password_hash ni datos sensibles
  const { ...tenant } = result.data
  return NextResponse.json({ data: tenant })
}
