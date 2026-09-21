import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CompletenessBadge } from './completeness-badge'
import { CompletenessBanner } from './completeness-banner'
import { CampoVazio } from './campo-vazio'

describe('CompletenessBadge', () => {
  it('não renderiza quando não há faltantes', () => {
    const { container } = render(<CompletenessBadge faltantes={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('mostra o rótulo e detalha o que falta', () => {
    render(<CompletenessBadge faltantes={['E-mail', 'Empresa']} />)
    expect(screen.getByText('Incompleto')).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Cadastro incompleto. Faltando: E-mail, Empresa/)
    ).toBeInTheDocument()
  })
})

describe('CompletenessBanner', () => {
  it('não renderiza quando não há faltantes', () => {
    const { container } = render(<CompletenessBanner faltantes={[]} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lista os faltantes e dispara o atalho completar', async () => {
    const onCompletar = vi.fn()
    render(
      <CompletenessBanner
        faltantes={['E-mail', 'Empresa']}
        onCompletar={onCompletar}
      />
    )
    expect(screen.getByRole('status')).toHaveTextContent(
      'Faltando: E-mail, Empresa.'
    )
    await userEvent.click(screen.getByRole('button', { name: 'Completar' }))
    expect(onCompletar).toHaveBeenCalledOnce()
  })
})

describe('CampoVazio', () => {
  it('mostra o rótulo padrão', () => {
    render(<CampoVazio />)
    expect(screen.getByText('Não informado')).toBeInTheDocument()
  })
})
