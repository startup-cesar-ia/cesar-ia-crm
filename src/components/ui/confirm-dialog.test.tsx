import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmDialog } from './confirm-dialog'

describe('ConfirmDialog', () => {
  it('não renderiza quando fechado', () => {
    render(<ConfirmDialog open={false} title="Excluir" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renderiza com role dialog quando aberto', () => {
    render(<ConfirmDialog open title="Excluir" onConfirm={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    expect(screen.getByText('Excluir')).toBeInTheDocument()
  })

  it('chama onConfirm ao confirmar', async () => {
    const onConfirm = vi.fn()
    render(<ConfirmDialog open title="Excluir" confirmLabel="Excluir" onConfirm={onConfirm} onCancel={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: 'Excluir' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('chama onCancel ao cancelar', async () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="Excluir" onConfirm={vi.fn()} onCancel={onCancel} />)
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('fecha com tecla Escape', async () => {
    const onCancel = vi.fn()
    render(<ConfirmDialog open title="Excluir" onConfirm={vi.fn()} onCancel={onCancel} />)
    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalled()
  })
})
