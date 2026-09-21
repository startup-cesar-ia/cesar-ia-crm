'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  listarClientes,
  listarTarefas,
  listarAgendamentos,
  listarTransacoes,
  listarNotas,
  listarArquivos,
} from '@/lib/firebase-services'
import { Cliente, Agendamento, Tarefa, Transacao, Nota, Arquivo } from '@/types'
import { Users, CheckSquare, Calendar, AlertCircle, ChevronRight, Wallet, TrendingUp, TrendingDown, StickyNote, FolderOpen } from 'lucide-react'
import { format, subMonths, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EmptyState } from '@/components/ui/empty-state'
import { paraDate, formatarData } from '@/lib/date'

interface DashboardData {
  clientes: Cliente[]
  tarefas: Tarefa[]
  agendamentos: Agendamento[]
  transacoes: Transacao[]
  notas: Nota[]
  arquivos: Arquivo[]
}

function formatarValor(valor: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

export default function Dashboard() {
  const router = useRouter()
  const [dados, setDados] = useState<DashboardData | null>(null)
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
      const [clientes, tarefas, agendamentos, transacoes, notas, arquivos] = await Promise.all([
        listarClientes(user.uid),
        listarTarefas(user.uid),
        listarAgendamentos(user.uid),
        listarTransacoes(user.uid),
        listarNotas(user.uid),
        listarArquivos(user.uid),
      ])
      setDados({ clientes, tarefas, agendamentos, transacoes, notas, arquivos })
    } catch {
      setError('Erro ao carregar dados. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarDados() // eslint-disable-line react-hooks/set-state-in-effect
  }, [])

  const kpis = useMemo(() => {
    if (!dados) return null
    const tarefasPendentes = dados.tarefas.filter((t) => t.status !== 'done').length
    const receitas = dados.transacoes
      .filter((t) => t.tipo === 'receita' && t.status === 'pago')
      .reduce((s, t) => s + t.valor, 0)
    const despesas = dados.transacoes
      .filter((t) => t.tipo === 'despesa' && t.status === 'pago')
      .reduce((s, t) => s + t.valor, 0)
    return { tarefasPendentes, receitas, despesas, saldo: receitas - despesas }
  }, [dados])

  const grafico = useMemo(() => {
    if (!dados) return []
    const agora = new Date()
    const meses = Array.from({ length: 6 }, (_, i) =>
      startOfMonth(subMonths(agora, 5 - i))
    )
    return meses.map((mes) => {
      const receitas = dados.transacoes
        .filter((t) => {
          const d = paraDate(t.data)
          return (
            d &&
            t.tipo === 'receita' &&
            d.getFullYear() === mes.getFullYear() &&
            d.getMonth() === mes.getMonth()
          )
        })
        .reduce((s, t) => s + t.valor, 0)
      const despesas = dados.transacoes
        .filter((t) => {
          const d = paraDate(t.data)
          return (
            d &&
            t.tipo === 'despesa' &&
            d.getFullYear() === mes.getFullYear() &&
            d.getMonth() === mes.getMonth()
          )
        })
        .reduce((s, t) => s + t.valor, 0)
      return { mes: format(mes, 'MMM', { locale: ptBR }), receitas, despesas }
    })
  }, [dados])

  const atividade = useMemo(() => {
    if (!dados) return []
    const itens: {
      id: string
      tipo: 'agendamento' | 'tarefa' | 'nota' | 'arquivo'
      titulo: string
      detalhe: string
      data: number
    }[] = []
    dados.agendamentos.forEach((a) => {
      const d = paraDate(a.data)
      itens.push({
        id: `a-${a.id}`,
        tipo: 'agendamento',
        titulo: a.titulo,
        detalhe: `Agendamento · ${formatarData(a.data)}`,
        data: d ? d.getTime() : 0,
      })
    })
    dados.tarefas.forEach((t) => {
      const d = paraDate(t.criadoEm)
      itens.push({
        id: `t-${t.id}`,
        tipo: 'tarefa',
        titulo: t.titulo,
        detalhe: `Tarefa criada · ${formatarData(t.criadoEm)}`,
        data: d ? d.getTime() : 0,
      })
    })
    dados.notas.forEach((n) => {
      const d = paraDate(n.atualizadoEm)
      itens.push({
        id: `n-${n.id}`,
        tipo: 'nota',
        titulo: n.titulo,
        detalhe: `Nota atualizada · ${formatarData(n.atualizadoEm)}`,
        data: d ? d.getTime() : 0,
      })
    })
    dados.arquivos.forEach((arq) => {
      const d = paraDate(arq.criadoEm)
      itens.push({
        id: `f-${arq.id}`,
        tipo: 'arquivo',
        titulo: arq.nome,
        detalhe: `Arquivo enviado · ${formatarData(arq.criadoEm)}`,
        data: d ? d.getTime() : 0,
      })
    })
    return itens.sort((a, b) => b.data - a.data).slice(0, 6)
  }, [dados])

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

  const maxValor = Math.max(1, ...grafico.flatMap((m) => [m.receitas, m.despesas]))
  const chartHeight = 140
  const chartWidth = 320

  const kpiCards = kpis
    ? [
        {
          label: 'Clientes',
          valor: String(dados?.clientes.length ?? 0),
          icon: <Users className="h-5 w-5" />,
          cor: 'text-info',
          bg: 'bg-info/10',
          href: '/clientes',
        },
        {
          label: 'Tarefas pendentes',
          valor: String(kpis.tarefasPendentes),
          icon: <CheckSquare className="h-5 w-5" />,
          cor: 'text-warning',
          bg: 'bg-warning/10',
          href: '/tarefas',
        },
        {
          label: 'Agendamentos',
          valor: String(dados?.agendamentos.length ?? 0),
          icon: <Calendar className="h-5 w-5" />,
          cor: 'text-primary',
          bg: 'bg-primary/10',
          href: '/agendamentos',
        },
        {
          label: 'Saldo',
          valor: formatarValor(kpis.saldo),
          icon: <Wallet className="h-5 w-5" />,
          cor: 'text-success',
          bg: 'bg-success/10',
          href: '/financeiro',
        },
        {
          label: 'Notas',
          valor: String(dados?.notas.length ?? 0),
          icon: <StickyNote className="h-5 w-5" />,
          cor: 'text-warning',
          bg: 'bg-warning/10',
          href: '/notas',
        },
        {
          label: 'Arquivos',
          valor: String(dados?.arquivos.length ?? 0),
          icon: <FolderOpen className="h-5 w-5" />,
          cor: 'text-info',
          bg: 'bg-info/10',
          href: '/arquivos',
        },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpiCards.map((kpi) => (
          <Card key={kpi.label} padded className="cursor-pointer hover:shadow-soft-lg">
            <button
              type="button"
              onClick={() => router.push(kpi.href)}
              className="flex w-full items-center gap-4 text-left"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${kpi.bg} ${kpi.cor}`}>
                {kpi.icon}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <p className="text-xl font-bold text-foreground">{kpi.valor}</p>
              </div>
            </button>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-primary" />
              Receitas × Despesas (6 meses)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {grafico.every((m) => m.receitas === 0 && m.despesas === 0) ? (
              <EmptyState
                title="Sem movimentações"
                description="Registre transações para ver o gráfico."
              />
            ) : (
              <div className="mt-4">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight + 30}`}
                  className="w-full"
                  role="img"
                  aria-label="Gráfico de receitas e despesas dos últimos 6 meses"
                >
                  {grafico.map((m, i) => {
                    const groupW = chartWidth / grafico.length
                    const x = i * groupW + groupW * 0.25
                    const barW = groupW * 0.2
                    const hR = (m.receitas / maxValor) * chartHeight
                    const hD = (m.despesas / maxValor) * chartHeight
                    return (
                      <g key={m.mes}>
                        <rect
                          x={x}
                          y={chartHeight - hR}
                          width={barW}
                          height={hR}
                          rx={3}
                          className="fill-success"
                        />
                        <rect
                          x={x + barW + 4}
                          y={chartHeight - hD}
                          width={barW}
                          height={hD}
                          rx={3}
                          className="fill-destructive"
                        />
                        <text
                          x={x + barW + 2}
                          y={chartHeight + 18}
                          textAnchor="middle"
                          className="fill-muted-foreground"
                          fontSize={11}
                        >
                          {m.mes}
                        </text>
                      </g>
                    )
                  })}
                </svg>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-success" /> Receitas
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-destructive" /> Despesas
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              Atividade recente
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {atividade.length === 0 ? (
              <EmptyState
                title="Sem atividade"
                description="As ações recentes aparecerão aqui."
              />
            ) : (
              <ul className="divide-y divide-border">
                {atividade.map((item) => {
                  const visual = {
                    agendamento: { cls: 'bg-info/10 text-info', icon: <Calendar className="h-4 w-4" /> },
                    tarefa: { cls: 'bg-warning/10 text-warning', icon: <CheckSquare className="h-4 w-4" /> },
                    nota: { cls: 'bg-primary/10 text-primary', icon: <StickyNote className="h-4 w-4" /> },
                    arquivo: { cls: 'bg-success/10 text-success', icon: <FolderOpen className="h-4 w-4" /> },
                  }[item.tipo]
                  return (
                    <li key={item.id} className="flex items-start gap-3 py-2.5">
                      <div
                        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${visual.cls}`}
                      >
                        {visual.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {item.titulo}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.detalhe}</p>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card padded>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="text-lg font-bold text-foreground">
                {formatarValor(kpis?.receitas ?? 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card padded>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-lg font-bold text-foreground">
                {formatarValor(kpis?.despesas ?? 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
