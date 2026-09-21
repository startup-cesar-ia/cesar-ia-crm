import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { CategoriaArquivo } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarTamanho(bytes: number): string {
  if (typeof bytes !== 'number' || Number.isNaN(bytes) || bytes < 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(kb >= 10 ? 0 : 1)} KB`
  const mb = kb / 1024
  if (mb < 1024) return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`
  const gb = mb / 1024
  return `${gb.toFixed(gb >= 10 ? 0 : 1)} GB`
}

export function tipoDeArquivo(mime: string): CategoriaArquivo {
  const tipo = (mime || '').toLowerCase()
  if (tipo.startsWith('image/')) return 'imagem'
  if (tipo === 'application/pdf') return 'pdf'
  if (tipo.startsWith('text/')) return 'texto'
  if (
    tipo === 'application/json' ||
    tipo === 'application/xml' ||
    tipo.includes('javascript') ||
    tipo.includes('csv')
  ) {
    return 'texto'
  }
  return 'outros'
}

export function dataUrlBase64(dataUrl: string): string {
  const indice = dataUrl.indexOf(',')
  return indice >= 0 ? dataUrl.slice(indice + 1) : dataUrl
}

export function base64ParaBytes(base64: string): Uint8Array<ArrayBuffer> {
  const binaria = atob(base64)
  const bytes = new Uint8Array(binaria.length)
  for (let i = 0; i < binaria.length; i++) {
    bytes[i] = binaria.charCodeAt(i)
  }
  return bytes
}

export function base64ParaTexto(base64: string): string {
  return new TextDecoder('utf-8').decode(base64ParaBytes(base64))
}

export function base64ParaBlob(base64: string, mime: string): Blob {
  return new Blob([base64ParaBytes(base64)], { type: mime })
}
