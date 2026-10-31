import { describe, it, expect, vi, afterEach } from 'vitest'
import {
  dividirTexto,
  parecePortugues,
  traduzirParaPortugues,
} from './translate'

function respostaJson(dados: unknown, ok = true) {
  return { ok, json: () => Promise.resolve(dados) } as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('translate: parecePortugues', () => {
  it('detecta português por acentos e palavras', () => {
    expect(parecePortugues('Crie um painel para você')).toBe(true)
    expect(parecePortugues('Guia de configuração')).toBe(true)
  })

  it('não considera inglês como português', () => {
    expect(parecePortugues('Build a responsive dashboard')).toBe(false)
  })
})

describe('translate: dividirTexto', () => {
  it('mantém textos curtos inteiros', () => {
    expect(dividirTexto('texto curto', 100)).toEqual(['texto curto'])
  })

  it('divide em partes dentro do limite', () => {
    const texto = Array.from({ length: 40 }, (_, i) => `palavra${i}`).join(' ')
    const partes = dividirTexto(texto, 80)
    expect(partes.length).toBeGreaterThan(1)
    partes.forEach((parte) => expect(parte.length).toBeLessThanOrEqual(80))
    expect(partes.join(' ')).toBe(texto)
  })
})

describe('translate: traduzirParaPortugues', () => {
  it('retorna vazio para texto vazio', async () => {
    expect(await traduzirParaPortugues('   ')).toBe('')
  })

  it('não traduz texto já em português', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    expect(await traduzirParaPortugues('Crie um painel para você')).toBe(
      'Crie um painel para você'
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('traduz pelo Google quando disponível', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        respostaJson([
          [['Crie um painel responsivo', 'Build a responsive dashboard']],
          null,
          'en',
        ])
      )
    )
    expect(
      await traduzirParaPortugues('Build a responsive dashboard')
    ).toBe('Crie um painel responsivo')
  })

  it('mantém o texto quando o Google detecta português', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(respostaJson([[['Original']], null, 'pt']))
    )
    expect(await traduzirParaPortugues('Original text')).toBe('Original text')
  })

  it('usa MyMemory quando o Google falha', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValueOnce(
        respostaJson({
          responseStatus: 200,
          responseData: { translatedText: 'Painel responsivo' },
        })
      )
    vi.stubGlobal('fetch', fetchMock)
    expect(await traduzirParaPortugues('Responsive dashboard')).toBe(
      'Painel responsivo'
    )
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retorna o original quando todos os provedores falham', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await traduzirParaPortugues('Responsive dashboard')).toBe(
      'Responsive dashboard'
    )
  })

  it('traduz textos longos em partes via MyMemory', async () => {
    const texto = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ')
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: false } as Response)
      .mockResolvedValue(
        respostaJson({
          responseStatus: 200,
          responseData: { translatedText: 'parte traduzida' },
        })
      )
    vi.stubGlobal('fetch', fetchMock)
    const traduzido = await traduzirParaPortugues(texto)
    expect(traduzido).toBe('parte traduzida parte traduzida')
    expect(fetchMock.mock.calls.length).toBeGreaterThan(2)
  })
})
