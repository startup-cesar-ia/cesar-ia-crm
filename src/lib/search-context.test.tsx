import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { SearchProvider, useSearch, normalizar, combinaTexto } from './search-context'

describe('normalizar', () => {
  it('remove acentos', () => {
    expect(normalizar('São João')).toBe('sao joao')
    expect(normalizar('CÉSAR')).toBe('cesar')
  })
})

describe('combinaTexto', () => {
  it('retorna true com busca vazia', () => {
    expect(combinaTexto('qualquer', '')).toBe(true)
    expect(combinaTexto('qualquer', '   ')).toBe(true)
  })

  it('compara sem diferenciar maiusculas e acentos', () => {
    expect(combinaTexto('Cliente São', 'cliente sao')).toBe(true)
    expect(combinaTexto('joão', 'JOAO')).toBe(true)
  })

  it('retorna false quando nao encontra', () => {
    expect(combinaTexto('cliente', 'nada')).toBe(false)
  })
})

describe('useSearch', () => {
  it('lança erro fora do provider', () => {
    expect(() => renderHook(() => useSearch())).toThrow()
  })

  it('provê query e setQuery', () => {
    const { result } = renderHook(() => useSearch(), {
      wrapper: ({ children }) => <SearchProvider>{children}</SearchProvider>,
    })
    expect(result.current.query).toBe('')
    act(() => result.current.setQuery('joao'))
    expect(result.current.query).toBe('joao')
  })
})
