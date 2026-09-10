'use client'

import { useEffect, useState } from 'react'
import { auth } from '@/lib/firebase'
import { User } from 'firebase/auth'
import { Bell, Search, Menu } from 'lucide-react'

interface HeaderProps {
  onOpenSidebar: () => void
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((current) => setUser(current))
    return () => unsubscribe()
  }, [])

  const nome = user?.displayName || user?.email?.split('@')[0] || 'Usuário'
  const email = user?.email || ''
  const inicial = nome.charAt(0).toUpperCase()

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:px-8">
        {/* Menu (mobile) */}
        <button
          onClick={onOpenSidebar}
          aria-label="Abrir menu"
          className="rounded-xl p-2.5 text-foreground transition-colors hover:bg-black/5 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Busca */}
        <div className="relative hidden max-w-md flex-1 sm:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Buscar clientes, agendamentos, tarefas..."
            className="h-10 w-full rounded-xl border border-border bg-card pl-10 pr-4 text-sm text-foreground shadow-soft outline-none transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-3">
          {/* Notificações */}
          <button
            aria-label="Notificações"
            className="relative rounded-xl p-2.5 text-foreground transition-colors hover:bg-black/5"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>

          {/* Perfil */}
          <div className="flex items-center gap-3 rounded-xl py-1.5 pl-1.5 pr-2 transition-colors hover:bg-black/5 sm:pr-3">
            {user?.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.photoURL}
                alt={nome}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
                {inicial}
              </span>
            )}
            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold leading-tight text-foreground">
                {nome}
              </p>
              <p className="text-xs leading-tight text-muted-foreground">
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
