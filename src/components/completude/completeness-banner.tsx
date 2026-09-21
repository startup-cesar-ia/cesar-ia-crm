import { TriangleAlert } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface CompletenessBannerProps {
  faltantes: string[]
  onCompletar?: () => void
  className?: string
}

/**
 * Faixa de aviso (não bloqueante) para cadastros provisórios.
 * Mostra o que falta e oferece o atalho para completar.
 */
export function CompletenessBanner({
  faltantes,
  onCompletar,
  className,
}: CompletenessBannerProps) {
  if (faltantes.length === 0) return null

  return (
    <div
      role="status"
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-warning/30 bg-warning/10 p-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning-deep">
          <TriangleAlert className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-semibold text-foreground">
            Cadastro incompleto
          </p>
          <p className="text-sm text-muted-foreground">
            Faltando: {faltantes.join(', ')}.
          </p>
        </div>
      </div>
      {onCompletar && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCompletar}
          className="shrink-0"
        >
          Completar
        </Button>
      )}
    </div>
  )
}
