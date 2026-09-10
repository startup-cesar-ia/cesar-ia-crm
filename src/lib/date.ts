import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function paraDate(valor: unknown): Date | null {
  if (!valor) return null
  if (typeof valor === 'object' && valor !== null && 'toDate' in valor && typeof (valor as { toDate: () => Date }).toDate === 'function') {
    return (valor as { toDate: () => Date }).toDate()
  }
  if (valor instanceof Date) return valor
  const d = new Date(String(valor))
  return isNaN(d.getTime()) ? null : d
}

export function formatarData(valor: unknown, padrao = 'dd/MM/yyyy'): string {
  const date = paraDate(valor)
  if (!date) return '-'
  return format(date, padrao, { locale: ptBR })
}

export function formatarDataHora(valor: unknown): string {
  return formatarData(valor, 'dd/MM/yyyy - HH:mm')
}
