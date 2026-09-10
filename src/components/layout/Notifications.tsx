'use client'

import { useEffect, useRef, useState } from 'react'
import { auth } from '@/lib/firebase'
import {
  listarTarefas,
  listarAgendamentos,
} from '@/lib/firebase-services'
import { Tarefa, Agendamento } from '@/types'
import { formatarData } from '@/lib/date'
import { paraDate } from '@/lib/date'
import { Bell, Calendar, CheckSquare, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotifItem {
  id: string
  tipo: 'tarefa-atrasada' | 'tarefa-proxima' | 'agendamento-hoje'
  titulo: string
  detalhe: string
}

export function Notifications() {
  const [open, setOpen] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [itens, setItens] = useState<NotifItem[]>([])
  const ref = useRef<HTMLDivElement>(null)

  const carregar = async () => {
    const user = auth.currentUser
    if (!user) return
    setCarregando(true)
    try {
      const [tarefas, agendamentos] = await Promise.all([
        listarTarefas(user.uid),
        listarAgendamentos(user.uid),
      ])
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const agora = new Date()
      const em7Dias = new Date()
      em7Dias.setDate(em7Dias.getDate() + 7)

      const lista: NotifItem[] = []

      tarefas.forEach((t: Tarefa) => {
        if (t.status === 'done' || !t.prazo) return
        const d = paraDate(t.prazo)
        if (!d) return
        if (d < agora) {
          lista.push({
            id: `t-${t.id}`,
            tipo: 'tarefa-atrasada',
            titulo: t.titulo,
            detalhe: `Venceu em ${formatarData(d)}`,
          })
        } else if (d <= em7Dias) {
          lista.push({
            id: `t-${t.id}`,
            tipo: 'tarefa-proxima',
            titulo: t.titulo,
            detalhe: `Vence em ${formatarData(d)}`,
          })
        }
      })

      agendamentos.forEach((a: Agendamento) => {
        const d = paraDate(a.data)
        if (!d) return
        const dInicio = new Date(d)
        dInicio.setHours(0, 0, 0, 0)
        if (dInicio.getTime() === hoje.getTime() && a.status !== 'cancelado') {
          lista.push({
            id: `a-${a.id}`,
            tipo: 'agendamento-hoje',
            titulo: a.titulo,
            detalhe: `Hoje às ${a.horaInicio}`,
          })
        }
      })

      lista.sort((a, b) => {
        if (a.tipo === 'tarefa-atrasada') return -1
        if (b.tipo === 'tarefa-atrasada') return 1
        return 0
      })

      setItens(lista)
    } catch {
      setItens([])
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (open) carregar() // eslint-disable-line react-hooks/set-state-in-effect
  }, [open])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const total = itens.length

  return (
    <div ref={ref} className="relative">
      <button
        aria-label={`Notificações (${total})`}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl p-2.5 text-foreground transition-colors hover:bg-black/5"
      >
        <Bell className="h-5 w-5" />
        {total > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
            {total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-border bg-card shadow-soft-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notificações</p>
            {total > 0 && (
              <span className="text-xs text-muted-foreground">
                {total} pendente{total > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto py-2">
            {carregando ? (
              <div className="flex justify-center py-6">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
              </div>
            ) : itens.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <CheckCircle2 className="h-8 w-8 text-success" />
                <p className="text-sm text-muted-foreground">
                  Nenhuma notificação por enquanto
                </p>
              </div>
            ) : (
              itens.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    'flex items-start gap-3 px-4 py-2.5 transition-colors hover:bg-muted',
                    item.tipo === 'tarefa-atrasada' && 'bg-destructive/5'
                  )}
                >
                  {item.tipo === 'agendamento-hoje' ? (
                    <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-info" />
                  ) : item.tipo === 'tarefa-atrasada' ? (
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                  ) : (
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">
                      {item.titulo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.detalhe}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
