'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import {
  listarArquivosPaginado,
  uploadArquivo,
  excluirArquivo,
} from '@/lib/firebase-services'
import { Arquivo } from '@/types'
import { UploadArquivo } from '@/components/arquivos/upload'
import { ArquivoCard } from '@/components/arquivos/arquivo-card'
import { PreviewArquivo } from '@/components/arquivos/preview'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { FolderOpen } from 'lucide-react'
import { combinaTexto, useSearch } from '@/lib/search-context'
import { usePaginado } from '@/lib/use-paginado'
import { QueryDocumentSnapshot } from 'firebase/firestore'

export default function ArquivosPage() {
  const { query } = useSearch()
  const [preview, setPreview] = useState<Arquivo | null>(null)
  const [excluindo, setExcluindo] = useState<Arquivo | null>(null)

  const {
    itens: arquivos,
    carregando,
    temMais,
    carregarPrimeira,
    carregarMais,
  } = usePaginado<Arquivo, QueryDocumentSnapshot>((qtd, cursor) => {
    const user = auth.currentUser
    if (!user) return Promise.resolve({ itens: [], proximoCursor: null })
    return listarArquivosPaginado(user.uid, qtd, cursor)
  })

  useEffect(() => {
    carregarPrimeira()
  }, [carregarPrimeira])

  const handleUpload = async (files: File[]) => {
    const user = auth.currentUser
    if (!user) return
    for (const file of files) {
      await uploadArquivo(user.uid, file)
    }
    carregarPrimeira()
  }

  const confirmarExclusao = async () => {
    if (!excluindo) return
    await excluirArquivo(excluindo.id)
    setExcluindo(null)
    setPreview(null)
    carregarPrimeira()
  }

  const filtrados = arquivos.filter((a) => combinaTexto(a.nome, query))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <UploadArquivo onFiles={handleUpload} />
      </div>

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <FolderOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {query
              ? 'Nenhum arquivo encontrado.'
              : 'Nenhum arquivo ainda. Envie o primeiro!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((arquivo) => (
            <ArquivoCard
              key={arquivo.id}
              arquivo={arquivo}
              onAbrir={setPreview}
              onExcluir={setExcluindo}
            />
          ))}
        </div>
      )}

      {temMais && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={carregarMais} disabled={carregando}>
            Carregar mais
          </Button>
        </div>
      )}

      <PreviewArquivo arquivo={preview} onClose={() => setPreview(null)} />

      <ConfirmDialog
        open={!!excluindo}
        title="Excluir arquivo"
        description={excluindo ? `"${excluindo.nome}" será removido definitivamente.` : undefined}
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindo(null)}
      />
    </div>
  )
}
