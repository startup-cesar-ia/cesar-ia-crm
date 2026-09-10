'use client'

import { useCallback, useState } from 'react'

interface Resultado<T, C> {
  itens: T[]
  proximoCursor: C | null
}

export function usePaginado<T, C = unknown>(
  buscar: (qtd: number, cursor: C | null) => Promise<Resultado<T, C>>,
  qtd = 20
) {
  const [itens, setItens] = useState<T[]>([])
  const [cursor, setCursor] = useState<C | null>(null)
  const [temMais, setTemMais] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const carregarPrimeira = useCallback(async () => {
    setCarregando(true)
    try {
      const r = await buscar(qtd, null)
      setItens(r.itens)
      setCursor(r.proximoCursor)
      setTemMais(!!r.proximoCursor)
    } finally {
      setCarregando(false)
    }
  }, [buscar, qtd])

  const carregarMais = useCallback(async () => {
    if (!cursor || carregando) return
    setCarregando(true)
    try {
      const r = await buscar(qtd, cursor)
      setItens((prev) => [...prev, ...r.itens])
      setCursor(r.proximoCursor)
      setTemMais(!!r.proximoCursor)
    } finally {
      setCarregando(false)
    }
  }, [buscar, qtd, cursor, carregando])

  return { itens, setItens, carregando, temMais, carregarPrimeira, carregarMais }
}
