import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { AuthStatus } from '@/lib/auth-context'

const replace = vi.fn()

let pathnameAtual = '/dashboard'
let authAtual: { status: AuthStatus; user: unknown } = {
  status: 'loading',
  user: null,
}

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace }),
  usePathname: () => pathnameAtual,
}))

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => authAtual,
}))

vi.mock('@/components/auth/splash', () => ({
  Splash: () => <div data-testid="splash" />,
}))

import { AuthGate } from './auth-gate'

function renderGate() {
  return render(
    <AuthGate>
      <div data-testid="app" />
    </AuthGate>
  )
}

describe('AuthGate', () => {
  beforeEach(() => {
    replace.mockClear()
  })

  it('em "loading" mostra splash, não monta rota e não redireciona', () => {
    authAtual = { status: 'loading', user: null }
    pathnameAtual = '/dashboard'
    renderGate()
    expect(screen.getByTestId('splash')).toBeInTheDocument()
    expect(screen.queryByTestId('app')).not.toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('autenticado na raiz redireciona para /dashboard e não monta rota', () => {
    authAtual = { status: 'authenticated', user: { uid: '1' } }
    pathnameAtual = '/'
    renderGate()
    expect(replace).toHaveBeenCalledWith('/dashboard')
    expect(screen.queryByTestId('app')).not.toBeInTheDocument()
  })

  it('autenticado em /login redireciona para /dashboard', () => {
    authAtual = { status: 'authenticated', user: { uid: '1' } }
    pathnameAtual = '/login'
    renderGate()
    expect(replace).toHaveBeenCalledWith('/dashboard')
    expect(screen.queryByTestId('app')).not.toBeInTheDocument()
  })

  it('autenticado em rota protegida libera as children', () => {
    authAtual = { status: 'authenticated', user: { uid: '1' } }
    pathnameAtual = '/dashboard'
    renderGate()
    expect(screen.getByTestId('app')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })

  it('deslogado na raiz redireciona para /login', () => {
    authAtual = { status: 'unauthenticated', user: null }
    pathnameAtual = '/'
    renderGate()
    expect(replace).toHaveBeenCalledWith('/login')
    expect(screen.queryByTestId('app')).not.toBeInTheDocument()
  })

  it('deslogado em rota pública libera as children sem redirecionar', () => {
    authAtual = { status: 'unauthenticated', user: null }
    pathnameAtual = '/login'
    renderGate()
    expect(screen.getByTestId('app')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
})
