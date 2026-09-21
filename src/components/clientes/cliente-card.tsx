'use client'

import Link from 'next/link'
import { Mail, Phone, Trash2 } from 'lucide-react'
import { Cliente } from '@/types'
import { cn } from '@/lib/utils'
import { avaliarCompletude } from '@/lib/completude'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CompletenessBadge } from '@/components/completude/completeness-badge'
import { CampoVazio } from '@/components/completude/campo-vazio'

interface ClienteCardProps {
  cliente: Cliente
  onExcluir: (cliente: Cliente) => void
}

const CORES_AVATAR = [
  'bg-primary/10 text-primary',
  'bg-info/10 text-info',
  'bg-success/10 text-success',
  'bg-warning/15 text-warning-deep',
]

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return '?'
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase()
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase()
}

function corAvatar(nome: string): string {
  let soma = 0
  for (let i = 0; i < nome.length; i++) soma += nome.charCodeAt(i)
  return CORES_AVATAR[soma % CORES_AVATAR.length]
}

export function ClienteCard({ cliente, onExcluir }: ClienteCardProps) {
  const { faltantes } = avaliarCompletude('cliente', cliente)

  return (
    <Card className="group relative flex flex-col overflow-hidden transition-shadow hover:shadow-soft-lg">
      <CardContent className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
              corAvatar(cliente.nome)
            )}
          >
            {iniciais(cliente.nome)}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <CardTitle className="truncate text-base">
                  {cliente.nome}
                </CardTitle>
                <p className="truncate text-sm text-muted-foreground">
                  {cliente.empresa || 'Sem empresa'}
                </p>
              </div>
              <CompletenessBadge faltantes={faltantes} />
            </div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {cliente.email ? (
              <span className="truncate text-foreground">{cliente.email}</span>
            ) : (
              <CampoVazio label="E-mail não informado" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            {cliente.telefone ? (
              <span className="truncate text-foreground">{cliente.telefone}</span>
            ) : (
              <CampoVazio label="Telefone não informado" />
            )}
          </div>
        </div>

        {cliente.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cliente.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </CardContent>

      <div className="relative z-20 flex items-center justify-between border-t border-border px-5 py-2.5">
        <span className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
          Ver detalhes
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label={`Excluir ${cliente.nome}`}
          onClick={(e) => {
            e.preventDefault()
            onExcluir(cliente)
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <Link
        href={`/clientes/${cliente.id}`}
        aria-label={`Ver detalhes de ${cliente.nome}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
    </Card>
  )
}
