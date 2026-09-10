'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { buscarCliente, atualizarCliente, excluirCliente } from '@/lib/firebase-services'
import { Cliente } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ClienteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clienteId = params.id as string

  const [cliente, setCliente] = useState<Cliente | null>(null)
  const [editando, setEditando] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    empresa: '',
    cargo: '',
    tags: [] as string[],
    notas: '',
  })

  const [tagInput, setTagInput] = useState('')

  const carregarCliente = useCallback(async () => {
    setCarregando(true)
    const dados = await buscarCliente(clienteId)
    if (dados) {
      setCliente(dados)
      setFormData({
        nome: dados.nome,
        email: dados.email || '',
        telefone: dados.telefone || '',
        empresa: dados.empresa || '',
        cargo: dados.cargo || '',
        tags: dados.tags || [],
        notas: dados.notas || '',
      })
    }
    setCarregando(false)
  }, [clienteId])

  useEffect(() => {
    carregarCliente() // eslint-disable-line react-hooks/set-state-in-effect
  }, [carregarCliente])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()],
        }))
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSalvar = async () => {
    setErro('')

    if (!formData.nome.trim()) {
      setErro('Nome é obrigatório')
      return
    }

    try {
      setSalvando(true)
      await atualizarCliente(clienteId, {
        nome: formData.nome.trim(),
        email: formData.email.trim() || undefined,
        telefone: formData.telefone.trim() || undefined,
        empresa: formData.empresa.trim() || undefined,
        cargo: formData.cargo.trim() || undefined,
        tags: formData.tags,
        notas: formData.notas.trim() || undefined,
      })
      setEditando(false)
      carregarCliente()
    } catch {
      setErro('Erro ao salvar cliente')
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async () => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      await excluirCliente(clienteId)
      router.push('/clientes')
    }
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!cliente) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Cliente não encontrado</p>
        <Link href="/clientes">
          <Button className="mt-4">Voltar</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/clientes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {editando ? 'Editar Cliente' : cliente.nome}
            </h1>
            {!editando && cliente.empresa && (
              <p className="text-muted-foreground">{cliente.empresa}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {!editando && (
            <Button
              variant="outline"
              onClick={() => setEditando(true)}
            >
              Editar
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={handleExcluir}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {editando ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Nome *
                </label>
                <Input
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome do cliente"
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Email
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Telefone
                  </label>
                  <Input
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Empresa
                  </label>
                  <Input
                    name="empresa"
                    value={formData.empresa}
                    onChange={handleChange}
                    placeholder="Nome da empresa"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Cargo
                  </label>
                  <Input
                    name="cargo"
                    value={formData.cargo}
                    onChange={handleChange}
                    placeholder="Cargo do cliente"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Tags
                </label>
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Pressione Enter para adicionar tag"
                />
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-foreground"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Notas
                </label>
                <textarea
                  name="notas"
                  value={formData.notas}
                  onChange={handleChange}
                  placeholder="Observações sobre o cliente..."
                  className="flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              {erro && <p className="text-sm text-red-500">{erro}</p>}

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditando(false)
                    carregarCliente()
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  className="flex-1 bg-primary hover:bg-primary-hover text-white"
                  onClick={handleSalvar}
                  disabled={salvando}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {salvando ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground">{cliente.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Telefone</p>
                  <p className="text-foreground">{cliente.telefone || '-'}</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Empresa</p>
                  <p className="text-foreground">{cliente.empresa || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="text-foreground">{cliente.cargo || '-'}</p>
                </div>
              </div>

              {cliente.tags.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tags</p>
                  <div className="flex flex-wrap gap-2">
                    {cliente.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block rounded-full bg-muted px-3 py-1 text-sm text-muted-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {cliente.notas && (
                <div>
                  <p className="text-sm text-muted-foreground">Notas</p>
                  <p className="text-foreground whitespace-pre-wrap">
                    {cliente.notas}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
