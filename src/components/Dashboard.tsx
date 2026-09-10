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
import {
  FiUsers,
  FiCalendar,
  FiCheckSquare,
  FiAlertCircle,
  FiLoader,
  FiChevronRight,
} from 'react-icons/fi'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface DashboardStats {
  clientes: Cliente[]
  proximosAgendamentos: Agendamento[]
  totalAgendamentos: number
  tarefas: Tarefa[]
  totalClientes: number
  totalTarefas: number
}

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
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiLoader className="animate-spin text-[#FF6B00]" size={48} />
        <p className="text-[#64748b] text-lg">Carregando dados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <FiAlertCircle className="text-red-500" size={48} />
        <p className="text-red-500 text-lg">{error}</p>
        <button
          onClick={carregarDados}
          className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#e55a00] transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const cards = [
    {
      title: 'Clientes',
      total: stats?.totalClientes || 0,
      icon: <FiUsers size={32} />,
      color: '#3B82F6',
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
      icon: <FiCheckSquare size={32} />,
      color: '#8B5CF6',
      href: '/tarefas',
      items: proximasTarefas.map((t) => ({
        id: t.id,
        titulo: t.titulo,
        subtitulo: t.prazo ? formatarData(t.prazo) : 'Sem prazo',
      })),
      emptyMessage: 'Nenhuma tarefa encontrada',
    },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div
            key={card.title}
            onClick={() => router.push(card.href)}
            className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${card.color}15` }}
                >
                  <div style={{ color: card.color }}>{card.icon}</div>
                </div>
                <span className="text-3xl font-bold text-[#1e293b]">
                  {card.total}
                </span>
              </div>

              <h2 className="text-xl font-semibold text-[#1e293b] mb-2">
                {card.title}
              </h2>

              <div className="mt-4 space-y-2">
                {card.items.length > 0 ? (
                  card.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm font-medium text-[#374151] truncate">
                        {item.titulo}
                      </span>
                      <span className="text-xs text-[#64748b] ml-2 whitespace-nowrap">
                        {item.subtitulo}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-[#94a3b8] text-center py-4">
                    {card.emptyMessage}
                  </p>
                )}
              </div>
            </div>

            <div
              className="px-6 py-3 text-center text-sm font-medium transition-colors"
              style={{
                backgroundColor: `${card.color}08`,
                color: card.color,
                borderTop: `1px solid ${card.color}20`,
              }}
            >
              Ver todos →
            </div>
          </div>
        ))}

        {/* Card de Agendamentos refatorado */}
        <div
          onClick={() => router.push('/agendamentos')}
          className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-100 overflow-hidden group"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div
                className="p-3 rounded-xl"
                style={{ backgroundColor: '#10B98115' }}
              >
                <div style={{ color: '#10B981' }}>
                  <FiCalendar size={32} />
                </div>
              </div>
              <span className="text-3xl font-bold text-[#1e293b]">
                {stats?.totalAgendamentos || 0}
              </span>
            </div>

            <h2 className="text-xl font-semibold text-[#1e293b] mb-4">
              Próximos Agendamentos
            </h2>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {stats?.proximosAgendamentos &&
              stats.proximosAgendamentos.length > 0 ? (
                <ul className="divide-y divide-gray-100">
                  {stats.proximosAgendamentos.map((agendamento) => {
                    const cliente = stats.clientes.find(
                      (c) => c.id === agendamento.clienteId
                    )
                    return (
                      <li
                        key={agendamento.id}
                        className="px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1e293b] truncate">
                              {agendamento.titulo}
                            </p>
                            <p className="text-xs text-[#64748b] mt-0.5">
                              {formatarDataHora(agendamento.data)} - Cliente:{' '}
                              {cliente?.nome || 'Não informado'}
                            </p>
                          </div>
                          <FiChevronRight className="text-gray-400 ml-2 flex-shrink-0" />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="px-4 py-8 text-center">
                  <FiCalendar className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-[#94a3b8]">
                    Nenhum agendamento encontrado
                  </p>
                </div>
              )}
            </div>
          </div>

          <div
            className="px-6 py-3 text-center text-sm font-medium transition-colors"
            style={{
              backgroundColor: '#10B98108',
              color: '#10B981',
              borderTop: '1px solid #10B98120',
            }}
          >
            Ver todos →
          </div>
        </div>
      </div>
    </div>
  )
}
