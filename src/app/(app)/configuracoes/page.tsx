'use client'

import { useEffect, useRef, useState } from 'react'
import { auth, storage } from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { salvarUsuario } from '@/lib/firebase-services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Moon, Sun, Save, Camera, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function ConfiguracoesPage() {
  const [nome, setNome] = useState(
    () => auth.currentUser?.displayName || auth.currentUser?.email?.split('@')[0] || ''
  )
  const email = auth.currentUser?.email || ''
  const [salvando, setSalvando] = useState(false)
  const [mensagem, setMensagem] = useState('')
  const [fotoURL, setFotoURL] = useState(() => auth.currentUser?.photoURL || '')
  const [enviandoFoto, setEnviandoFoto] = useState(false)
  const [fotoMensagem, setFotoMensagem] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [temaEscuro, setTemaEscuro] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('crm-tema') === 'dark'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', temaEscuro)
  }, [temaEscuro])

  const aplicarTema = (escuro: boolean) => {
    setTemaEscuro(escuro)
    localStorage.setItem('crm-tema', escuro ? 'dark' : 'light')
    document.documentElement.classList.toggle('dark', escuro)
  }

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const user = auth.currentUser
    const arquivo = e.target.files?.[0]
    if (!user || !arquivo) return

    setEnviandoFoto(true)
    setFotoMensagem('')
    try {
      const storageRef = ref(storage, `avatars/${user.uid}/avatar.jpg`)
      await uploadBytes(storageRef, arquivo)
      const url = await getDownloadURL(storageRef)
      await updateProfile(user, { photoURL: url })
      await salvarUsuario({
        uid: user.uid,
        nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        photoURL: url,
      })
      setFotoURL(url)
      setFotoMensagem('Foto atualizada com sucesso.')
    } catch {
      setFotoMensagem('Erro ao enviar a foto.')
    } finally {
      setEnviandoFoto(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault()
    const user = auth.currentUser
    if (!user) return

    setSalvando(true)
    setMensagem('')
    try {
      await updateProfile(user, { displayName: nome.trim() || undefined })
      await salvarUsuario({
        uid: user.uid,
        nome: nome.trim() || user.email?.split('@')[0] || 'Usuário',
        email: user.email || email,
        photoURL: user.photoURL || undefined,
      })
      setMensagem('Perfil atualizado com sucesso.')
    } catch {
      setMensagem('Erro ao atualizar perfil.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Dados do perfil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSalvar} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                  {fotoURL ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={fotoURL}
                      alt="Foto de perfil"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    (nome.charAt(0) || '?').toUpperCase()
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={enviandoFoto}
                  aria-label="Enviar nova foto"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft ring-2 ring-card hover:bg-primary-hover disabled:opacity-50"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">Foto de perfil</p>
                <p className="text-xs text-muted-foreground">
                  JPG ou PNG, até 5MB.
                </p>
                {fotoMensagem && (
                  <p
                    className={cn(
                      'mt-1 flex items-center gap-1 text-xs',
                      fotoMensagem.includes('Erro')
                        ? 'text-destructive'
                        : 'text-success'
                    )}
                  >
                    {fotoMensagem.includes('Erro') ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {fotoMensagem}
                  </p>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadFoto}
            />

            <div className="space-y-2">
              <Label htmlFor="nome">Nome</Label>
              <Input
                id="nome"
                value={nome}
                onChange={(e) => {
                  setNome(e.target.value)
                  setMensagem('')
                }}
                placeholder="Seu nome"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" value={email} disabled />
            </div>

            {mensagem && (
              <p className="text-sm text-muted-foreground">{mensagem}</p>
            )}

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={salvando}>
                <Save className="mr-2 h-4 w-4" />
                {salvando ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {temaEscuro ? (
              <Moon className="h-5 w-5 text-primary" />
            ) : (
              <Sun className="h-5 w-5 text-primary" />
            )}
            Preferências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-medium text-foreground">Tema escuro</p>
              <p className="text-sm text-muted-foreground">
                Ative para usar a interface com cores escuras.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={temaEscuro}
              aria-label="Alternar tema escuro"
              onClick={() => aplicarTema(!temaEscuro)}
              className={cn(
                'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                temaEscuro ? 'bg-primary' : 'bg-muted'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-soft transition-transform',
                  temaEscuro ? 'translate-x-5' : 'translate-x-0.5'
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
