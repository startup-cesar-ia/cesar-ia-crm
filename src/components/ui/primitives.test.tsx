import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Input } from './input'
import { Label } from './label'
import { Select } from './select'
import { Textarea } from './textarea'
import { PageHeader } from './page-header'

describe('Input', () => {
  it('renderiza com placeholder e tipo', () => {
    render(<Input placeholder="Nome" type="text" />)
    const input = screen.getByPlaceholderText('Nome')
    expect(input).toHaveAttribute('type', 'text')
  })

  it('fica desabilitado', () => {
    render(<Input disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })
})

describe('Label', () => {
  it('associa via htmlFor', () => {
    render(<Label htmlFor="email">E-mail</Label>)
    expect(screen.getByText('E-mail')).toHaveAttribute('for', 'email')
  })
})

describe('Select', () => {
  it('renderiza opções', () => {
    render(
      <Select>
        <option value="a">Opção A</option>
        <option value="b">Opção B</option>
      </Select>
    )
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('Opção A')).toBeInTheDocument()
  })
})

describe('Textarea', () => {
  it('renderiza texto', () => {
    render(<Textarea placeholder="Descreva" />)
    expect(screen.getByPlaceholderText('Descreva')).toBeInTheDocument()
  })
})

describe('PageHeader', () => {
  it('renderiza titulo, descrição e ações', () => {
    render(
      <PageHeader
        title="Clientes"
        description="Lista"
        actions={<button>Novo</button>}
      />
    )
    expect(screen.getByRole('heading', { name: 'Clientes' })).toBeInTheDocument()
    expect(screen.getByText('Lista')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Novo' })).toBeInTheDocument()
  })
})
