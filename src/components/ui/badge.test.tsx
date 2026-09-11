import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './badge'

describe('Badge', () => {
  it('renderiza texto', () => {
    render(<Badge>Pago</Badge>)
    expect(screen.getByText('Pago')).toBeInTheDocument()
  })

  it('aplica variante success', () => {
    render(<Badge variant="success">Pago</Badge>)
    expect(screen.getByText('Pago')).toHaveClass('bg-success')
  })

  it('aplica variante destructive', () => {
    render(<Badge variant="destructive">Erro</Badge>)
    expect(screen.getByText('Erro')).toHaveClass('bg-destructive')
  })
})
