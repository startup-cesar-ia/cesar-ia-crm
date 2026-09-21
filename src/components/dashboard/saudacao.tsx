'use client'

import { useEffect, useState } from 'react'
import { Sun, Sunset, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Nome exibido na saudação. Uso single-user (André). Para multiusuário,
 * trocar por `auth.currentUser?.displayName`.
 */
const NOME_EXIBICAO = 'André'

export function saudacaoPorHora(hora: number): string {
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function IconePeriodo({ hora }: { hora: number }) {
  if (hora < 12) return <Sun className="h-4 w-4 text-primary" aria-hidden />
  if (hora < 18) return <Sunset className="h-4 w-4 text-primary" aria-hidden />
  return <Moon className="h-4 w-4 text-primary" aria-hidden />
}

function formatarHora(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(data)
}

export function Saudacao({ className }: { className?: string }) {
  const [agora, setAgora] = useState<Date | null>(null)

  useEffect(() => {
    setAgora(new Date()) // eslint-disable-line react-hooks/set-state-in-effect
    const id = setInterval(() => setAgora(new Date()), 30000)
    return () => clearInterval(id)
  }, [])

  const hora = agora?.getHours() ?? 0

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 text-sm text-muted-foreground',
        className
      )}
    >
      <p className="flex items-center gap-2">
        <IconePeriodo hora={hora} />
        {agora ? `${saudacaoPorHora(hora)}, ${NOME_EXIBICAO}` : '\u00A0'}
      </p>
      {agora && (
        <time
          dateTime={agora.toISOString()}
          className="tabular-nums text-muted-foreground"
        >
          {formatarHora(agora)}
        </time>
      )}
    </div>
  )
}
