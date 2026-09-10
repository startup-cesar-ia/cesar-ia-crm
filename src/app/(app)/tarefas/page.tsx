'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { listarTarefas, criarTarefa, atualizarTarefa, excluirTarefa, listarClientes } from '@/lib/firebase-services'
import { Timestamp } from 'firebase/firestore'
import { Tarefa, Cliente } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Trash2, AlertCircle, Clock, CheckCircle } from 'lucide-react'
import { formatarData } from '@/lib/date'

type StatusKanban = 'backlog' | 'todo' | 'doing' | 'done'

const colunas: { id: StatusKanban; titulo: string; cor: string }[] = [
  { id: 'backlog', titulo: 'A Fazer', cor: 'bg-gray-100' },
  { id: 'todo', titulo: 'Aguardando', cor: 'bg-yellow-50' },
  { id: 'doing', titulo: 'Em Andamento', cor: 'bg-blue-50' },
  { id: 'done', titulo: 'Concluído', cor: 'bg-green-50' },
]

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [tarefaArrastando, setTarefaArrastando] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    prazo: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta',
    clienteId: '',
    status: 'todo' as StatusKanban,
  })

  const carregarDados = async () => {
    const user = auth.currentUser
    if (!user) return

    setCarregando(true)
    const [tarefasData, clientesData] = await Promise.all([
      listarTarefas(user.uid),
      listarClientes(user.uid),
    ])
    setTarefas(tarefasData)
    setClientes(clientesData)
    setCarregando(false)
  }

  useEffect(() => {
    carregarDados() // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) return

    await criarTarefa({
      usuarioId: user.uid,
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      prazo: formData.prazo ? new Date(formData.prazo) as unknown as Timestamp : undefined,
      prioridade: formData.prioridade,
      clienteId: formData.clienteId || undefined,
      status: formData.status,
    })

    setMostrarForm(false)
    setFormData({
      titulo: '',
      descricao: '',
      prazo: '',
      prioridade: 'media',
      clienteId: '',
      status: 'todo',
    })
    carregarDados()
  }

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
      await excluirTarefa(id)
      carregarDados()
    }
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
      carregarDados()
    }
  }

  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'media':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'baixa':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setMostrarForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Tarefa</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Título *
                </label>
                <Input
                  value={formData.titulo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, titulo: e.target.value }))
                  }
                  placeholder="Título da tarefa"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Descrição
                </label>
                <textarea
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, descricao: e.target.value }))
                  }
                  placeholder="Descrição da tarefa..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Prazo
                  </label>
                  <Input
                    type="date"
                    value={formData.prazo}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, prazo: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Prioridade
                  </label>
                  <select
                    value={formData.prioridade}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        prioridade: e.target.value as 'baixa' | 'media' | 'alta',
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as StatusKanban,
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {colunas.map((coluna) => (
                      <option key={coluna.id} value={coluna.id}>
                        {coluna.titulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Cliente
                </label>
                <select
                  value={formData.clienteId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clienteId: e.target.value,
                    }))
                  }
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Selecionar cliente</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMostrarForm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white"
                >
                  Salvar Tarefa
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {carregando ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {colunas.map((coluna) => {
            const tarefasColuna = tarefas.filter((t) => t.status === coluna.id)
            return (
              <div
                key={coluna.id}
                className={`rounded-lg p-4 ${coluna.cor}`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, coluna.id)}
              >
                <h3 className="font-semibold text-foreground mb-4">
                  {coluna.titulo} ({tarefasColuna.length})
                </h3>

                <div className="space-y-3">
                  {tarefasColuna.map((tarefa) => {
                    const cliente = clientes.find(
                      (c) => c.id === tarefa.clienteId
                    )
                    return (
                      <Card
                        key={tarefa.id}
                        className="cursor-grab active:cursor-grabbing"
                        draggable
                        onDragStart={() => handleDragStart(tarefa.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {getPrioridadeIcon(tarefa.prioridade)}
                                <h4 className="font-medium text-sm text-foreground truncate">
                                  {tarefa.titulo}
                                </h4>
                              </div>

                              {tarefa.descricao && (
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {tarefa.descricao}
                                </p>
                              )}

                              {cliente && (
                                <p className="text-xs text-muted-foreground mb-1">
                                  {cliente.nome}
                                </p>
                              )}

                              {tarefa.prazo && (
                                <p className="text-xs text-muted-foreground">
                                  Prazo: {formatarData(tarefa.prazo)}
                                </p>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-red-500 hover:text-red-600"
                              onClick={() => handleExcluir(tarefa.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {tarefasColuna.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">
                      Nenhuma tarefa
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
