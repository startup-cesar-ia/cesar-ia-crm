import { NextResponse } from 'next/server'
import {
  extrairMetadados,
  hostDaUrl,
  normalizarUrl,
  urlPermitida,
} from '@/lib/skill-metadata'
import { traduzirParaPortugues } from '@/lib/translate'

export const runtime = 'nodejs'

const LIMITE_BYTES = 512 * 1024
const TIMEOUT_MS = 8000
const MAX_REDIRECTS = 3

const CABECALHOS = {
  'User-Agent':
    'Mozilla/5.0 (compatible; CesarIA-SkillsBot/1.0; +https://cesar.ia)',
  Accept: 'text/html,application/xhtml+xml',
}

async function buscarPagina(urlInicial: string): Promise<string | null> {
  let urlAtual = urlInicial

  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const resposta = await fetch(urlAtual, {
        signal: controller.signal,
        headers: CABECALHOS,
        redirect: 'manual',
      })

      if (resposta.status >= 300 && resposta.status < 400) {
        const local = resposta.headers.get('location')
        if (!local) return null
        const proxima = normalizarUrl(new URL(local, urlAtual).toString())
        if (!proxima || !urlPermitida(proxima)) return null
        urlAtual = proxima
        continue
      }

      if (!resposta.ok) return null

      const tipo = resposta.headers.get('content-type') ?? ''
      if (tipo && !/text\/html|application\/xhtml/i.test(tipo)) return null

      const html = await resposta.text()
      return html.slice(0, LIMITE_BYTES)
    } catch {
      return null
    } finally {
      clearTimeout(timeout)
    }
  }

  return null
}

export async function POST(request: Request) {
  let corpo: unknown
  try {
    corpo = await request.json()
  } catch {
    return NextResponse.json({ erro: 'Corpo inválido.' }, { status: 400 })
  }

  const entrada =
    typeof corpo === 'object' && corpo !== null && 'url' in corpo
      ? String((corpo as { url: unknown }).url ?? '')
      : ''

  const url = normalizarUrl(entrada)
  if (!url) {
    return NextResponse.json({ erro: 'URL inválida.' }, { status: 400 })
  }
  if (!urlPermitida(url)) {
    return NextResponse.json(
      { erro: 'Este endereço não pode ser acessado.' },
      { status: 400 }
    )
  }

  const html = await buscarPagina(url)
  if (!html) {
    return NextResponse.json({
      titulo: hostDaUrl(url),
      descricao: '',
      aviso: 'Não foi possível ler os dados desta página.',
    })
  }

  const metadados = extrairMetadados(html)
  const [titulo, descricao] = await Promise.all([
    traduzirParaPortugues(metadados.titulo),
    traduzirParaPortugues(metadados.descricao),
  ])
  return NextResponse.json({
    titulo: titulo || hostDaUrl(url),
    descricao,
  })
}
