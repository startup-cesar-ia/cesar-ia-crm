import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import { db } from './firebase'
import { Cliente, Agendamento, Tarefa, Transacao, Usuario } from '@/types'

interface Paginado<T> {
  itens: T[]
  proximoCursor: QueryDocumentSnapshot | null
}

function basePaginado(
  colecao: string,
  usuarioId: string,
  qtd: number,
  cursor?: QueryDocumentSnapshot | null
) {
  const restricoes: unknown[] = [
    where('usuarioId', '==', usuarioId),
    orderBy('__name__', 'asc'),
    limit(qtd),
  ]
  if (cursor) restricoes.push(startAfter(cursor))
  return query(collection(db, colecao), ...restricoes)
}

function paraMillis(valor: unknown): number {
  if (!valor) return 0
  if (typeof valor === 'object' && valor !== null && 'toDate' in valor && typeof (valor as { toDate: () => Date }).toDate === 'function') {
    return (valor as { toDate: () => Date }).toDate().getTime()
  }
  if (valor instanceof Date) return valor.getTime()
  return new Date(String(valor)).getTime() || 0
}

export async function listarProximosAgendamentos(usuarioId: string, limite: number = 5) {
  const inicioHoje = new Date()
  inicioHoje.setHours(0, 0, 0, 0)
  const q = query(
    collection(db, 'agendamentos'),
    where('usuarioId', '==', usuarioId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }) as Agendamento)
    .filter((a: Agendamento) => paraMillis(a.data) >= inicioHoje.getTime())
    .sort((a: Agendamento, b: Agendamento) => paraMillis(a.data) - paraMillis(b.data))
    .slice(0, limite)
}

export async function contarAgendamentos(usuarioId: string) {
  const q = query(
    collection(db, 'agendamentos'),
    where('usuarioId', '==', usuarioId)
  )
  const snapshot = await getDocs(q)
  return snapshot.size
}

// Clientes
export async function criarCliente(cliente: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>) {
  const docRef = await addDoc(collection(db, 'clientes'), {
    ...cliente,
    criadoEm: Timestamp.now(),
    atualizadoEm: Timestamp.now(),
  })
  return docRef.id
}

export async function listarClientes(usuarioId: string) {
  const q = query(
    collection(db, 'clientes'),
    where('usuarioId', '==', usuarioId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }) as Cliente)
    .sort((a: Cliente, b: Cliente) => paraMillis(b.criadoEm) - paraMillis(a.criadoEm))
}

export async function buscarCliente(id: string) {
  const docRef = doc(db, 'clientes', id)
  const docSnap = await getDoc(docRef)
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Cliente
  }
  return null
}

export async function atualizarCliente(id: string, dados: Partial<Cliente>) {
  const docRef = doc(db, 'clientes', id)
  await updateDoc(docRef, {
    ...dados,
    atualizadoEm: Timestamp.now(),
  })
}

export async function excluirCliente(id: string) {
  const docRef = doc(db, 'clientes', id)
  await deleteDoc(docRef)
}

// Agendamentos
export async function criarAgendamento(agendamento: Omit<Agendamento, 'id' | 'criadoEm'>) {
  const docRef = await addDoc(collection(db, 'agendamentos'), {
    ...agendamento,
    criadoEm: Timestamp.now(),
  })
  return docRef.id
}

export async function listarAgendamentos(usuarioId: string) {
  const q = query(
    collection(db, 'agendamentos'),
    where('usuarioId', '==', usuarioId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }) as Agendamento)
    .sort((a: Agendamento, b: Agendamento) => paraMillis(b.data) - paraMillis(a.data))
}

export async function atualizarAgendamento(id: string, dados: Partial<Agendamento>) {
  const docRef = doc(db, 'agendamentos', id)
  await updateDoc(docRef, dados)
}

export async function excluirAgendamento(id: string) {
  const docRef = doc(db, 'agendamentos', id)
  await deleteDoc(docRef)
}

// Tarefas
export async function criarTarefa(tarefa: Omit<Tarefa, 'id' | 'criadoEm'>) {
  const docRef = await addDoc(collection(db, 'tarefas'), {
    ...tarefa,
    criadoEm: Timestamp.now(),
  })
  return docRef.id
}

export async function listarTarefas(usuarioId: string) {
  const q = query(
    collection(db, 'tarefas'),
    where('usuarioId', '==', usuarioId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }) as Tarefa)
    .sort((a: Tarefa, b: Tarefa) => paraMillis(b.criadoEm) - paraMillis(a.criadoEm))
}

