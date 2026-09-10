'use client'

import { Wallet } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export default function FinanceiroPage() {
  return (
    <EmptyState
      icon={<Wallet className="h-10 w-10" />}
      title="Em breve"
      description="O módulo Financeiro será construído nas próximas etapas."
    />
  )
}
