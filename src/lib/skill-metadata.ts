const ENTIDADES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

function decodificarEntidades(texto: string): string {
  return texto
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) =>
      String.fromCharCode(parseInt(n, 16))
    )
    .replace(/&([a-z]+);/gi, (m, nome) => ENTIDADES[nome.toLowerCase()] ?? m)
}

function limparTexto(texto: string): string {
  return decodificarEntidades(texto.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function lerAtributos(tag: string): Record<string, string> {
  const atributos: Record<string, string> = {}
  const re = /([a-zA-Z:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/g
  let match: RegExpExecArray | null
  while ((match = re.exec(tag)) !== null) {
    atributos[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? ''
  }
  return atributos
}

function cortar(texto: string, limite: number): string {
  return texto.length > limite ? `${texto.slice(0, limite - 1).trim()}…` : texto
}

export interface MetadadosSkill {
  titulo: string
  descricao: string
}

export function extrairMetadados(html: string): MetadadosSkill {
  const metas = html.match(/<meta\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi) ?? []
  let ogTitulo = ''
  let ogDescricao = ''
  let metaDescricao = ''

  for (const tag of metas) {
    const attrs = lerAtributos(tag)
    const chave = (attrs.property || attrs.name || '').toLowerCase()
    const conteudo = limparTexto(attrs.content || '')
    if (!conteudo) continue
    if (chave === 'og:title' && !ogTitulo) ogTitulo = conteudo
    if (chave === 'og:description' && !ogDescricao) ogDescricao = conteudo
    if (chave === 'description' && !metaDescricao) metaDescricao = conteudo
  }

  const tituloTag = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''
  const titulo = limparTexto(tituloTag)

  return {
    titulo: cortar(ogTitulo || titulo, 200),
    descricao: cortar(ogDescricao || metaDescricao, 500),
  }
}

export function normalizarUrl(entrada: string): string | null {
  const valor = entrada.trim()
  if (!valor) return null
  const comProtocolo = /^[a-z][a-z0-9+.-]*:\/\//i.test(valor)
    ? valor
    : `https://${valor}`
  try {
    const url = new URL(comProtocolo)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    if (!url.hostname) return null
    return url.toString()
  } catch {
    return null
  }
}

function hostPrivado(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '')
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host.endsWith('.localhost') ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true
  }
  if (/^127\./.test(host)) return true
  if (/^10\./.test(host)) return true
  if (/^192\.168\./.test(host)) return true
  if (/^169\.254\./.test(host)) return true
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return true
  if (host === '::' || (host.includes(':') && (host.startsWith('fc') || host.startsWith('fd'))))
    return true
  return false
}

export function urlPermitida(urlNormalizada: string): boolean {
  try {
    const url = new URL(urlNormalizada)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false
    return !hostPrivado(url.hostname)
  } catch {
    return false
  }
}

export function hostDaUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
