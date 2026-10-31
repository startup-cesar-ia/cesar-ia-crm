const PALAVRAS_PT = [
  ' de ',
  ' da ',
  ' do ',
  ' das ',
  ' dos ',
  ' para ',
  ' com ',
  ' uma ',
  ' um ',
  ' não ',
  ' que ',
  ' você ',
  ' seu ',
  ' sua ',
  ' como ',
  ' mais ',
  ' isso ',
  ' esta ',
  ' este ',
  ' são ',
  ' pelo ',
  ' pela ',
  ' sobre ',
  ' criar ',
  ' usando ',
]

const LIMITE_CHUNK = 450

const ACENTOS_PT = /[ãõçáéíóúâêôà]/

export function parecePortugues(texto: string): boolean {
  const normalizado = ` ${texto.toLowerCase()} `
  if (ACENTOS_PT.test(normalizado)) return true
  const acertos = PALAVRAS_PT.filter((palavra) =>
    normalizado.includes(palavra)
  ).length
  return acertos >= 2
}

export function dividirTexto(texto: string, limite = LIMITE_CHUNK): string[] {
  if (texto.length <= limite) return [texto]
  const partes: string[] = []
  let atual = ''
  for (const palavra of texto.split(/\s+/)) {
    const candidato = atual ? `${atual} ${palavra}` : palavra
    if (candidato.length > limite && atual) {
      partes.push(atual)
      atual = palavra
    } else {
      atual = candidato
    }
  }
  if (atual) partes.push(atual)
  return partes
}

async function fetchComTimeout(url: string, tempoMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), tempoMs)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function traduzirGoogle(texto: string): Promise<string | null> {
  const params = new URLSearchParams({
    client: 'gtx',
    sl: 'auto',
    tl: 'pt-BR',
    dt: 't',
    q: texto,
  })
  try {
    const resposta = await fetchComTimeout(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
      6000
    )
    if (!resposta.ok) return null
    const dados: unknown = await resposta.json()
    if (!Array.isArray(dados)) return null
    const fonte = typeof dados[2] === 'string' ? dados[2].toLowerCase() : ''
    if (fonte.startsWith('pt')) return texto
    const segmentos = dados[0]
    if (!Array.isArray(segmentos)) return null
    const traducao = segmentos
      .map((segmento) =>
        Array.isArray(segmento) && typeof segmento[0] === 'string'
          ? segmento[0]
          : ''
      )
      .join('')
      .trim()
    return traducao || null
  } catch {
    return null
  }
}

async function traduzirMyMemory(texto: string): Promise<string | null> {
  const partes = dividirTexto(texto)
  const traduzidas: string[] = []
  for (const parte of partes) {
    const params = new URLSearchParams({ q: parte, langpair: 'en|pt-BR' })
    try {
      const resposta = await fetchComTimeout(
        `https://api.mymemory.translated.net/get?${params.toString()}`,
        8000
      )
      if (!resposta.ok) return null
      const dados = (await resposta.json()) as {
        responseStatus?: number | string
        responseData?: { translatedText?: string }
      }
      if (Number(dados.responseStatus) !== 200) return null
      const traducao = dados.responseData?.translatedText?.trim()
      if (!traducao) return null
      traduzidas.push(traducao)
    } catch {
      return null
    }
  }
  return traduzidas.join(' ')
}

export async function traduzirParaPortugues(texto: string): Promise<string> {
  const limpo = texto.trim()
  if (!limpo || parecePortugues(limpo)) return limpo
  const viaGoogle = await traduzirGoogle(limpo)
  if (viaGoogle) return viaGoogle
  const viaMyMemory = await traduzirMyMemory(limpo)
  return viaMyMemory || limpo
}
