import { PlusCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CampoVazioProps {
  label?: string
  className?: string
}

/**
 * Placeholder para campos não informados, com afordância de "completar".
 */
export function CampoVazio({ label = 'Não informado', className }: CampoVazioProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm text-muted-foreground/70',
        className
      )}
    >
      <PlusCircle className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  )
}
