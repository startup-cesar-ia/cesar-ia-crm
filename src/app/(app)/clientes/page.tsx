'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { listarClientesPaginado, excluirCliente } from '@/lib/firebase-services'
import { QueryDocumentSnapshot } from 'firebase/firestore'
import { Cliente } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { usePaginado } from '@/lib/use-paginado'
import { Plus, Search, Trash2, Eye } from 'lucide-react'

export default function ClientesPage() {
  const { itens, carregando, temMais, carregarPrimeira, carregarMais } =
    usePaginado<Cliente, QueryDocumentSnapshot>((qtd, cursor) => {
      const user = auth.currentUser
      if (!user) return Promise.resolve({ itens: [], proximoCursor: null })
      return listarClientesPaginado(user.uid, qtd, cursor)
    })
  const [busca, setBusca] = useState('')
  const [excluindoId, setExcluindoId] = useState<string | null>(null)

  useEffect(() => {
    carregarPrimeira()
  }, [carregarPrimeira])

  const confirmarExclusao = async () => {
    if (!excluindoId) return
    await excluirCliente(excluindoId)
    setExcluindoId(null)
    carregarPrimeira()
  }

  const clientesFiltrados = itens.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.empresa?.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Link href="/clientes/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou empresa..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              {busca
                ? 'Nenhum cliente encontrado para a busca.'
                : 'Nenhum cliente cadastrado ainda.'}
            </p>
            {!busca && (
              <Link href="/clientes/novo">
                <Button className="mt-4 bg-primary hover:bg-primary-hover text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar primeiro cliente
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clientesFiltrados.map((cliente) => (
            <Card key={cliente.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{cliente.nome}</CardTitle>
                    {cliente.empresa && (
                      <p className="text-sm text-muted-foreground">
                        {cliente.empresa}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Link href={`/clientes/${cliente.id}`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                      onClick={() => setExcluindoId(cliente.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {cliente.email && (
                    <p className="text-muted-foreground">{cliente.email}</p>
                  )}
                  {cliente.telefone && (
                    <p className="text-muted-foreground">{cliente.telefone}</p>
                  )}
                  {cliente.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-2">
                      {cliente.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
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
        title="Excluir cliente"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindoId(null)}
      />
    </div>
  )
}
