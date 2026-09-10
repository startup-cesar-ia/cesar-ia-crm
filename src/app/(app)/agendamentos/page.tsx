'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import {
  listarAgendamentos,
  criarAgendamento,
  atualizarAgendamento,
  excluirAgendamento,
  listarClientes,
} from '@/lib/firebase-services'
import { Timestamp } from 'firebase/firestore'
import { Agendamento, Cliente } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Calendar, Trash2, Edit, List, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatarData } from '@/lib/date'
import { combinaTexto, useSearch } from '@/lib/search-context'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/style.css'

type StatusAgendamento = 'confirmado' | 'pendente' | 'cancelado'

const statusBadge: Record<StatusAgendamento, 'success' | 'warning' | 'destructive'> = {
  confirmado: 'success',
  pendente: 'warning',
  cancelado: 'destructive',
}

const statusLabel: Record<StatusAgendamento, string> = {
  confirmado: 'Confirmado',
  pendente: 'Pendente',
  cancelado: 'Cancelado',
}

const formVazio = {
  titulo: '',
  descricao: '',
  data: format(new Date(), 'yyyy-MM-dd'),
  horaInicio: '09:00',
  horaFim: '10:00',
  clienteId: '',
  status: 'pendente' as StatusAgendamento,
}

export default function AgendamentosPage() {
  const { query } = useSearch()
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [mostrarForm, setMostrarForm] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [excluindoId, setExcluindoId] = useState<string | null>(null)
  const [visao, setVisao] = useState<'lista' | 'calendario'>('lista')
  const [diaSelecionado, setDiaSelecionado] = useState<Date | undefined>(undefined)
  const [formData, setFormData] = useState(formVazio)

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

  const abrirNovo = () => {
    setEditandoId(null)
    setFormData(formVazio)
    setMostrarForm(true)
  }

  const abrirEdicao = (agendamento: Agendamento) => {
    setEditandoId(agendamento.id)
    setFormData({
      titulo: agendamento.titulo,
      descricao: agendamento.descricao || '',
      data: format(new Date(agendamento.data.toDate()), 'yyyy-MM-dd'),
      horaInicio: agendamento.horaInicio,
      horaFim: agendamento.horaFim,
      clienteId: agendamento.clienteId || '',
      status: agendamento.status,
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
      data: Timestamp.fromDate(new Date(formData.data)),
      horaInicio: formData.horaInicio,
      horaFim: formData.horaFim,
      clienteId: formData.clienteId || undefined,
      status: formData.status,
    }

    if (editandoId) {
      await atualizarAgendamento(editandoId, dados)
    } else {
      await criarAgendamento({ ...dados, usuarioId: user.uid })
    }

    setMostrarForm(false)
    setEditandoId(null)
    setFormData(formVazio)
    carregarDados()
  }

  const confirmarExclusao = async () => {
    if (!excluindoId) return
    await excluirAgendamento(excluindoId)
    setExcluindoId(null)
    carregarDados()
  }

  const filtrados = agendamentos.filter(
    (a) =>
      combinaTexto(a.titulo, query) &&
      combinaTexto(statusLabel[a.status], query) &&
      (diaSelecionado
        ? format(a.data.toDate(), 'yyyy-MM-dd') === format(diaSelecionado, 'yyyy-MM-dd')
        : true)
  )

  const diaTemAgendamento = (dia: Date) =>
    agendamentos.some(
      (a) => format(a.data.toDate(), 'yyyy-MM-dd') === format(dia, 'yyyy-MM-dd')
    )

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-soft">
          <Button
            variant={visao === 'lista' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setVisao('lista')}
            className={visao === 'lista' ? '' : 'text-muted-foreground'}
          >
            <List className="h-4 w-4" /> Lista
          </Button>
          <Button
            variant={visao === 'calendario' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setVisao('calendario')}
            className={visao === 'calendario' ? '' : 'text-muted-foreground'}
          >
            <Calendar className="h-4 w-4" /> Calendário
          </Button>
        </div>

        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" /> Novo Agendamento
        </Button>
      </div>

      {mostrarForm && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h2 className="text-lg font-semibold text-foreground">
              {editandoId ? 'Editar Agendamento' : 'Novo Agendamento'}
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
                  placeholder="Título do agendamento"
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
                  placeholder="Descrição do agendamento..."
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
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
                  <Label htmlFor="horaInicio">Hora Início *</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, horaInicio: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFim">Hora Fim *</Label>
                  <Input
                    id="horaFim"
                    type="time"
                    value={formData.horaFim}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, horaFim: e.target.value }))
                    }
                    required
                  />
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    id="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: e.target.value as StatusAgendamento,
                      }))
                    }
                  >
                    <option value="pendente">Pendente</option>
                    <option value="confirmado">Confirmado</option>
                    <option value="cancelado">Cancelado</option>
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
      ) : (
        <>
          {visao === 'calendario' && (
            <Card>
              <CardContent className="flex justify-center p-6">
                <DayPicker
                  mode="single"
                  selected={diaSelecionado}
                  onSelect={setDiaSelecionado}
                  locale={ptBR}
                  modifiers={{ comAgendamento: diaTemAgendamento }}
                  modifiersClassNames={{
                    comAgendamento: 'rdp-com-agendamento',
                  }}
                />
              </CardContent>
            </Card>
          )}

          {filtrados.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {query || diaSelecionado
                    ? 'Nenhum agendamento para o filtro.'
                    : 'Nenhum agendamento cadastrado ainda.'}
                </p>
                <Button className="mt-4" onClick={abrirNovo}>
                  <Plus className="mr-2 h-4 w-4" /> Criar primeiro agendamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filtrados.map((agendamento) => {
                const cliente = clientes.find(
                  (c) => c.id === agendamento.clienteId
                )
                return (
                  <Card key={agendamento.id}>
                    <CardContent className="flex items-start justify-between gap-4 p-6">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-foreground">
                            {agendamento.titulo}
                          </h3>
                          <Badge variant={statusBadge[agendamento.status]}>
                            {statusLabel[agendamento.status]}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatarData(agendamento.data)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
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

                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Editar agendamento"
                          onClick={() => abrirEdicao(agendamento)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Excluir agendamento"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setExcluindoId(agendamento.id)}
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
        </>
      )}

      <ConfirmDialog
        open={!!excluindoId}
        title="Excluir agendamento"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setExcluindoId(null)}
      />
    </div>
  )
}
