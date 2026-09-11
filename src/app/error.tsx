'use client'

import { useEffect } from 'react'
import { AlertTriangle } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <EmptyState
        icon={<AlertTriangle className="h-10 w-10" />}
        title="Algo deu errado"
        description="Ocorreu um erro inesperado. Você pode tentar novamente."
        action={
          <Button onClick={reset}>Tentar novamente</Button>
        }
      />
    </div>
  )
}
