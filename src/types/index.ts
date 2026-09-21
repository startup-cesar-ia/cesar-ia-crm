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

export type TipoTransacao = 'receita' | 'despesa'
export type StatusTransacao = 'pago' | 'pendente'

export interface Transacao {
  id: string
  usuarioId: string
  tipo: TipoTransacao
  descricao: string
  valor: number
  data: Timestamp
  categoria: string
  clienteId?: string
  status: StatusTransacao
  criadoEm: Timestamp
}

export const CATEGORIAS_RECEITA = ['Vendas', 'Serviços', 'Consultoria', 'Outros']
export const CATEGORIAS_DESPESA = ['Fornecedores', 'Marketing', 'Equipamentos', 'Pessoal', 'Outros']

export interface Nota {
  id: string
  usuarioId: string
  titulo: string
  conteudo: string
  tags: string[]
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export type TipoVinculo = 'nota' | 'cliente' | 'tarefa'

export interface VinculoArquivo {
  tipo: TipoVinculo
  id: string
}

export interface Arquivo {
  id: string
  usuarioId: string
  nome: string
  tipo: string
  tamanho: number
  dados: string
  vinculo?: VinculoArquivo
  criadoEm: Timestamp
}

export type CategoriaArquivo = 'imagem' | 'pdf' | 'texto' | 'outros'

export const CATEGORIAS_ARQUIVO: Record<CategoriaArquivo, string> = {
  imagem: 'Imagem',
  pdf: 'PDF',
  texto: 'Texto',
  outros: 'Outros',
}

export const TAMANHO_MAXIMO_ARQUIVO_BYTES = 700 * 1024
