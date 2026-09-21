'use client'

import { Arquivo } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Image as ImageIcon, File, Trash2 } from 'lucide-react'
import { formatarData } from '@/lib/date'
import { formatarTamanho, tipoDeArquivo } from '@/lib/utils'

interface ArquivoCardProps {
  arquivo: Arquivo
  onAbrir: (arquivo: Arquivo) => void
  onExcluir: (arquivo: Arquivo) => void
}

function IconeArquivo({ mime }: { mime: string }) {
  const categoria = tipoDeArquivo(mime)
  if (categoria === 'imagem') return <ImageIcon className="h-6 w-6 text-info" />
  if (categoria === 'pdf') return <FileText className="h-6 w-6 text-destructive" />
  if (categoria === 'texto') return <FileText className="h-6 w-6 text-success" />
  return <File className="h-6 w-6 text-muted-foreground" />
}

export function ArquivoCard({ arquivo, onAbrir, onExcluir }: ArquivoCardProps) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => onAbrir(arquivo)}
            aria-label={`Abrir ${arquivo.nome}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted"
          >
            <IconeArquivo mime={arquivo.tipo} />
          </button>

          <button
            type="button"
            onClick={() => onAbrir(arquivo)}
            className="min-w-0 flex-1 text-left"
          >
            <p className="truncate text-sm font-medium text-foreground">
              {arquivo.nome}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatarTamanho(arquivo.tamanho)} ·{' '}
              {formatarData(arquivo.criadoEm)}
            </p>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
            aria-label="Excluir arquivo"
            onClick={() => onExcluir(arquivo)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
