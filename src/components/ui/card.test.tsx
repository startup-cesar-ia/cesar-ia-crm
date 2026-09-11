import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card'

describe('Card', () => {
  it('renderiza conteúdo e aplica padding quando padded', () => {
    render(<Card padded>Conteúdo</Card>)
    expect(screen.getByText('Conteúdo')).toHaveClass('p-6')
  })

  it('renderiza header, title, description, content e footer', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descrição</CardDescription>
        </CardHeader>
        <CardContent>Corpo</CardContent>
        <CardFooter>Rodapé</CardFooter>
      </Card>
    )
    expect(screen.getByText('Título')).toBeInTheDocument()
    expect(screen.getByText('Descrição')).toBeInTheDocument()
    expect(screen.getByText('Corpo')).toBeInTheDocument()
    expect(screen.getByText('Rodapé')).toBeInTheDocument()
  })
})
