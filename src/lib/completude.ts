/**
 * Fonte única da verdade sobre a completude dos cadastros.
 *
 * Um registro pode ser salvo de forma provisória (incompleto) e depois
 * completado. Aqui definimos, por entidade, quais campos tornam o cadastro
 * "completo" e o que ainda falta.
 */

export type EntidadeCompletude = 'cliente' | 'agendamento' | 'tarefa' | 'nota'

export interface ResultadoCompletude {
  completa: boolean
  faltantes: string[]
  preenchidos: number
  total: number
  percentual: number
}

type Registro = Record<string, unknown>

interface CampoCompletude {
  chave: string
  rotulo: string
  preenchido: (registro: Registro) => boolean
}

function temValor(valor: unknown): boolean {
  if (valor === undefined || valor === null) return false
  if (typeof valor === 'string') return valor.trim().length > 0
  return true
}

function temTextoHtml(valor: unknown): boolean {
  if (typeof valor !== 'string') return temValor(valor)
  const texto = valor.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').trim()
  return texto.length > 0
}

const definicoes: Record<EntidadeCompletude, CampoCompletude[]> = {
  cliente: [
    { chave: 'nome', rotulo: 'Nome', preenchido: (r) => temValor(r.nome) },
    { chave: 'email', rotulo: 'E-mail', preenchido: (r) => temValor(r.email) },
    {
      chave: 'telefone',
      rotulo: 'Telefone',
      preenchido: (r) => temValor(r.telefone),
    },
    { chave: 'empresa', rotulo: 'Empresa', preenchido: (r) => temValor(r.empresa) },
  ],
  agendamento: [
    { chave: 'titulo', rotulo: 'Título', preenchido: (r) => temValor(r.titulo) },
    { chave: 'data', rotulo: 'Data', preenchido: (r) => temValor(r.data) },
    {
      chave: 'horaInicio',
      rotulo: 'Hora de início',
      preenchido: (r) => temValor(r.horaInicio),
    },
    {
      chave: 'horaFim',
      rotulo: 'Hora de fim',
      preenchido: (r) => temValor(r.horaFim),
    },
    {
      chave: 'clienteId',
      rotulo: 'Cliente',
      preenchido: (r) => temValor(r.clienteId),
    },
  ],
  tarefa: [
    { chave: 'titulo', rotulo: 'Título', preenchido: (r) => temValor(r.titulo) },
    { chave: 'prazo', rotulo: 'Prazo', preenchido: (r) => temValor(r.prazo) },
    {
      chave: 'clienteId',
      rotulo: 'Cliente',
      preenchido: (r) => temValor(r.clienteId),
    },
  ],
  nota: [
    { chave: 'titulo', rotulo: 'Título', preenchido: (r) => temValor(r.titulo) },
    {
      chave: 'conteudo',
      rotulo: 'Conteúdo',
      preenchido: (r) => temTextoHtml(r.conteudo),
    },
  ],
}

/**
 * Campos mínimos exigidos para salvar cada entidade (cadastro provisório é
 * permitido; o restante pode ser completado depois).
 */
export const CAMPOS_OBRIGATORIOS: Record<EntidadeCompletude, string[]> = {
  cliente: ['nome', 'telefone'],
  agendamento: ['titulo', 'data'],
  tarefa: ['titulo'],
  nota: ['titulo'],
}

export function avaliarCompletude(
  entidade: EntidadeCompletude,
  registro: unknown
): ResultadoCompletude {
  const dados = (registro ?? {}) as Registro
  const campos = definicoes[entidade]
  const faltantes = campos
    .filter((campo) => !campo.preenchido(dados))
    .map((campo) => campo.rotulo)
  const total = campos.length
  const preenchidos = total - faltantes.length
  const percentual = total === 0 ? 100 : Math.round((preenchidos / total) * 100)
  return {
    completa: faltantes.length === 0,
    faltantes,
    preenchidos,
    total,
    percentual,
  }
}
