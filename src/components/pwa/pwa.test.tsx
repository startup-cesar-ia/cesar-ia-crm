import { describe, it, expect, vi, beforeEach } from 'vitest'
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
  it('registra o service worker em /sw.js', async () => {
    const register = vi.fn().mockResolvedValue({})
    Object.defineProperty(navigator, 'serviceWorker', {
      value: { register },
      configurable: true,
    })
    render(<RegisterSW />)
    window.dispatchEvent(new Event('load'))
    await waitFor(() => expect(register).toHaveBeenCalledWith('/sw.js'))
  })
})
