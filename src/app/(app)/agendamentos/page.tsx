'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { listarAgendamentos, criarAgendamento, excluirAgendamento, listarClientes } from '@/lib/firebase-services'
import { Timestamp } from 'firebase/firestore'
import { Agendamento, Cliente } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Trash2, Check, Clock, X } from 'lucide-react'
import { format } from 'date-fns'
import { formatarData } from '@/lib/date'

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data: format(new Date(), 'yyyy-MM-dd'),
    horaInicio: '09:00',
    horaFim: '10:00',
    clienteId: '',
    status: 'pendente' as 'confirmado' | 'pendente' | 'cancelado',
  })

  const carregarDados = async () => {
    const user = auth.currentUser
    if (!user) return

    setCarregando(true)
    const [agendamentosData, clientesData] = await Promise.all([
      listarAgendamentos(user.uid),
      listarClientes(user.uid),
    ])
    setAgendamentos(agendamentosData)
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

    await criarAgendamento({
      usuarioId: user.uid,
      titulo: formData.titulo,
      descricao: formData.descricao || undefined,
      data: new Date(formData.data) as unknown as Timestamp,
      horaInicio: formData.horaInicio,
      horaFim: formData.horaFim,
      clienteId: formData.clienteId || undefined,
      status: formData.status,
    })

    setMostrarForm(false)
    setFormData({
      titulo: '',
      descricao: '',
      data: format(new Date(), 'yyyy-MM-dd'),
      horaInicio: '09:00',
      horaFim: '10:00',
      clienteId: '',
      status: 'pendente',
    })
    carregarDados()
  }

  const handleExcluir = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      await excluirAgendamento(id)
      carregarDados()
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmado':
        return <Check className="h-4 w-4 text-green-500" />
      case 'pendente':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'cancelado':
        return <X className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmado':
        return 'Confirmado'
      case 'pendente':
        return 'Pendente'
      case 'cancelado':
        return 'Cancelado'
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button onClick={() => setMostrarForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Agendamento
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardHeader>
            <CardTitle>Novo Agendamento</CardTitle>
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
                  placeholder="Título do agendamento"
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
                  placeholder="Descrição do agendamento..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Data *
                  </label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, data: e.target.value }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Hora Início *
                  </label>
                  <Input
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        horaInicio: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Hora Fim *
                  </label>
                  <Input
                    type="time"
                    value={formData.horaFim}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        horaFim: e.target.value,
                      }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as 'confirmado' | 'pendente' | 'cancelado',
                      }))
                    }
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </div>
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
                  Salvar Agendamento
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
      ) : agendamentos.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Nenhum agendamento cadastrado ainda.
            </p>
            <Button
              className="mt-4 bg-primary hover:bg-primary-hover text-white"
              onClick={() => setMostrarForm(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Criar primeiro agendamento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {agendamentos.map((agendamento) => {
            const cliente = clientes.find(
              (c) => c.id === agendamento.clienteId
            )
            return (
              <Card key={agendamento.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(agendamento.status)}
                        <h3 className="font-semibold text-foreground">
                          {agendamento.titulo}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          - {getStatusLabel(agendamento.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatarData(agendamento.data)}
                        </span>
                        <span>
                          {agendamento.horaInicio} - {agendamento.horaFim}
                        </span>
                      </div>

                      {cliente && (
                        <p className="text-sm text-muted-foreground">
                          Cliente: {cliente.nome}
                        </p>
                      )}

                      {agendamento.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {agendamento.descricao}
                        </p>
                      )}
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleExcluir(agendamento.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
