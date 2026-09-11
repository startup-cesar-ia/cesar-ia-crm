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
    Timestamp: {
      now: () => ({ toDate: () => new Date() }),
      fromDate: (d: Date) => ({ toDate: () => d }),
    },
    QueryDocumentSnapshot: class {},
  }
})

import {
  addDoc,
  updateDoc,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore'
import {
  criarCliente,
  atualizarCliente,
  excluirCliente,
  salvarUsuario,
  listarClientes,
  criarTransacao,
  criarAgendamento,
  listarAgendamentos,
  atualizarAgendamento,
  excluirAgendamento,
  criarTarefa,
  listarTarefas,
  atualizarTarefa,
  excluirTarefa,
  atualizarTransacao,
  excluirTransacao,
  buscarCliente,
  buscarUsuario,
  listarClientesPaginado,
} from './firebase-services'

describe('firebase-services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('criarCliente chama addDoc com criadoEm e atualizadoEm', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'c1' } as never)
    const id = await criarCliente({ usuarioId: 'u1', nome: 'João', tags: [] })
    expect(id).toBe('c1')
    expect(addDoc).toHaveBeenCalledOnce()
    const data = vi.mocked(addDoc).mock.calls[0][1]
    expect(data.nome).toBe('João')
    expect(data.criadoEm).toBeDefined()
    expect(data.atualizadoEm).toBeDefined()
  })

  it('atualizarCliente chama updateDoc', async () => {
    await atualizarCliente('c1', { nome: 'Novo' })
    expect(updateDoc).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ nome: 'Novo' })
    )
  })

  it('excluirCliente chama deleteDoc', async () => {
    await excluirCliente('c1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('salvarUsuario cria documento quando não existe e remove photoURL undefined', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never)
    await salvarUsuario({
      uid: 'u1',
      nome: 'Ana',
      email: 'ana@x.com',
      photoURL: undefined,
    })
    expect(setDoc).toHaveBeenCalledOnce()
    const data = vi.mocked(setDoc).mock.calls[0][1] as Record<string, unknown>
    expect(data.nome).toBe('Ana')
    expect(data.criadoEm).toBeDefined()
    expect('photoURL' in data).toBe(false)
  })

  it('salvarUsuario atualiza quando documento existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true } as never)
    await salvarUsuario({ uid: 'u1', nome: 'Ana', email: 'ana@x.com' })
    expect(updateDoc).toHaveBeenCalledOnce()
    expect(setDoc).not.toHaveBeenCalled()
  })

  it('listarClientes mapeia e ordena por criadoEm desc', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: 'a', data: () => ({ nome: 'Antigo', criadoEm: { toDate: () => new Date(2023, 0, 1) } }) },
        { id: 'b', data: () => ({ nome: 'Novo', criadoEm: { toDate: () => new Date(2024, 0, 1) } }) },
      ],
    } as never)
    const clientes = await listarClientes('u1')
    expect(clientes).toHaveLength(2)
    expect(clientes[0].nome).toBe('Novo')
    expect(clientes[1].nome).toBe('Antigo')
  })

  it('criarTransacao chama addDoc', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 't1' } as never)
    const id = await criarTransacao({
      usuarioId: 'u1',
      tipo: 'receita',
      descricao: 'Venda',
      valor: 100,
      data: new Date() as never,
      categoria: 'Vendas',
      status: 'pago',
    })
    expect(id).toBe('t1')
  })

  it('buscarCliente retorna null quando não existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never)
    expect(await buscarCliente('c1')).toBeNull()
  })

  it('buscarCliente retorna dados quando existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      id: 'c1',
      data: () => ({ nome: 'João' }),
    } as never)
    const cliente = await buscarCliente('c1')
    expect(cliente?.nome).toBe('João')
  })

  it('buscarUsuario retorna null quando não existe', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never)
    expect(await buscarUsuario('u1')).toBeNull()
  })
})

describe('firebase-services: agendamentos e tarefas', () => {
  beforeEach(() => vi.clearAllMocks())

  it('criarAgendamento chama addDoc', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'a1' } as never)
    const id = await criarAgendamento({
      usuarioId: 'u1',
      titulo: 'Reunião',
      data: new Date() as never,
      horaInicio: '09:00',
      horaFim: '10:00',
      status: 'pendente',
    })
    expect(id).toBe('a1')
  })

  it('listarAgendamentos ordena por data desc', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: 'a', data: () => ({ titulo: 'Ontem', data: { toDate: () => new Date(2024, 0, 1) } }) },
        { id: 'b', data: () => ({ titulo: 'Hoje', data: { toDate: () => new Date(2024, 0, 2) } }) },
      ],
    } as never)
    const lista = await listarAgendamentos('u1')
    expect(lista[0].titulo).toBe('Hoje')
  })

  it('atualizarAgendamento e excluirAgendamento chamam os serviços', async () => {
    await atualizarAgendamento('a1', { titulo: 'X' })
    expect(updateDoc).toHaveBeenCalledOnce()
    await excluirAgendamento('a1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('criarTarefa e listarTarefas funcionam', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 't' } as never)
    const id = await criarTarefa({ usuarioId: 'u1', titulo: 'T', prioridade: 'alta', status: 'todo' })
    expect(id).toBe('t')
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ id: 't', data: () => ({ titulo: 'T', criadoEm: { toDate: () => new Date() } }) }],
    } as never)
    const lista = await listarTarefas('u1')
    expect(lista[0].titulo).toBe('T')
  })

  it('atualizarTarefa e excluirTarefa chamam os serviços', async () => {
    await atualizarTarefa('t1', { status: 'done' })
    expect(updateDoc).toHaveBeenCalledOnce()
    await excluirTarefa('t1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })
})

describe('firebase-services: transações e paginação', () => {
  beforeEach(() => vi.clearAllMocks())

  it('atualizarTransacao e excluirTransacao chamam os serviços', async () => {
    await atualizarTransacao('x1', { valor: 50 })
    expect(updateDoc).toHaveBeenCalledOnce()
    await excluirTransacao('x1')
    expect(deleteDoc).toHaveBeenCalledOnce()
  })

  it('listarClientesPaginado retorna itens e cursor', async () => {
    vi.mocked(getDocs).mockResolvedValue({
      docs: [
        { id: 'a', data: () => ({ nome: 'A', criadoEm: { toDate: () => new Date(2024, 0, 1) } }) },
        { id: 'b', data: () => ({ nome: 'B', criadoEm: { toDate: () => new Date(2024, 0, 2) } }) },
      ],
    } as never)
    const r = await listarClientesPaginado('u1', 20, null)
    expect(r.itens).toHaveLength(2)
    expect(r.proximoCursor).not.toBeNull()
  })
})
