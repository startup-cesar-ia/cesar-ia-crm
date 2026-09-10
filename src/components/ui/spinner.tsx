import { cn } from '@/lib/utils'

interface SpinnerProps {
  className?: string
  size?: number
}

export function Spinner({ className, size = 32 }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      style={{ width: size, height: size }}
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-muted border-t-primary',
        className
      )}
    />
  )
}
