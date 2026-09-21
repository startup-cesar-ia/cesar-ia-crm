import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from './dialog'

describe('Dialog', () => {
  it('não renderiza quando fechado', () => {
    render(
      <Dialog open={false} onClose={vi.fn()}>
        conteúdo
      </Dialog>
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza com role dialog quando aberto', () => {
    render(
      <Dialog open onClose={vi.fn()} title="Título">
        conteúdo
      </Dialog>
    )
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('conteúdo')).toBeInTheDocument()
  })

  it('chama onClose ao clicar no botão fechar', async () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        conteúdo
      </Dialog>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('fecha com tecla Escape', async () => {
    const onClose = vi.fn()
    render(
      <Dialog open onClose={onClose}>
        conteúdo
      </Dialog>
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })
})
