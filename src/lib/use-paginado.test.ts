import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { usePaginado } from './use-paginado'

describe('usePaginado', () => {
  it('carrega primeira página', async () => {
    const buscar = vi.fn().mockResolvedValue({ itens: [1, 2], proximoCursor: 'c1' })
    const { result } = renderHook(() => usePaginado(buscar))
    act(() => {
      void result.current.carregarPrimeira()
    })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.itens).toEqual([1, 2])
    expect(result.current.temMais).toBe(true)
  })

  it('carrega mais e acumula itens', async () => {
    const buscar = vi
      .fn()
      .mockResolvedValueOnce({ itens: [1], proximoCursor: 'c1' })
      .mockResolvedValueOnce({ itens: [2], proximoCursor: null })
    const { result } = renderHook(() => usePaginado(buscar))
    act(() => {
      void result.current.carregarPrimeira()
    })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    act(() => {
      void result.current.carregarMais()
    })
    await waitFor(() => expect(result.current.carregando).toBe(false))
    expect(result.current.itens).toEqual([1, 2])
    expect(result.current.temMais).toBe(false)
  })

  it('não carrega mais sem cursor', async () => {
    const buscar = vi.fn()
    const { result } = renderHook(() => usePaginado(buscar))
    act(() => {
      void result.current.carregarMais()
    })
    expect(buscar).not.toHaveBeenCalled()
  })
})
