import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InstallButton } from './install-button'
import { RegisterSW } from './register-sw'

describe('InstallButton', () => {
  beforeEach(() => {
    window.dispatchEvent(new Event('appinstalled'))
  })

  it('não renderiza nada sem evento de instalação', () => {
    render(<InstallButton />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('mostra botão após beforeinstallprompt e some ao instalar', async () => {
    const prompt = vi.fn().mockResolvedValue(undefined)
    render(<InstallButton />)
    const ev = new Event('beforeinstallprompt')
    Object.defineProperty(ev, 'prompt', { value: prompt })
    Object.defineProperty(ev, 'userChoice', {
      value: Promise.resolve({ outcome: 'accepted' }),
    })
    window.dispatchEvent(ev)

    await waitFor(() => expect(screen.getByRole('button', { name: /instalar/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /instalar/i }))
    expect(prompt).toHaveBeenCalledOnce()
  })
})

describe('RegisterSW', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('registra o service worker em /sw.js em produção', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    const register = vi.fn().mockResolvedValue({})
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    })
    render(<RegisterSW />)
    window.dispatchEvent(new Event('load'))
    await waitFor(() => expect(register).toHaveBeenCalledWith('/sw.js'))
  })

  it('remove o service worker e limpa caches em desenvolvimento', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    const unregister = vi.fn().mockResolvedValue(true)
    const getRegistrations = vi.fn().mockResolvedValue([{ unregister }])
    const register = vi.fn()
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register, getRegistrations },
      configurable: true,
    })
    render(<RegisterSW />)
    await waitFor(() => expect(getRegistrations).toHaveBeenCalled())
    expect(unregister).toHaveBeenCalled()
    expect(register).not.toHaveBeenCalled()
  })
})
