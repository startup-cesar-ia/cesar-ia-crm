'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  buscarNota,
  criarNota,
  atualizarNota,
  listarArquivos,
  uploadArquivo,
  atualizarArquivo,
} from '@/lib/firebase-services'
import { Arquivo } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { NotaEditor } from '@/components/notas/editor'
import { UploadArquivo } from '@/components/arquivos/upload'
import { PreviewArquivo } from '@/components/arquivos/preview'
import { CompletenessBanner } from '@/components/completude/completeness-banner'
import { avaliarCompletude } from '@/lib/completude'
import { ArrowLeft, Save, Check, Paperclip, X, FileText } from 'lucide-react'
import DOMPurify from 'dompurify'

export default function NotaDetalhePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string
  const nova = id === 'nova'

  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [carregado, setCarregado] = useState(nova)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [anexos, setAnexos] = useState<Arquivo[]>([])
  const [anexoPreview, setAnexoPreview] = useState<Arquivo | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (nova) return
    let ativo = true
    buscarNota(id).then((nota) => {
      if (!ativo) return
      if (nota) {
        setTitulo(nota.titulo)
        setConteudo(nota.conteudo || '')
      } else {
        router.push('/notas')
      }
      setCarregado(true)
    })
    return () => {
      ativo = false
    }
  }, [id, nova, router])

  const carregarAnexos = async () => {
    const user = auth.currentUser
    if (!user || nova) return
    const todos = await listarArquivos(user.uid)
    setAnexos(
      todos.filter(
        (a) => a.vinculo?.tipo === 'nota' && a.vinculo.id === id
      )
    )
  }

  useEffect(() => {
    if (!nova && carregado) carregarAnexos() // eslint-disable-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [carregado, id, nova])

  const anexar = async (files: File[]) => {
    const user = auth.currentUser
    if (!user || nova) return
    for (const file of files) {
      await uploadArquivo(user.uid, file, { tipo: 'nota', id })
    }
    carregarAnexos()
  }

  const desvincular = async (arquivoId: string) => {
    await atualizarArquivo(arquivoId, { vinculo: null })
    carregarAnexos()
  }

  const salvar = async () => {
    const user = auth.currentUser
    if (!user) return
    setSalvando(true)
    const conteudoLimpo = DOMPurify.sanitize(conteudo)
    const dados = {
      titulo: titulo.trim() || 'Sem título',
      conteudo: conteudoLimpo,
      tags: [],
    }
    if (nova) {
      const novoId = await criarNota({ ...dados, usuarioId: user.uid })
      router.push(`/notas/${novoId}`)
    } else {
      await atualizarNota(id, dados)
    }
    setSalvando(false)
    setSalvo(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setSalvo(false), 5000)
  }

  if (!carregado) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    )
  }

  const faltantesNota = nova
    ? []
    : avaliarCompletude('nota', { titulo, conteudo }).faltantes

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="outline" onClick={() => router.push('/notas')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <Button onClick={salvar} disabled={salvando}>
          {salvo ? (
            <Check className="mr-2 h-4 w-4" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {salvando ? 'Salvando...' : salvo ? 'Salvo' : 'Salvar'}
        </Button>
      </div>

      <CompletenessBanner
        faltantes={faltantesNota}
        onCompletar={() =>
          editorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      />

      {salvo && (
        <p className="flex items-center gap-1.5 text-sm text-success">
          <Check className="h-4 w-4" /> Nota salva com sucesso.
        </p>
      )}

      <Input
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        placeholder="Título da nota"
        className="h-12 border-transparent bg-transparent px-0 text-2xl font-semibold shadow-none focus-visible:ring-0"
        aria-label="Título da nota"
      />

      <div ref={editorRef}>
        <NotaEditor conteudo={conteudo} onChange={setConteudo} />
      </div>

      {!nova && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Paperclip className="h-4 w-4" /> Anexos
            </h2>
            <UploadArquivo onFiles={anexar} rotulo="Anexar arquivo" />
          </div>

          {anexos.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nenhum anexo. Envie um arquivo para vinculá-lo a esta nota.
            </p>
          ) : (
            <ul className="space-y-2">
              {anexos.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center gap-2 rounded-lg border border-border p-2"
                >
                  <button
                    type="button"
                    onClick={() => setAnexoPreview(a)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="truncate text-sm text-foreground">
                      {a.nome}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => desvincular(a.id)}
                    aria-label={`Remover vínculo de ${a.nome}`}
                    className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <PreviewArquivo arquivo={anexoPreview} onClose={() => setAnexoPreview(null)} />
    </div>
  )
}
