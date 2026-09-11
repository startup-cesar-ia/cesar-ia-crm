'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { salvarUsuario } from '@/lib/firebase-services'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, AlertCircle, Mail, Lock, CheckCircle2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [manterConectado, setManterConectado] = useState(true)

  const aplicarPersistencia = async () => {
    const tipo = manterConectado
      ? browserLocalPersistence
      : browserSessionPersistence
    try {
      await setPersistence(auth, tipo)
    } catch {
      // Persistência já definida nesta sessão; segue com o padrão.
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setInfo('')
    setLoading(true)
    try {
      await aplicarPersistencia()
      const provider = new GoogleAuthProvider()
      const resultado = await signInWithPopup(auth, provider)
      const user = resultado.user
      await salvarUsuario({
        uid: user.uid,
        nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error.code === 'auth/popup-closed-by-user') {
        return
      }
      if (error.code === 'auth/unauthorized-domain') {
        setError('Domínio não autorizado. Adicione este domínio no Firebase Console.')
      } else {
        setError('Erro ao entrar com Google. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  const validarEmail = (email: string) => {
    return email.includes('@')
  }

  const validarSenha = (senha: string) => {
    return senha.length >= 6
  }

  const handleEsqueciSenha = async () => {
    setError('')
    setInfo('')
    if (!validarEmail(email)) {
      setError('Informe um e-mail válido para recuperar a senha.')
      return
    }
    try {
      await sendPasswordResetEmail(auth, email)
      setInfo('Enviamos um link de recuperação para o seu e-mail.')
    } catch {
      setError('Não foi possível enviar o e-mail. Verifique o endereço.')
    }
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')

    if (!validarEmail(email)) {
      setError('Por favor, insira um e-mail válido com @')
      return
    }

    if (!validarSenha(password)) {
      setError('A senha deve ter pelo menos 6 caracteres')
      return
    }

    if (!isLogin && password !== confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      await aplicarPersistencia()
      let user
      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password)
        user = cred.user
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password)
        user = cred.user
      }
      await salvarUsuario({
        uid: user.uid,
        nome: user.displayName || email.split('@')[0],
        email: user.email || email,
        photoURL: user.photoURL || undefined,
      })
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error.code === 'auth/user-not-found') {
        setError('Usuário não encontrado')
      } else if (error.code === 'auth/wrong-password') {
        setError('Senha incorreta')
      } else if (error.code === 'auth/email-already-in-use') {
        setError('Este email já está em uso')
      } else if (error.code === 'auth/weak-password') {
        setError('A senha deve ter pelo menos 6 caracteres')
      } else if (error.code === 'auth/invalid-credential') {
        setError('Credenciais inválidas. Verifique e-mail e senha.')
      } else {
        setError('Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Painel esquerdo — marca */}
      <div className="hidden w-1/2 items-center justify-center bg-gradient-to-b from-primary to-primary-deep lg:flex">
        <div className="w-[320px]">
          <Image
            src="/logo-branca.png"
            alt="César IA"
            width={406}
            height={467}
            priority
            className="w-full"
          />
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex w-full items-center justify-center bg-card px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <Image
              src="/logo-cesar.png"
              alt="César IA"
              width={320}
              height={120}
              priority
              className="mx-auto h-16 w-auto"
            />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Bem-vindo!
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin
              ? 'Acesse o dashboard'
              : 'Crie sua conta para começar'}
          </p>

          <Button
            variant="secondary"
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="mt-8 w-full"
          >
            <Image
              src="/google.svg"
              alt=""
              width={20}
              height={20}
              aria-hidden
            />
            Continuar com Google
          </Button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              ou
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu e-mail"
                  className="pl-10"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError('')
                    setInfo('')
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    setError('')
                    setInfo('')
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      setError('')
                      setInfo('')
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    aria-label={
                      showConfirmPassword ? 'Ocultar confirmação' : 'Mostrar confirmação'
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {isLogin && (
              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={manterConectado}
                    onChange={(e) => setManterConectado(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  Manter-me conectado
                </label>
                <button
                  type="button"
                  onClick={handleEsqueciSenha}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Esqueci minha senha
                </button>
              </div>
            )}

            {error && (
              <div
                role="alert"
                className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {info && (
              <div
                role="status"
                className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/5 px-3 py-2 text-sm text-success"
              >
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {info}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : isLogin ? 'Entrar' : 'Criar conta'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setInfo('')
                setEmail('')
                setPassword('')
                setConfirmPassword('')
                setShowPassword(false)
                setShowConfirmPassword(false)
              }}
              className="font-semibold text-primary hover:underline"
            >
              {isLogin ? 'Criar uma conta' : 'Fazer login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
