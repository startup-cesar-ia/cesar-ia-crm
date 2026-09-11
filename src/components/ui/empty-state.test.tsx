import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from './empty-state'

describe('EmptyState', () => {
  it('renderiza titulo e descrição', () => {
    render(<EmptyState title="Sem dados" description="Nada aqui" />)
    expect(screen.getByText('Sem dados')).toBeInTheDocument()
    expect(screen.getByText('Nada aqui')).toBeInTheDocument()
  })

  it('renderiza ação quando fornecida', () => {
    render(<EmptyState title="Sem dados" action={<button>Criar</button>} />)
    expect(screen.getByRole('button', { name: 'Criar' })).toBeInTheDocument()
  })
})
