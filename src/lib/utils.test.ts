import { describe, it, expect } from 'vitest'
import {
  formatarTamanho,
  tipoDeArquivo,
  dataUrlBase64,
  base64ParaTexto,
  base64ParaBytes,
} from './utils'

describe('formatarTamanho', () => {
  it('retorna bytes', () => {
    expect(formatarTamanho(0)).toBe('0 B')
    expect(formatarTamanho(512)).toBe('512 B')
  })

  it('retorna KB', () => {
    expect(formatarTamanho(1024)).toBe('1.0 KB')
  })

  it('retorna MB', () => {
    expect(formatarTamanho(3 * 1024 * 1024)).toBe('3.0 MB')
  })

  it('retorna GB', () => {
    expect(formatarTamanho(2 * 1024 * 1024 * 1024)).toBe('2.0 GB')
  })

  it('lida com valores inválidos', () => {
    expect(formatarTamanho(NaN)).toBe('0 B')
    expect(formatarTamanho(-1)).toBe('0 B')
  })
})

describe('tipoDeArquivo', () => {
  it('classifica imagens', () => {
    expect(tipoDeArquivo('image/png')).toBe('imagem')
    expect(tipoDeArquivo('image/jpeg')).toBe('imagem')
  })

  it('classifica pdf', () => {
    expect(tipoDeArquivo('application/pdf')).toBe('pdf')
  })

  it('classifica texto', () => {
    expect(tipoDeArquivo('text/plain')).toBe('texto')
    expect(tipoDeArquivo('application/json')).toBe('texto')
    expect(tipoDeArquivo('text/csv')).toBe('texto')
  })

  it('classifica demais como outros', () => {
    expect(tipoDeArquivo('application/zip')).toBe('outros')
    expect(tipoDeArquivo('')).toBe('outros')
  })
})

describe('helpers base64', () => {
  it('dataUrlBase64 extrai o conteúdo após a vírgula', () => {
    expect(dataUrlBase64('data:text/plain;base64,QUJD')).toBe('QUJD')
  })

  it('dataUrlBase64 retorna o próprio valor sem vírgula', () => {
    expect(dataUrlBase64('QUJD')).toBe('QUJD')
  })

  it('base64ParaBytes converte corretamente', () => {
    expect(Array.from(base64ParaBytes('AQID'))).toEqual([1, 2, 3])
  })

  it('base64ParaTexto decodifica UTF-8', () => {
    expect(base64ParaTexto('SGVsbG8gTXVuZG8=')).toBe('Hello Mundo')
  })
})
