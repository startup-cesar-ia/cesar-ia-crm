import Link from 'next/link'
import { Home } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <EmptyState
        icon={<Home className="h-10 w-10" />}
        title="Página não encontrada"
        description="O endereço que você tentou acessar não existe ou foi movido."
        action={
          <Link href="/dashboard">
            <Button>Ir para o dashboard</Button>
          </Link>
        }
      />
    </div>
  )
}
