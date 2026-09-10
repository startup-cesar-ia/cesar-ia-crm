'use client'

import { Settings } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export default function ConfiguracoesPage() {
  return (
    <EmptyState
      icon={<Settings className="h-10 w-10" />}
      title="Em breve"
      description="As configurações do sistema serão construídas nas próximas etapas."
    />
  )
}