export async function atualizarTarefa(id: string, dados: Partial<Tarefa>) {
  const docRef = doc(db, 'tarefas', id)
  await updateDoc(docRef, dados)
}

export async function excluirTarefa(id: string) {
  const docRef = doc(db, 'tarefas', id)
  await deleteDoc(docRef)
}

// Usuários
function semIndefinidos<T extends Record<string, unknown>>(obj: T): T {
  return Object.fromEntries(
    Object.entries(obj).filter(([, valor]) => valor !== undefined)
  ) as T
}

export async function salvarUsuario(usuario: Omit<Usuario, 'criadoEm'>) {
  const docRef = doc(db, 'usuarios', usuario.uid)
  const snap = await getDoc(docRef)
  const dadosLimpos = semIndefinidos({ ...usuario, criadoEm: Timestamp.now() })
  if (snap.exists()) {
    await updateDoc(docRef, semIndefinidos({ nome: usuario.nome, photoURL: usuario.photoURL }))
  } else {
    await setDoc(docRef, dadosLimpos)
  }
}

export async function buscarUsuario(uid: string): Promise<Usuario | null> {
  const docRef = doc(db, 'usuarios', uid)
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    return { uid: snap.id, ...snap.data() } as Usuario
  }
  return null
}

// Transações
export async function criarTransacao(
  transacao: Omit<Transacao, 'id' | 'criadoEm'>
) {
  const docRef = await addDoc(collection(db, 'transacoes'), {
    ...transacao,
    criadoEm: Timestamp.now(),
  })
  return docRef.id
}

export async function listarTransacoes(usuarioId: string) {
  const q = query(
    collection(db, 'transacoes'),
    where('usuarioId', '==', usuarioId)
  )
  const snapshot = await getDocs(q)
  return snapshot.docs
    .map((d: QueryDocumentSnapshot) => ({ id: d.id, ...d.data() }) as Transacao)
    .sort((a: Transacao, b: Transacao) => paraMillis(b.data) - paraMillis(a.data))
}

export async function atualizarTransacao(
  id: string,
  dados: Partial<Transacao>
) {
  const docRef = doc(db, 'transacoes', id)
  await updateDoc(docRef, dados)
}

export async function excluirTransacao(id: string) {
  const docRef = doc(db, 'transacoes', id)
  await deleteDoc(docRef)
}

// Paginação por cursor (lista os documentos na ordem padrão de __name__,
// sem exigir índices compostos)
export async function listarClientesPaginado(
  usuarioId: string,
  qtd = 20,
  cursor?: QueryDocumentSnapshot | null
): Promise<Paginado<Cliente>> {
  const snapshot = await getDocs(basePaginado('clientes', usuarioId, qtd, cursor))
  const itens = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Cliente)
    .sort((a, b) => paraMillis(b.criadoEm) - paraMillis(a.criadoEm))
  return { itens, proximoCursor: snapshot.docs.at(-1) ?? null }
}

export async function listarAgendamentosPaginado(
  usuarioId: string,
  qtd = 20,
  cursor?: QueryDocumentSnapshot | null
): Promise<Paginado<Agendamento>> {
  const snapshot = await getDocs(basePaginado('agendamentos', usuarioId, qtd, cursor))
  const itens = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Agendamento)
    .sort((a, b) => paraMillis(b.data) - paraMillis(a.data))
  return { itens, proximoCursor: snapshot.docs.at(-1) ?? null }
}

export async function listarTarefasPaginado(
  usuarioId: string,
  qtd = 20,
  cursor?: QueryDocumentSnapshot | null
): Promise<Paginado<Tarefa>> {
  const snapshot = await getDocs(basePaginado('tarefas', usuarioId, qtd, cursor))
  const itens = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Tarefa)
    .sort((a, b) => paraMillis(b.criadoEm) - paraMillis(a.criadoEm))
  return { itens, proximoCursor: snapshot.docs.at(-1) ?? null }
}

export async function listarTransacoesPaginado(
  usuarioId: string,
  qtd = 20,
  cursor?: QueryDocumentSnapshot | null
): Promise<Paginado<Transacao>> {
  const snapshot = await getDocs(basePaginado('transacoes', usuarioId, qtd, cursor))
  const itens = snapshot.docs
    .map((d) => ({ id: d.id, ...d.data() }) as Transacao)
    .sort((a, b) => paraMillis(b.data) - paraMillis(a.data))
  return { itens, proximoCursor: snapshot.docs.at(-1) ?? null }
}
