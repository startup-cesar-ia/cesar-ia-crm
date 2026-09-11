import { describe, it, expect } from 'vitest'
import { paraDate, formatarData, formatarDataHora } from './date'

describe('date utils', () => {
  it('paraDate retorna null para valores vazios', () => {
    expect(paraDate(null)).toBeNull()
    expect(paraDate(undefined)).toBeNull()
    expect(paraDate('')).toBeNull()
    expect(paraDate('invalido')).toBeNull()
  })

  it('paraDate converte Date', () => {
    const d = new Date('2024-01-15T10:00:00')
    expect(paraDate(d)?.getTime()).toBe(d.getTime())
  })

  it('paraDate converte objeto com toDate (Firestore Timestamp)', () => {
    const d = new Date('2024-01-15T10:00:00')
    const ts = { toDate: () => d }
    expect(paraDate(ts)?.getTime()).toBe(d.getTime())
  })

  it('paraDate converte string ISO', () => {
    const d = paraDate('2024-01-15')
    expect(d?.getFullYear()).toBe(2024)
  })

  it('formatarData formata dd/MM/yyyy', () => {
    const d = new Date(2024, 0, 15, 10, 0, 0)
    expect(formatarData(d)).toBe('15/01/2024')
  })

  it('formatarData retorna "-" para valor nulo', () => {
    expect(formatarData(null)).toBe('-')
  })

  it('formatarDataHora inclui hora', () => {
    const d = new Date(2024, 0, 15, 14, 30, 0)
    expect(formatarDataHora(d)).toBe('15/01/2024 - 14:30')
  })
})
