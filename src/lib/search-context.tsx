'use client'

import {
  createContext,
  useContext,
  useState,
  useMemo,
  type ReactNode,
} from 'react'

interface SearchContextValue {
  query: string
  setQuery: (q: string) => void
}

const SearchContext = createContext<SearchContextValue | null>(null)

export function SearchProvider({ children }: { children: ReactNode }) {
  const [query, setQuery] = useState('')

  const value = useMemo(() => ({ query, setQuery }), [query])

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  )
}

export function useSearch(): SearchContextValue {
  const ctx = useContext(SearchContext)
  if (!ctx) {
    throw new Error('useSearch deve ser usado dentro de <SearchProvider>')
  }
  return ctx
}

export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function combinaTexto(texto: string, busca: string): boolean {
  if (!busca.trim()) return true
  return normalizar(texto).includes(normalizar(busca))
}
