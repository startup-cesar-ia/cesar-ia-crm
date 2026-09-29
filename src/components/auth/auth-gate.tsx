'use client'

import { useEffect, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { Splash } from '@/components/auth/splash'

const ROTA_LOGIN = '/login'
const ROTA_INICIAL = '/dashboard'

export function AuthGate({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const naRaiz = pathname === '/'
  const naLogin = pathname === ROTA_LOGIN

  // A splash (laranja) já cobre a tela; o fundo de boot pode ser removido.
  useEffect(() => {
    document.documentElement.classList.remove('crm-boot')
  }, [])

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'authenticated' && (naRaiz || naLogin)) {
      router.replace(ROTA_INICIAL)
      return
    }

    if (status === 'unauthenticated' && naRaiz) {
      router.replace(ROTA_LOGIN)
    }
  }, [status, naRaiz, naLogin, router])

  // Enquanto a sessão não é determinada, nenhuma rota é montada.
  if (status === 'loading') return <Splash />

  // Redireciona sem liberar a UI, para a rota de destino não piscar.
  if (status === 'authenticated' && (naRaiz || naLogin)) return <Splash />
  if (status === 'unauthenticated' && naRaiz) return <Splash />

  return <>{children}</>
}
