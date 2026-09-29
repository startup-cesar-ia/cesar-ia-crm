'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<AuthContextValue>({
    status: 'loading',
    user: null,
  })

  useEffect(() => {
    // A transição de estado só acontece aqui, na decisão final do Firebase.
    // Não existe timeout: enquanto a sessão não é determinada, segue "loading".
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setEstado({ status: 'authenticated', user })
      } else {
        setEstado({ status: 'unauthenticated', user: null })
      }
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={estado}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return ctx
}
