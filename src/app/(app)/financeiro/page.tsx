'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import {
  listarTransacoesPaginado,
  criarTransacao,
  atualizarTransacao,
  excluirTransacao,
  listarClientes,
} from '@/lib/firebase-services'
import { Timestamp, QueryDocumentSnapshot } from 'firebase/firestore'
import { Transacao, Cliente, TipoTransacao, StatusTransacao, CATEGORIAS_RECEITA, CATEGORIAS_DESPESA } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, Edit, Wallet, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import { format } from 'date-fns'
import { formatarData } from '@/lib/date'
import { combinaTexto, useSearch } from '@/lib/search-context'
import { usePaginado } from '@/lib/use-paginado'

const formVazio = {
  tipo: 'receita' as TipoTransacao,
  descricao: '',
  valor: '',
  data: format(new Date(), 'yyyy-MM-dd'),
  categoria: 'Vendas',
  clienteId: '',
  status: 'pendente' as StatusTransacao,
}

function formatarValor(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export default function FinanceiroPage() {
  const { query } = useSearch()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [formData, setFormData] = useState(formVazio)

  const { itens: transacoes, carregando, temMais, carregarPrimeira, carregarMais } =
    usePaginado<Transacao, QueryDocumentSnapshot>((qtd, cursor) => {
      const user = auth.currentUser
      if (!user) return Promise.resolve({ itens: [], proximoCursor: null })
      return listarTransacoesPaginado(user.uid, qtd, cursor)
    })

  const carregarClientes = async () => {
    const user = auth.currentUser
    if (!user) return
    setClientes(await listarClientes(user.uid))
  }

  useEffect(() => {
    carregarPrimeira()
    carregarClientes() // eslint-disable-line react-hooks/set-state-in-effect
  }, [carregarPrimeira])

  const categoriasDisponiveis =
    formData.tipo === 'receita' ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  const abrirNovo = () => {
    setEditandoId(null)
    setFormData(formVazio)
    setMostrarForm(true)
  }

  const abrirEdicao = (transacao: Transacao) => {
    setEditandoId(transacao.id)
    setFormData({
      tipo: transacao.tipo,
      descricao: transacao.descricao,
      valor: String(transacao.valor),
      data: format(transacao.data.toDate(), 'yyyy-MM-dd'),
      categoria: transacao.categoria,
      clienteId: transacao.clienteId || '',
      status: transacao.status,
    })
    setMostrarForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) return

    const dados = {
      tipo: formData.tipo,
      descricao: formData.descricao,
      valor: Number(formData.valor) || 0,
      data: Timestamp.fromDate(new Date(formData.data)),
      categoria: formData.categoria,
      clienteId: formData.clienteId || undefined,
      status: formData.status,
    }

    if (editandoId) {
      await atualizarTransacao(editandoId, dados)
    } else {
      await criarTransacao({ ...dados, usuarioId: user.uid })
    }

    setMostrarForm(false)
    setEditandoId(null)
    setFormData(formVazio)
    carregarPrimeira()
  }

  const confirmarExclusao = async () => {
    if (!excluindoId) return
    await excluirTransacao(excluindoId)
    setExcluindoId(null)
    carregarPrimeira()
  }

  const filtradas = transacoes.filter(
    (t) =>
      combinaTexto(t.descricao, query) &&
      combinaTexto(t.categoria, query) &&
      combinaTexto(t.status, query) &&
      combinaTexto(t.tipo, query)
  )

  const totalReceitas = transacoes
    .filter((t) => t.tipo === 'receita' && t.status === 'pago')
    .reduce((soma, t) => soma + t.valor, 0)
  const totalDespesas = transacoes
    .filter((t) => t.tipo === 'despesa' && t.status === 'pago')
    .reduce((soma, t) => soma + t.valor, 0)
  const saldo = totalReceitas - totalDespesas

  const kpis = [
    {
      label: 'Receitas',
      valor: formatarValor(totalReceitas),
      icon: <TrendingUp className="h-5 w-5" />,
      cor: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Despesas',
      valor: formatarValor(totalDespesas),
      icon: <TrendingDown className="h-5 w-5" />,
      cor: 'text-destructive',
      bg: 'bg-destructive/10',
    },
    {
      label: 'Saldo',
      valor: formatarValor(saldo),
      icon: <ArrowLeftRight className="h-5 w-5" />,
      cor: 'text-primary',
      bg: 'bg-primary/10',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.label} padded>
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bg} ${kpi.cor}`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground">{kpi.valor}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" /> Nova Transação
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {editandoId ? 'Editar Transação' : 'Nova Transação'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) => {
                      const tipo = e.target.value as TipoTransacao
                      setFormData((prev) => ({
                        ...prev,
                        tipo,
                        categoria:
                          tipo === 'receita' ? 'Vendas' : 'Fornecedores',
                      }))
                    }}
                  >
                    <option value="receita">Receita</option>
                    <option value="despesa">Despesa</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valor">Valor (R$) *</Label>
                  <Input
                    id="valor"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, valor: e.target.value }))
                    }
                    placeholder="0,00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, descricao: e.target.value }))
                  }
                  placeholder="Descrição da transação"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data">Data *</Label>
                  <Input
                    id="data"
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, data: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select
                    id="categoria"
                    value={formData.categoria}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, categoria: e.target.value }))
                    }
                  >
                    {categoriasDisponiveis.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="clienteId">Cliente</Label>
                  <Select
                    id="clienteId"
                    value={formData.clienteId}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, clienteId: e.target.value }))
                    }
                  >
                    <option value="">Selecionar cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as StatusTransacao,
                      }))
                    }
                  >
                    <option value="pendente">Pendente</option>
                    <option value="pago">Pago</option>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setMostrarForm(false)
                    setEditandoId(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  {editandoId ? 'Atualizar' : 'Salvar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      ) : filtradas.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Wallet className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">
              {query
                ? 'Nenhuma transação para o filtro.'
                : 'Nenhuma transação cadastrada ainda.'}
            </p>
            <Button className="mt-4" onClick={abrirNovo}>
              <Plus className="mr-2 h-4 w-4" /> Registrar primeira transação
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtradas.map((transacao) => {
            const cliente = clientes.find((c) => c.id === transacao.clienteId)
            const receita = transacao.tipo === 'receita'
            return (
              <Card key={transacao.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                        receita ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {receita ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">
                        {transacao.descricao}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {transacao.categoria} · {formatarData(transacao.data)}
                        {cliente ? ` · ${cliente.nome}` : ''}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge variant={transacao.status === 'pago' ? 'success' : 'warning'}>
                      {transacao.status === 'pago' ? 'Pago' : 'Pendente'}
                    </Badge>
                    <span
                      className={`text-sm font-semibold ${
                        receita ? 'text-success' : 'text-destructive'
                      }`}
                    >
                      {receita ? '+' : '-'} {formatarValor(transacao.valor)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Editar transação"
                        onClick={() => abrirEdicao(transacao)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Excluir transação"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setExcluindoId(transacao.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
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
        title="Excluir transação"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindoId(null)}
      />
    </div>
  )
}
