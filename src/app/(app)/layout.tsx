'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { salvarUsuario } from '@/lib/firebase-services'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Spinner } from '@/components/ui/spinner'
import { SearchProvider } from '@/lib/search-context'

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
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login')
      } else {
        salvarUsuario({
          uid: user.uid,
          nome: user.displayName || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
        })
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setSidebarOpen(false)
      prevPathnameRef.current = pathname
    }
  }, [pathname])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size={36} />
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
