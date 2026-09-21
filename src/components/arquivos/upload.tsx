'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { TAMANHO_MAXIMO_ARQUIVO_BYTES } from '@/types'
import { formatarTamanho } from '@/lib/utils'

interface UploadArquivoProps {
  onFiles: (files: File[]) => Promise<void>
  rotulo?: string
}

export function UploadArquivo({
  onFiles,
  rotulo = 'Enviar arquivos',
}: UploadArquivoProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    const grande = files.find((f) => f.size > TAMANHO_MAXIMO_ARQUIVO_BYTES)
    if (grande) {
      setErro(
        `Este arquivo é grande (${formatarTamanho(grande.size)}). O limite é ${formatarTamanho(
          TAMANHO_MAXIMO_ARQUIVO_BYTES
        )}. Tente um arquivo menor ou um PDF mais leve.`
      )
      if (inputRef.current) inputRef.current.value = ''
      return
    }

    setEnviando(true)
    setErro(null)
    try {
      await onFiles(files)
    } catch {
      setErro('Erro ao enviar o arquivo. Tente novamente.')
    } finally {
      setEnviando(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleChange}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={enviando}>
        <Upload className="mr-2 h-4 w-4" />
        {enviando ? 'Enviando...' : rotulo}
      </Button>
      {erro && <p className="text-xs text-destructive">{erro}</p>}
    </div>
  )
}
