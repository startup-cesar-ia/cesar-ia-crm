import { describe, it, expect } from 'vitest'
import {
  extrairMetadados,
  hostDaUrl,
  normalizarUrl,
  urlPermitida,
} from './skill-metadata'

describe('skill-metadata: extrairMetadados', () => {
  it('prioriza og:title e og:description', () => {
    const html = `
      <html><head>
        <title>Título da aba</title>
        <meta name="description" content="Descrição comum" />
        <meta property="og:title" content="Título Social" />
        <meta property="og:description" content="Descrição Social" />
      </head></html>`
    expect(extrairMetadados(html)).toEqual({
      titulo: 'Título Social',
      descricao: 'Descrição Social',
    })
  })

  it('usa title e meta description como fallback', () => {
    const html = `<title>  Uma   Skill </title><meta name="description" content="Serve para X">`
    expect(extrairMetadados(html)).toEqual({
      titulo: 'Uma Skill',
      descricao: 'Serve para X',
    })
  })

  it('decodifica entidades e remove tags', () => {
    const html = `<title>Dicas &amp; Truques</title><meta name="description" content="Use &quot;isto&quot; <b>agora</b>">`
    expect(extrairMetadados(html)).toEqual({
      titulo: 'Dicas & Truques',
      descricao: 'Use "isto" agora',
    })
  })

  it('retorna vazio quando não há metadados', () => {
    expect(extrairMetadados('<html></html>')).toEqual({
      titulo: '',
      descricao: '',
    })
  })

  it('trunca títulos e descrições muito longos', () => {
    const html = `<title>${'a'.repeat(260)}</title><meta name="description" content="${'b'.repeat(600)}">`
    const meta = extrairMetadados(html)
    expect(meta.titulo.length).toBeLessThanOrEqual(200)
    expect(meta.descricao.length).toBeLessThanOrEqual(500)
  })
})

describe('skill-metadata: normalizarUrl', () => {
  it('adiciona https quando falta protocolo', () => {
    expect(normalizarUrl('exemplo.com/skill')).toBe(
      'https://exemplo.com/skill'
    )
  })

  it('mantém http e https', () => {
    expect(normalizarUrl('http://exemplo.com')).toBe('http://exemplo.com/')
    expect(normalizarUrl('https://exemplo.com')).toBe('https://exemplo.com/')
  })

  it('rejeita protocolos e entradas inválidas', () => {
    expect(normalizarUrl('ftp://exemplo.com')).toBeNull()
    expect(normalizarUrl('javascript:alert(1)')).toBeNull()
    expect(normalizarUrl('   ')).toBeNull()
    expect(normalizarUrl('http://')).toBeNull()
  })
})

describe('skill-metadata: urlPermitida', () => {
  it('aceita endereços públicos', () => {
    expect(urlPermitida('https://exemplo.com')).toBe(true)
  })

  it('bloqueia localhost e IPs privados', () => {
    expect(urlPermitida('http://localhost:3000')).toBe(false)
    expect(urlPermitida('http://127.0.0.1')).toBe(false)
    expect(urlPermitida('http://10.0.0.1')).toBe(false)
    expect(urlPermitida('http://192.168.1.1')).toBe(false)
    expect(urlPermitida('http://169.254.1.1')).toBe(false)
    expect(urlPermitida('http://172.20.0.1')).toBe(false)
    expect(urlPermitida('http://algo.local')).toBe(false)
  })

  it('rejeita URLs inválidas', () => {
    expect(urlPermitida('não é url')).toBe(false)
  })
})

describe('skill-metadata: hostDaUrl', () => {
  it('remove www', () => {
    expect(hostDaUrl('https://www.exemplo.com/path')).toBe('exemplo.com')
  })

  it('retorna a entrada quando inválida', () => {
    expect(hostDaUrl('invalido')).toBe('invalido')
  })
})
