import { Timestamp } from 'firebase/firestore'

export interface Usuario {
  uid: string
  nome: string
  email: string
  photoURL?: string
  criadoEm: Timestamp
}

export interface Cliente {
  id: string
  usuarioId: string
  nome: string
  email?: string
  telefone?: string
  empresa?: string
  cargo?: string
  tags: string[]
  notas?: string
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export interface Agendamento {
  id: string
  usuarioId: string
  clienteId?: string
  titulo: string
  descricao?: string
  data: Timestamp
  horaInicio: string
  horaFim: string
  status: 'confirmado' | 'pendente' | 'cancelado'
  criadoEm: Timestamp
}

export interface Tarefa {
  id: string
  usuarioId: string
  clienteId?: string
  titulo: string
  descricao?: string
  prazo?: Timestamp
  prioridade: 'baixa' | 'media' | 'alta'
  status: 'backlog' | 'todo' | 'doing' | 'done'
  criadoEm: Timestamp
}
