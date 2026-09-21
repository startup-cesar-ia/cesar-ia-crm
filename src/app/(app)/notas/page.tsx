'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { listarNotasPaginado, excluirNota } from '@/lib/firebase-services'
import { Nota } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Plus, Trash2, FileText } from 'lucide-react'
import { formatarData } from '@/lib/date'
import { combinaTexto, useSearch } from '@/lib/search-context'
import { usePaginado } from '@/lib/use-paginado'
import { QueryDocumentSnapshot } from 'firebase/firestore'

function htmlParaTexto(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export default function NotasPage() {
  const { query } = useSearch()
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  const {
    itens: notas,
    carregando,
    temMais,
    carregarPrimeira,
    carregarMais,
  } = usePaginado<Nota, QueryDocumentSnapshot>((qtd, cursor) => {
    const user = auth.currentUser
    if (!user) return Promise.resolve({ itens: [], proximoCursor: null })
    return listarNotasPaginado(user.uid, qtd, cursor)
  })

  useEffect(() => {
    carregarPrimeira()
  }, [carregarPrimeira])

  const confirmarExclusao = async () => {
    if (!excluindoId) return
    await excluirNota(excluindoId)
    setExcluindoId(null)
    carregarPrimeira()
  }

  const filtradas = notas.filter(
    (n) =>
      combinaTexto(n.titulo, query) &&
      combinaTexto(htmlParaTexto(n.conteudo), query)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Link href="/notas/nova">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Nova Nota
          </Button>
        </Link>
      </div>

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {query ? 'Nenhuma nota encontrada.' : 'Nenhuma nota ainda. Crie a primeira!'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((nota) => (
            <Card key={nota.id} className="transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link href={`/notas/${nota.id}`} className="min-w-0 flex-1">
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {nota.titulo}
                    </h3>
                    <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                      {htmlParaTexto(nota.conteudo) || 'Sem conteúdo'}
                    </p>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Atualizada em {formatarData(nota.atualizadoEm)}
                    </p>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                    aria-label="Excluir nota"
                    onClick={() => setExcluindoId(nota.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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

      <ConfirmDialog
        open={!!excluindoId}
        title="Excluir nota"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindoId(null)}
      />
    </div>
  )
}
