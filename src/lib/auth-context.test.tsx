import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'

type Callback = (user: unknown) => void

let capturarCallback: Callback | null = null

vi.mock('@/lib/firebase', () => ({ auth: {} }))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth: unknown, cb: Callback) => {
    capturarCallback = cb
    return () => {}
  }),
}))

import { AuthProvider, useAuth } from './auth-context'

function Probe() {
  const { status } = useAuth()
  return <span>{status}</span>
}

describe('AuthProvider / useAuth', () => {
  beforeEach(() => {
    capturarCallback = null
  })

  it('inicia em "loading" e não decide nada antes do callback', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('vai para "authenticated" quando o Firebase devolve usuário', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    act(() => capturarCallback?.({ uid: 'abc' }))
    expect(screen.getByText('authenticated')).toBeInTheDocument()
  })

  it('vai para "unauthenticated" quando o Firebase devolve null', () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    )
    act(() => capturarCallback?.(null))
    expect(screen.getByText('unauthenticated')).toBeInTheDocument()
  })

  it('useAuth fora do provider lança erro', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow(/AuthProvider/)
    consoleError.mockRestore()
  })
})
