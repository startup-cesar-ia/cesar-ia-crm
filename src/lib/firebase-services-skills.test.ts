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

import { addDoc, updateDoc, deleteDoc, getDoc, getDocs } from 'firebase/firestore'
import {
  criarSkill,
  atualizarSkill,
  excluirSkill,
  buscarSkill,
  listarSkills,
  listarSkillsPaginado,
} from './firebase-services'

describe('firebase-services: skills', () => {
  beforeEach(() => vi.clearAllMocks())

  it('criarSkill salva os dados com datas', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 's1' } as never)
    const id = await criarSkill({
      usuarioId: 'u1',
      url: 'https://exemplo.com',
      titulo: 'Exemplo',
      descricao: 'Serve para X',
    })
    expect(id).toBe('s1')
    const data = vi.mocked(addDoc).mock.calls[0][1] as Record<string, unknown>
    expect(data.url).toBe('https://exemplo.com')
    expect(data.titulo).toBe('Exemplo')
    expect(data.criadoEm).toBeDefined()
    expect(data.atualizadoEm).toBeDefined()
  })

  it('atualizarSkill envia atualizadoEm', async () => {
    await atualizarSkill('s1', { descricao: 'Nova' })
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        descricao: 'Nova',
        atualizadoEm: expect.anything(),
      })
    )
  })

  it('excluirSkill chama deleteDoc', async () => {
    await excluirSkill('s1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('buscarSkill retorna null quando não existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never)
    expect(await buscarSkill('s1')).toBeNull()
  })

  it('buscarSkill retorna os dados quando existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 's1',
      data: () => ({ titulo: 'Skill' }),
    } as never)
    expect((await buscarSkill('s1'))?.titulo).toBe('Skill')
  })

  it('listarSkills ordena por atualizadoEm desc', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'a',
          data: () => ({
            titulo: 'Antiga',
            atualizadoEm: { toDate: () => new Date(2023, 0, 1) },
          }),
        },
        {
          id: 'b',
          data: () => ({
            titulo: 'Recente',
            atualizadoEm: { toDate: () => new Date(2024, 0, 1) },
          }),
        },
      ],
    } as never)
    const skills = await listarSkills('u1')
    expect(skills[0].titulo).toBe('Recente')
  })

  it('listarSkillsPaginado ordena por atualizadoEm desc', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        {
          id: 'a',
          data: () => ({
            titulo: 'Antiga',
            atualizadoEm: { toDate: () => new Date(2023, 0, 1) },
          }),
        },
        {
          id: 'b',
          data: () => ({
            titulo: 'Recente',
            atualizadoEm: { toDate: () => new Date(2024, 0, 1) },
          }),
        },
      ],
    } as never)
    const r = await listarSkillsPaginado('u1', 20, null)
    expect(r.itens[0].titulo).toBe('Recente')
    expect(r.proximoCursor).not.toBeNull()
  })
})
