'use client'

import { useEffect, useMemo } from 'react'
import { Arquivo } from '@/types'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  tipoDeArquivo,
  dataUrlBase64,
  base64ParaTexto,
  base64ParaBlob,
} from '@/lib/utils'
import { Download } from 'lucide-react'

interface PreviewArquivoProps {
  arquivo: Arquivo | null
  onClose: () => void
}

export function PreviewArquivo({ arquivo, onClose }: PreviewArquivoProps) {
  if (!arquivo) return null

  return (
    <Dialog
      open
      onClose={onClose}
      title={arquivo.nome}
      className="max-w-3xl"
    >
      <Conteudo key={arquivo.id} arquivo={arquivo} />
    </Dialog>
  )
}

function Conteudo({ arquivo }: { arquivo: Arquivo }) {
  const categoria = tipoDeArquivo(arquivo.tipo)
  const base64 = dataUrlBase64(arquivo.dados)

  const texto = categoria === 'texto' ? base64ParaTexto(base64) : null

  const pdfUrl = useMemo(() => {
    if (categoria !== 'pdf') return null
    return URL.createObjectURL(base64ParaBlob(base64, arquivo.tipo))
  }, [categoria, base64, arquivo.tipo])

  useEffect(() => {
    return () => {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    }
  }, [pdfUrl])

  return (
    <div className="min-h-[200px]">
      {categoria === 'imagem' && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={arquivo.dados}
          alt={arquivo.nome}
          className="mx-auto max-h-[70vh] rounded-lg object-contain"
        />
      )}

      {categoria === 'pdf' && pdfUrl && (
        <iframe
          src={pdfUrl}
          title={arquivo.nome}
          className="h-[70vh] w-full rounded-lg border border-border"
        />
      )}

      {categoria === 'texto' && (
        <pre className="max-h-[70vh] overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm text-foreground">
          {texto}
        </pre>
      )}

      {categoria === 'outros' && (
        <div className="flex flex-col items-center gap-4 py-6">
          <p className="text-sm text-muted-foreground">
            Prévia não disponível para este tipo de arquivo.
          </p>
          <a href={arquivo.dados} download={arquivo.nome}>
            <Button>
              <Download className="mr-2 h-4 w-4" /> Baixar arquivo
            </Button>
          </a>
        </div>
      )}
    </div>
  )
}
