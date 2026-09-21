import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Saudacao, saudacaoPorHora } from './saudacao'

describe('saudacaoPorHora', () => {
  it('retorna Bom dia até 11h', () => {
    expect(saudacaoPorHora(0)).toBe('Bom dia')
    expect(saudacaoPorHora(11)).toBe('Bom dia')
  })

  it('retorna Boa tarde entre 12h e 17h', () => {
    expect(saudacaoPorHora(12)).toBe('Boa tarde')
    expect(saudacaoPorHora(17)).toBe('Boa tarde')
  })

  it('retorna Boa noite a partir das 18h', () => {
    expect(saudacaoPorHora(18)).toBe('Boa noite')
    expect(saudacaoPorHora(23)).toBe('Boa noite')
  })
})

describe('Saudacao', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('mostra saudação e horário conforme a hora atual', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15, 9, 5))
    render(<Saudacao />)
    expect(screen.getByText('Bom dia, André')).toBeInTheDocument()
    expect(screen.getByText('09:05')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(60000)
    })
  })

  it('atualiza a saudação ao mudar o horário', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 0, 15, 20, 0))
    render(<Saudacao />)
    expect(screen.getByText('Boa noite, André')).toBeInTheDocument()
    expect(screen.getByText('20:00')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(60000)
    })
  })
})
