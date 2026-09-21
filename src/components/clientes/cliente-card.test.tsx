import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClienteCard } from './cliente-card'
import { Cliente } from '@/types'

function clienteBase(over: Partial<Cliente> = {}): Cliente {
  return {
    id: 'c1',
    usuarioId: 'u1',
    nome: 'Ana Costa',
    email: 'ana@acme.com',
    telefone: '11999999999',
    empresa: 'Acme Ltda',
    cargo: 'Diretora',
    tags: ['vip'],
    criadoEm: {} as Cliente['criadoEm'],
    atualizadoEm: {} as Cliente['atualizadoEm'],
    ...over,
  }
}

describe('ClienteCard', () => {
  it('mostra nome, empresa, contato e iniciais', () => {
    render(<ClienteCard cliente={clienteBase()} onExcluir={vi.fn()} />)
    expect(screen.getByText('Ana Costa')).toBeInTheDocument()
    expect(screen.getByText('Acme Ltda')).toBeInTheDocument()
    expect(screen.getByText('ana@acme.com')).toBeInTheDocument()
    expect(screen.getByText('AC')).toBeInTheDocument()
  })

  it('não exibe a pílula quando o cadastro está completo', () => {
    render(<ClienteCard cliente={clienteBase()} onExcluir={vi.fn()} />)
    expect(screen.queryByText('Incompleto')).not.toBeInTheDocument()
  })

  it('exibe pílula de incompleto e dica de campo vazio quando faltam dados', () => {
    render(
      <ClienteCard
        cliente={clienteBase({ email: undefined })}
        onExcluir={vi.fn()}
      />
    )
    expect(screen.getByText('Incompleto')).toBeInTheDocument()
    expect(screen.getByText('E-mail não informado')).toBeInTheDocument()
  })

  it('dispara a exclusão ao clicar no botão', async () => {
    const onExcluir = vi.fn()
    render(<ClienteCard cliente={clienteBase()} onExcluir={onExcluir} />)
    await userEvent.click(screen.getByRole('button', { name: 'Excluir Ana Costa' }))
    expect(onExcluir).toHaveBeenCalledOnce()
  })

  it('aponta o link para o detalhe do cliente', () => {
    render(<ClienteCard cliente={clienteBase()} onExcluir={vi.fn()} />)
    expect(
      screen.getByRole('link', { name: 'Ver detalhes de Ana Costa' })
    ).toHaveAttribute('href', '/clientes/c1')
  })
})
