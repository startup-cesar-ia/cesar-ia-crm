'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: DialogProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-desc' : undefined}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-soft-lg',
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <h2
            id="dialog-title"
            className="pr-8 text-lg font-semibold text-foreground"
          >
            {title}
          </h2>
        )}
        {description && (
          <p id="dialog-desc" className="mt-1 text-sm text-muted-foreground">
            {description}
          </p>
        )}

        <div className={cn(title || description ? 'mt-5' : '')}>{children}</div>
      </div>
    </div>
  )
}
