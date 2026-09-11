import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './button'

describe('Button', () => {
  it('renderiza o texto', () => {
    render(<Button>Salvar</Button>)
    expect(screen.getByRole('button', { name: 'Salvar' })).toBeInTheDocument()
  })

  it('aplica variante primária por padrão', () => {
    render(<Button>OK</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')
  })

  it('desabilitado não dispara clique', async () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>X</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).not.toHaveBeenCalled()
  })

  it('dispara clique quando habilitado', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>X</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })
})
