import { Badge } from '@/components/ui/badge'
import type { PlanType } from '@/types'

interface PlanBadgeProps {
  plan: PlanType
}

const planConfig: Record<PlanType, { label: string; variant: 'default' | 'success' | 'info' }> = {
  free: { label: 'Gratis', variant: 'default' },
  basico: { label: 'Básico', variant: 'success' },
  pro: { label: 'Pro', variant: 'info' },
}

export function PlanBadge({ plan }: PlanBadgeProps) {
  const { label, variant } = planConfig[plan]
  return <Badge variant={variant}>{label}</Badge>
}
