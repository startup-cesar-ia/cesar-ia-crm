'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TooltipProps {
  conteudo: React.ReactNode
  children: React.ReactNode
  className?: string
}

/**
 * Tooltip leve, sem dependências: aparece no hover e no foco.
 * O elemento disparador recebe `aria-describedby` apontando para o balão.
 */
export function Tooltip({ conteudo, children, className }: TooltipProps) {
  const id = React.useId()

  return (
    <span className="group relative inline-flex">
      <span
        tabIndex={0}
        aria-describedby={id}
        className="inline-flex rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
      >
        {children}
      </span>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background opacity-0 shadow-soft-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100',
          className
        )}
      >
        {conteudo}
      </span>
    </span>
  )
}
