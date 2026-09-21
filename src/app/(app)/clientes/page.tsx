'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { listarClientesPaginado, excluirCliente } from '@/lib/firebase-services'
import { QueryDocumentSnapshot } from 'firebase/firestore'
import { Cliente } from '@/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ClienteCard } from '@/components/clientes/cliente-card'
import { avaliarCompletude } from '@/lib/completude'
import { usePaginado } from '@/lib/use-paginado'
import { CircleDashed, Plus, Search } from 'lucide-react'

export default function ClientesPage() {
  const { itens, carregando, temMais, carregarPrimeira, carregarMais } =
    usePaginado<Cliente, QueryDocumentSnapshot>((qtd, cursor) => {
      const user = auth.currentUser
      if (!user) return Promise.resolve({ itens: [], proximoCursor: null })
      return listarClientesPaginado(user.uid, qtd, cursor)
    })
  const [busca, setBusca] = useState('')
  const [somenteIncompletos, setSomenteIncompletos] = useState(false)
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

  const totalIncompletos = useMemo(
    () => itens.filter((c) => !avaliarCompletude('cliente', c).completa).length,
    [itens]
  )

  const clientesFiltrados = itens.filter((cliente) => {
    const casaBusca =
      cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(busca.toLowerCase()) ||
      cliente.empresa?.toLowerCase().includes(busca.toLowerCase())
    const casaFiltro =
      !somenteIncompletos || !avaliarCompletude('cliente', cliente).completa
    return casaBusca && casaFiltro
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-soft">
          <Button
            variant={somenteIncompletos ? 'ghost' : 'primary'}
            size="sm"
            onClick={() => setSomenteIncompletos(false)}
            className={somenteIncompletos ? 'text-muted-foreground' : ''}
          >
            Todos
          </Button>
          <Button
            variant={somenteIncompletos ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSomenteIncompletos(true)}
            className={somenteIncompletos ? '' : 'text-muted-foreground'}
          >
            <CircleDashed className="h-4 w-4" />
            Só incompletos
            {totalIncompletos > 0 && <span>({totalIncompletos})</span>}
          </Button>
        </div>

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
              {busca || somenteIncompletos
                ? 'Nenhum cliente encontrado para o filtro.'
                : 'Nenhum cliente cadastrado ainda.'}
            </p>
            {!busca && !somenteIncompletos && (
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
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onExcluir={(c) => setExcluindoId(c.id)}
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
