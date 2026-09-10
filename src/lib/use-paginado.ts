'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

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

  // Mantém sempre a última versão de `buscar` sem fazer as funções
  // mudarem de identidade a cada render (evita loop de re-render no useEffect).
  const buscarRef = useRef(buscar)
  useEffect(() => {
    buscarRef.current = buscar
  })

  const carregarPrimeira = useCallback(async () => {
    setCarregando(true)
    try {
      const r = await buscarRef.current(qtd, null)
      setItens(r.itens)
      setCursor(r.proximoCursor)
      setTemMais(!!r.proximoCursor)
    } finally {
      setCarregando(false)
    }
  }, [qtd])

  const carregarMais = useCallback(async () => {
    if (!cursor || carregando) return
    setCarregando(true)
    try {
      const r = await buscarRef.current(qtd, cursor)
      setItens((prev) => [...prev, ...r.itens])
      setCursor(r.proximoCursor)
      setTemMais(!!r.proximoCursor)
    } finally {
      setCarregando(false)
    }
  }, [qtd, cursor, carregando])

  return { itens, setItens, carregando, temMais, carregarPrimeira, carregarMais }
}
