import { CircleDashed } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/ui/tooltip'

interface CompletenessBadgeProps {
  faltantes: string[]
  className?: string
}

/**
 * Pílula que sinaliza um cadastro provisório/incompleto.
 * Não renderiza nada quando o registro está completo.
 */
export function CompletenessBadge({ faltantes, className }: CompletenessBadgeProps) {
  if (faltantes.length === 0) return null

  const detalhe = `Faltando: ${faltantes.join(', ')}`

  return (
    <Tooltip conteudo={detalhe}>
      <span
        aria-label={`Cadastro incompleto. ${detalhe}`}
        className={cn(
          'inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning-deep',
          className
        )}
      >
        <CircleDashed className="h-3.5 w-3.5" aria-hidden />
        Incompleto
      </span>
    </Tooltip>
  )
}
