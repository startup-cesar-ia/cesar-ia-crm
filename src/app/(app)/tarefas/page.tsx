'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import {
  listarTarefasPaginado,
  criarTarefa,
  atualizarTarefa,
  excluirTarefa,
  listarClientes,
} from '@/lib/firebase-services'
import { Timestamp, QueryDocumentSnapshot } from 'firebase/firestore'
import { Tarefa, Cliente } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { CompletenessBadge } from '@/components/completude/completeness-badge'
import { Plus, Trash2, Edit, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { formatarData } from '@/lib/date'
import { avaliarCompletude } from '@/lib/completude'
import { combinaTexto, useSearch } from '@/lib/search-context'
import { usePaginado } from '@/lib/use-paginado'

type StatusKanban = 'backlog' | 'todo' | 'doing' | 'done'

const colunas: { id: StatusKanban; titulo: string; cor: string }[] = [
  { id: 'backlog', titulo: 'A Fazer', cor: 'bg-muted/60' },
  { id: 'todo', titulo: 'Aguardando', cor: 'bg-warning/10' },
  { id: 'doing', titulo: 'Em Andamento', cor: 'bg-info/10' },
  { id: 'done', titulo: 'Concluído', cor: 'bg-success/10' },
]

const formVazio = {
  titulo: '',
  descricao: '',
  prazo: '',
  prioridade: 'media' as 'baixa' | 'media' | 'alta',
  clienteId: '',
  status: 'todo' as StatusKanban,
}

export default function TarefasPage() {
  const { query } = useSearch()
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [tarefaArrastando, setTarefaArrastando] = useState<string | null>(null)
  const [formData, setFormData] = useState(formVazio)

  const {
    itens: tarefas,
    carregando,
    temMais,
    carregarPrimeira,
    carregarMais,
  } = usePaginado<Tarefa, QueryDocumentSnapshot>((qtd, cursor) => {
    const user = auth.currentUser
    if (!user) return Promise.resolve({ itens: [], proximoCursor: null })
    return listarTarefasPaginado(user.uid, qtd, cursor)
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

  const abrirNovo = () => {
    setEditandoId(null)
    setFormData(formVazio)
    setMostrarForm(true)
  }

  const abrirEdicao = (tarefa: Tarefa) => {
    setEditandoId(tarefa.id)
    setFormData({
      titulo: tarefa.titulo,
      descricao: tarefa.descricao || '',
      prazo: tarefa.prazo ? formatarData(tarefa.prazo, 'yyyy-MM-dd') : '',
      prioridade: tarefa.prioridade,
      clienteId: tarefa.clienteId || '',
      status: tarefa.status,
    })
    setMostrarForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) return

    const dados = {
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      prazo: formData.prazo ? Timestamp.fromDate(new Date(formData.prazo)) : undefined,
      prioridade: formData.prioridade,
      clienteId: formData.clienteId || undefined,
      status: formData.status,
    }

    if (editandoId) {
      await atualizarTarefa(editandoId, dados)
    } else {
      await criarTarefa({ ...dados, usuarioId: user.uid })
    }

    setMostrarForm(false)
    setEditandoId(null)
    setFormData(formVazio)
    carregarPrimeira()
  }

  const confirmarExclusao = async () => {
    if (!excluindoId) return
    await excluirTarefa(excluindoId)
    setExcluindoId(null)
    carregarPrimeira()
  }

  const handleDragStart = (tarefaId: string) => {
    setTarefaArrastando(tarefaId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, novoStatus: StatusKanban) => {
    e.preventDefault()
    if (tarefaArrastando) {
      await atualizarTarefa(tarefaArrastando, { status: novoStatus })
      setTarefaArrastando(null)
      carregarPrimeira()
    }
  }

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <AlertCircle className="h-4 w-4 text-destructive" />
      case 'media':
        return <Clock className="h-4 w-4 text-warning" />
      case 'baixa':
        return <CheckCircle className="h-4 w-4 text-success" />
      default:
        return null
    }
  }

  const filtradas = tarefas.filter(
    (t) =>
      combinaTexto(t.titulo, query) &&
      combinaTexto(t.descricao || '', query) &&
      combinaTexto(t.prioridade, query)
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" /> Nova Tarefa
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {editandoId ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  placeholder="Título da tarefa"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, descricao: e.target.value }))
                  }
                  placeholder="Descrição da tarefa..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="prazo">Prazo</Label>
                  <Input
                    id="prazo"
                    type="date"
                    value={formData.prazo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, prazo: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prioridade">Prioridade</Label>
                  <Select
                    id="prioridade"
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        prioridade: e.target.value as 'baixa' | 'media' | 'alta',
                      }))
                    }
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as StatusKanban,
                      }))
                    }
                  >
                    {colunas.map((coluna) => (
                      <option key={coluna.id} value={coluna.id}>
                        {coluna.titulo}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

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
      ) : (
        <div className="-mx-4 grid grid-flow-col auto-cols-[minmax(250px,1fr)] gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid-flow-row md:grid-cols-2 md:px-0 lg:grid-cols-4">
          {colunas.map((coluna) => {
            const tarefasColuna = filtradas.filter((t) => t.status === coluna.id)
            return (
              <div
                key={coluna.id}
                className={`rounded-xl border border-border p-4 ${coluna.cor}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, coluna.id)}
              >
                <h3 className="mb-4 font-semibold text-foreground">
                  {coluna.titulo} ({tarefasColuna.length})
                </h3>

                <div className="space-y-3">
                  {tarefasColuna.map((tarefa) => {
                    const cliente = clientes.find(
                      (c) => c.id === tarefa.clienteId
                    )
                    const faltantes = avaliarCompletude(
                      'tarefa',
                      tarefa
                    ).faltantes
                    return (
                      <Card
                        key={tarefa.id}
                        className="cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={() => handleDragStart(tarefa.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="mb-1 flex items-center gap-2">
                                {getPrioridadeIcon(tarefa.prioridade)}
                                <h4 className="truncate text-sm font-medium text-foreground">
                                  {tarefa.titulo}
                                </h4>
                              </div>
                              {tarefa.descricao && (
                                <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                                  {tarefa.descricao}
                                </p>
                              )}
                              {faltantes.length > 0 && (
                                <div className="mb-1">
                                  <CompletenessBadge faltantes={faltantes} />
                                </div>
                              )}
                              {cliente && (
                                <p className="mb-1 text-xs text-muted-foreground">
                                  {cliente.nome}
                                </p>
                              )}
                              {tarefa.prazo && (
                                <p className="text-xs text-muted-foreground">
                                  Prazo: {formatarData(tarefa.prazo)}
                                </p>
                              )}
                            </div>

                            <div className="flex shrink-0 flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                aria-label="Editar tarefa"
                                onClick={() => abrirEdicao(tarefa)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive"
                                aria-label="Excluir tarefa"
                                onClick={() => setExcluindoId(tarefa.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {tarefasColuna.length === 0 && (
                    <p className="py-4 text-center text-xs text-muted-foreground">
                      Nenhuma tarefa
                    </p>
                  )}
                </div>
              </div>
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
        title="Excluir tarefa"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindoId(null)}
      />
    </div>
  )
}
