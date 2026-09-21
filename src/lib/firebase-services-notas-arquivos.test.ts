import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('./firebase', () => ({ db: {} }))

vi.mock('firebase/firestore', () => {
  return {
    collection: vi.fn(),
    doc: vi.fn(() => ({})),
    addDoc: vi.fn(),
    updateDoc: vi.fn(),
    setDoc: vi.fn(),
    deleteDoc: vi.fn(),
    getDoc: vi.fn(),
    getDocs: vi.fn(),
    query: vi.fn(() => ({})),
    where: vi.fn(() => ({})),
    orderBy: vi.fn(() => ({})),
    limit: vi.fn(() => ({})),
    startAfter: vi.fn(() => ({})),
    deleteField: vi.fn(() => ({ __deleteField: true })),
    Timestamp: {
      now: () => ({ toDate: () => new Date() }),
      fromDate: (d: Date) => ({ toDate: () => d }),
    },
    QueryDocumentSnapshot: class {},
  }
})

import { addDoc, updateDoc, deleteDoc, getDoc, getDocs, deleteField } from 'firebase/firestore'
import {
  criarNota,
  atualizarNota,
  excluirNota,
  listarNotas,
  buscarNota,
  listarNotasPaginado,
  uploadArquivo,
  listarArquivos,
  atualizarArquivo,
  vincularArquivoANota,
  excluirArquivo,
  listarArquivosPaginado,
} from './firebase-services'

const fileFake = (overrides = {}) =>
  ({
    name: 'documento.pdf',
    type: 'application/pdf',
    size: 256,
    arrayBuffer: () => Promise.resolve(new Uint8Array([1, 2, 3]).buffer),
    ...overrides,
  }) as unknown as File

describe('firebase-services: notas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('criarNota chama addDoc com criadoEm e atualizadoEm', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'n1' } as never)
    const id = await criarNota({ usuarioId: 'u1', titulo: 'Ideia', conteudo: '<p>x</p>', tags: [] })
    expect(id).toBe('n1')
    const data = vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>
    expect(data.titulo).toBe('Ideia')
    expect(data.criadoEm).toBeDefined()
    expect(data.atualizadoEm).toBeDefined()
  })

  it('atualizarNota chama updateDoc com atualizadoEm', async () => {
    await atualizarNota('n1', { titulo: 'Novo' })
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ titulo: 'Novo', atualizadoEm: expect.anything() })
    )
  })

  it('excluirNota chama deleteDoc', async () => {
    await excluirNota('n1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('listarNotas ordena por atualizadoEm desc', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: 'a', data: () => ({ titulo: 'Antiga', atualizadoEm: { toDate: () => new Date(2023, 0, 1) } }) },
        { id: 'b', data: () => ({ titulo: 'Recente', atualizadoEm: { toDate: () => new Date(2024, 0, 1) } }) },
      ],
    } as never)
    const notas = await listarNotas('u1')
    expect(notas[0].titulo).toBe('Recente')
  })

  it('buscarNota retorna null quando não existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never)
    expect(await buscarNota('n1')).toBeNull()
  })

  it('buscarNota retorna dados quando existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true, id: 'n1', data: () => ({ titulo: 'T' }) } as never)
    expect((await buscarNota('n1'))?.titulo).toBe('T')
  })

  it('listarNotasPaginado retorna itens e cursor', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ id: 'a', data: () => ({ titulo: 'A', atualizadoEm: { toDate: () => new Date() } }) }],
    } as never)
    const r = await listarNotasPaginado('u1', 20, null)
    expect(r.itens).toHaveLength(1)
    expect(r.proximoCursor).not.toBeNull()
  })
})

describe('firebase-services: arquivos', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uploadArquivo salva base64 e cria documento', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'a1' } as never)
    const id = await uploadArquivo('u1', fileFake())
    expect(id).toBe('a1')
    const data = vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>
    expect(data.nome).toBe('documento.pdf')
    expect(data.tamanho).toBe(256)
    expect(data.dados).toBe('data:application/pdf;base64,AQID')
    expect(data.vinculo).toBeUndefined()
  })

  it('uploadArquivo inclui vínculo quando informado', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'a1' } as never)
    await uploadArquivo('u1', fileFake(), { tipo: 'nota', id: 'n1' })
    const data = vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>
    expect(data.vinculo).toEqual({ tipo: 'nota', id: 'n1' })
  })

  it('uploadArquivo rejeita arquivo acima do limite', async () => {
    await expect(
      uploadArquivo('u1', fileFake({ size: 800 * 1024 }))
    ).rejects.toThrow('Arquivo acima do limite de tamanho.')
    expect(addDoc).not.toHaveBeenCalled()
  })

  it('listarArquivos ordena por criadoEm desc', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: 'a', data: () => ({ nome: 'A', criadoEm: { toDate: () => new Date(2023, 0, 1) } }) },
        { id: 'b', data: () => ({ nome: 'B', criadoEm: { toDate: () => new Date(2024, 0, 1) } }) },
      ],
    } as never)
    const lista = await listarArquivos('u1')
    expect(lista[0].nome).toBe('B')
  })

  it('atualizarArquivo usa deleteField quando vinculo é null', async () => {
    await atualizarArquivo('a1', { vinculo: null })
    expect(deleteField).toHaveBeenCalledOnce()
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ vinculo: { __deleteField: true } })
    )
  })

  it('vincularArquivoANota atualiza vínculo', async () => {
    await vincularArquivoANota('a1', 'n1')
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ vinculo: { tipo: 'nota', id: 'n1' } })
    )
  })

  it('excluirArquivo chama deleteDoc', async () => {
    await excluirArquivo('a1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('listarArquivosPaginado retorna itens e cursor', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ id: 'a', data: () => ({ nome: 'A', criadoEm: { toDate: () => new Date() } }) }],
    } as never)
    const r = await listarArquivosPaginado('u1', 20, null)
    expect(r.itens).toHaveLength(1)
    expect(r.proximoCursor).not.toBeNull()
  })
})
