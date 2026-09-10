'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  listarClientes,
  listarTarefas,
  listarProximosAgendamentos,
  contarAgendamentos,
} from '@/lib/firebase-services'
import { Cliente, Agendamento, Tarefa } from '@/types'
import { Users, CheckSquare, Calendar, AlertCircle, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface DashboardStats {
  clientes: Cliente[]
  proximosAgendamentos: Agendamento[]
  totalAgendamentos: number
  tarefas: Tarefa[]
  totalClientes: number
  totalTarefas: number
}

const cardStyles = {
  info: {
    iconColor: 'text-info',
    iconBg: 'bg-info/10',
    footerBg: 'bg-info/5',
    footerBorder: 'border-info/20',
  },
  warning: {
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
    footerBg: 'bg-warning/5',
    footerBorder: 'border-warning/20',
  },
  success: {
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    footerBg: 'bg-success/5',
    footerBorder: 'border-success/20',
  },
} as const

type CardTone = keyof typeof cardStyles

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const carregarDados = async () => {
    const user = auth.currentUser
    if (!user) {
      setError('Usuário não autenticado')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const [clientes, proximosAgendamentos, totalAgendamentos, tarefas] =
        await Promise.all([
          listarClientes(user.uid),
          listarProximosAgendamentos(user.uid, 5),
          contarAgendamentos(user.uid),
          listarTarefas(user.uid),
        ])

      setStats({
        clientes,
        proximosAgendamentos,
        totalAgendamentos,
        tarefas,
        totalClientes: clientes.length,
        totalTarefas: tarefas.length,
      })
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados() // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const formatarData = (timestamp: unknown) => {
    if (!timestamp) return 'Sem data'
    const ts = timestamp as { toDate?: () => Date }
    const date = ts.toDate ? ts.toDate() : new Date(String(timestamp))
    return format(date, 'dd/MM/yyyy', { locale: ptBR })
  }

  const formatarDataHora = (timestamp: unknown) => {
    if (!timestamp) return 'Sem data'
    const ts = timestamp as { toDate?: () => Date }
    const date = ts.toDate ? ts.toDate() : new Date(String(timestamp))
    return format(date, 'dd/MM/yyyy - HH:mm', { locale: ptBR })
  }

  const proximasTarefas = stats?.tarefas
    .filter((t) => t.status !== 'done')
    .sort((a, b) => {
      if (!a.prazo) return 1
      if (!b.prazo) return -1
      const dateA = a.prazo.toDate()
      const dateB = b.prazo.toDate()
      return dateA.getTime() - dateB.getTime()
    })
    .slice(0, 3) || []

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <Spinner size={48} />
        <p className="text-lg text-muted-foreground">Carregando dados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="text-destructive" size={48} />
        <p className="text-lg text-destructive">{error}</p>
        <Button onClick={carregarDados}>Tentar novamente</Button>
      </div>
    )
  }

  const cards: {
    title: string
    total: number
    icon: React.ReactNode
    tone: CardTone
    href: string
    items: { id: string; titulo: string; subtitulo: string }[]
    emptyMessage: string
  }[] = [
    {
      title: 'Clientes',
      total: stats?.totalClientes || 0,
      icon: <Users className="h-8 w-8" />,
      tone: 'info',
      href: '/clientes',
      items: stats?.clientes.slice(0, 3).map((c) => ({
        id: c.id,
        titulo: c.nome,
        subtitulo: c.empresa || c.email || 'Sem detalhes',
      })) || [],
      emptyMessage: 'Nenhum cliente cadastrado',
    },
    {
      title: 'Tarefas',
      total: stats?.totalTarefas || 0,
      icon: <CheckSquare className="h-8 w-8" />,
      tone: 'warning',
      href: '/tarefas',
      items: proximasTarefas.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        subtitulo: t.prazo ? formatarData(t.prazo) : 'Sem prazo',
      })),
      emptyMessage: 'Nenhuma tarefa encontrada',
    },
  ]

  const renderFooter = (href: string, tone: CardTone) => {
    const s = cardStyles[tone]
    return (
      <div
        className={cn(
          'border-t px-6 py-3 text-center text-sm font-medium transition-colors',
          s.footerBg,
          s.footerBorder,
          s.iconColor,
          'hover:opacity-80'
        )}
      >
        Ver todos →
      </div>
    )
  }

  const renderItems = (
    items: { id: string; titulo: string; subtitulo: string }[],
    emptyMessage: string
  ) => {
    if (items.length > 0) {
      return items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg bg-muted px-3 py-2"
        >
          <span className="truncate text-sm font-medium text-foreground">
            {item.titulo}
          </span>
          <span className="ml-2 whitespace-nowrap text-xs text-muted-foreground">
            {item.subtitulo}
          </span>
        </div>
      ))
    }
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const s = cardStyles[card.tone]
        return (
          <Card
            key={card.title}
            onClick={() => router.push(card.href)}
            className="cursor-pointer overflow-hidden transition-shadow hover:shadow-soft-lg"
          >
            <CardContent className="flex h-full flex-col gap-4 p-6">
              <div className="flex items-center justify-between">
                <div className={cn('rounded-xl p-3', s.iconBg)}>
                  <div className={s.iconColor}>{card.icon}</div>
                </div>
                <span className="text-3xl font-bold text-foreground">
                  {card.total}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-foreground">
                {card.title}
              </h2>

              <div className="mt-1 space-y-2">
                {renderItems(card.items, card.emptyMessage)}
              </div>
            </CardContent>
            {renderFooter(card.href, card.tone)}
          </Card>
        )
      })}

      <Card
        onClick={() => router.push('/agendamentos')}
        className="cursor-pointer overflow-hidden transition-shadow hover:shadow-soft-lg"
      >
        <CardContent className="flex h-full flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div className={cn('rounded-xl p-3', cardStyles.success.iconBg)}>
              <div className={cardStyles.success.iconColor}>
                <Calendar className="h-8 w-8" />
              </div>
            </div>
            <span className="text-3xl font-bold text-foreground">
              {stats?.totalAgendamentos || 0}
            </span>
          </div>

          <h2 className="text-xl font-semibold text-foreground">
            Próximos Agendamentos
          </h2>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {stats?.proximosAgendamentos &&
            stats.proximosAgendamentos.length > 0 ? (
              <ul className="divide-y divide-border">
                {stats.proximosAgendamentos.map((agendamento) => {
                  const cliente = stats.clientes.find(
                    (c) => c.id === agendamento.clienteId
                  )
                  return (
                    <li key={agendamento.id} className="px-4 py-3 hover:bg-muted">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-foreground">
                            {agendamento.titulo}
                          </p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {formatarDataHora(agendamento.data)} - Cliente:{' '}
                            {cliente?.nome || 'Não informado'}
                          </p>
                        </div>
                        <ChevronRight className="ml-2 shrink-0 text-muted-foreground" />
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center">
                <Calendar className="mx-auto mb-2 text-muted-foreground/60" size={32} />
                <p className="text-sm text-muted-foreground">
                  Nenhum agendamento encontrado
                </p>
              </div>
            )}
          </div>
        </CardContent>
        {renderFooter('/agendamentos', 'success')}
      </Card>
    </div>
  )
}
