'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { salvarUsuario } from '@/lib/firebase-services'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Spinner } from '@/components/ui/spinner'
import { SearchProvider } from '@/lib/search-context'
import { useAuth } from '@/lib/auth-context'

const pageMeta: Record<string, { title: string; description: string }> = {
  '/dashboard': {
    title: 'Visão Geral',
    description: 'Acompanhe os principais indicadores do seu CRM.',
  },
  '/clientes': {
    title: 'Clientes',
    description: 'Gerencie sua base de clientes e contatos.',
  },
  '/agendamentos': {
    title: 'Agendamentos',
    description: 'Organize seus compromissos e reuniões.',
  },
  '/tarefas': {
    title: 'Tarefas',
    description: 'Acompanhe suas tarefas e prazos.',
  },
  '/notas': {
    title: 'Notas',
    description: 'Registre ideias, textos e documentos.',
  },
  '/arquivos': {
    title: 'Arquivos',
    description: 'Guarde e abra seus arquivos em um só lugar.',
  },
  '/financeiro': {
    title: 'Financeiro',
    description: 'Controle suas receitas e despesas.',
  },
  '/configuracoes': {
    title: 'Configurações',
    description: 'Ajuste as preferências do sistema.',
  },
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { status, user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    if (status !== 'authenticated' || !user) return
    salvarUsuario({
      uid: user.uid,
      nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
      email: user.email || '',
      photoURL: user.photoURL || undefined,
    })
  }, [status, user])

  // Guard de rota: só redireciona com a decisão final de "deslogado".
  // Em "loading" nunca redireciona.
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setSidebarOpen(false)
      prevPathnameRef.current = pathname
    }
  }, [pathname])

  if (status !== 'authenticated') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary">
        <Spinner
          size={36}
          className="border-primary-foreground/30 border-t-primary-foreground"
        />
      </div>
    )
  }

  const meta = pageMeta[pathname]

  return (
    <SearchProvider>
      <div className="min-h-screen bg-background">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="lg:pl-64">
          <Header onOpenSidebar={() => setSidebarOpen(true)} />

          <main className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              {meta && (
                <div className="mb-8 space-y-1">
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {meta.title}
                  </h1>
                  {meta.description && (
                    <p className="text-sm text-muted-foreground">
                      {meta.description}
                    </p>
                  )}
                </div>
              )}

              {children}
            </div>
          </main>
        </div>
      </div>
    </SearchProvider>
  )
}
