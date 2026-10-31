'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import {
  buscarSkill,
  criarSkill,
  atualizarSkill,
  excluirSkill,
} from '@/lib/firebase-services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ArrowLeft, Check, Save, Sparkles, Trash2, Wand2 } from 'lucide-react'
import { hostDaUrl, normalizarUrl } from '@/lib/skill-metadata'

interface PreviewResposta {
  titulo?: string
  descricao?: string
  aviso?: string
  erro?: string
}

export default function SkillDetalhePage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id as string
  const nova = id === 'nova'

  const [url, setUrl] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [carregado, setCarregado] = useState(nova)
  const [salvando, setSalvando] = useState(false)
  const [buscando, setBuscando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false)

  useEffect(() => {
    if (nova) return
    let ativo = true
    buscarSkill(id).then((skill) => {
      if (!ativo) return
      if (skill) {
        setUrl(skill.url)
        setTitulo(skill.titulo)
        setDescricao(skill.descricao || '')
      } else {
        router.push('/skills')
      }
      setCarregado(true)
    })
    return () => {
      ativo = false
    }
  }, [id, nova, router])

  const buscarMetadados = async (
    urlNormalizada: string
  ): Promise<PreviewResposta | null> => {
    try {
      const resposta = await fetch('/api/skills/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: urlNormalizada }),
      })
      return (await resposta.json()) as PreviewResposta
    } catch {
      return null
    }
  }

  const preencherAutomaticamente = async () => {
    const urlNormalizada = normalizarUrl(url)
    if (!urlNormalizada) {
      setErro('Informe um link válido.')
      return
    }
    setBuscando(true)
    setErro('')
    setAviso('')
    const dados = await buscarMetadados(urlNormalizada)
    if (dados?.titulo && !titulo.trim()) setTitulo(dados.titulo)
    if (dados?.descricao && !descricao.trim()) setDescricao(dados.descricao)
    if (dados?.aviso) setAviso(dados.aviso)
    setBuscando(false)
  }

  const salvar = async () => {
    const user = auth.currentUser
    if (!user) return

    const urlNormalizada = normalizarUrl(url)
    if (!urlNormalizada) {
      setErro('Informe um link válido.')
      return
    }

    setErro('')
    setAviso('')
    setSalvando(true)

    let tituloFinal = titulo.trim()
    let descricaoFinal = descricao.trim()

    if (!tituloFinal || !descricaoFinal) {
      const dados = await buscarMetadados(urlNormalizada)
      if (!tituloFinal) tituloFinal = dados?.titulo?.trim() || hostDaUrl(urlNormalizada)
      if (!descricaoFinal) descricaoFinal = dados?.descricao?.trim() || ''
      if (dados?.aviso) setAviso(dados.aviso)
    }

    const dados = {
      url: urlNormalizada,
      titulo: tituloFinal,
      descricao: descricaoFinal,
    }

    if (nova) {
      const novoId = await criarSkill({ ...dados, usuarioId: user.uid })
      router.push(`/skills/${novoId}`)
    } else {
      await atualizarSkill(id, dados)
      setUrl(urlNormalizada)
      setTitulo(tituloFinal)
      setDescricao(descricaoFinal)
      setSalvando(false)
      setSalvo(true)
      setTimeout(() => setSalvo(false), 5000)
    }
  }

  const confirmarExclusao = async () => {
    await excluirSkill(id)
    router.push('/skills')
  }

  if (!carregado) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size={32} />
      </div>
    )
  }

  return (
    <div className="min-w-0 max-w-full space-y-5">
      <div className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <Button
          variant="outline"
          onClick={() => router.push('/skills')}
          className="shrink-0"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        <div className="flex items-center gap-2">
          {!nova && (
            <Button
              variant="ghost"
              onClick={() => setConfirmandoExclusao(true)}
              className="shrink-0 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Excluir
            </Button>
          )}
          <Button onClick={salvar} disabled={salvando} className="shrink-0">
            {salvo ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {salvando ? 'Salvando...' : salvo ? 'Salvo' : 'Salvar'}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {nova ? 'Nova skill' : 'Editar skill'}
          </h2>
        </div>

        <div className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="skill-url">Link</Label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="skill-url"
                type="url"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://exemplo.com/skill"
                autoFocus={nova}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={preencherAutomaticamente}
                disabled={buscando || !url.trim()}
                className="shrink-0"
              >
                <Wand2 className="mr-2 h-4 w-4" />
                {buscando ? 'Buscando...' : 'Buscar automaticamente'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ao salvar, título e descrição são preenchidos automaticamente a
              partir do site.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skill-titulo">Título</Label>
            <Input
              id="skill-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nome da skill"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="skill-descricao">Para que serve</Label>
            <Textarea
              id="skill-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o que essa skill faz e quando usar."
            />
          </div>

          {erro && <p className="text-sm text-destructive">{erro}</p>}
          {aviso && <p className="text-sm text-warning">{aviso}</p>}
        </div>
      </div>

      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block break-all text-sm text-primary underline-offset-4 hover:underline"
        >
          Abrir link: {hostDaUrl(url)}
        </a>
      )}

      <ConfirmDialog
        open={confirmandoExclusao}
        title="Excluir skill"
        description="Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={confirmarExclusao}
        onCancel={() => setConfirmandoExclusao(false)}
      />
    </div>
  )
}
