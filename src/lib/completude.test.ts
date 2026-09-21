import { describe, it, expect } from 'vitest'
import { avaliarCompletude } from './completude'

describe('avaliarCompletude', () => {
  it('cliente completo quando tem nome, e-mail, telefone e empresa', () => {
    const r = avaliarCompletude('cliente', {
      nome: 'Ana',
      email: 'ana@ex.com',
      telefone: '11999999999',
      empresa: 'Acme',
    })
    expect(r.completa).toBe(true)
    expect(r.faltantes).toEqual([])
    expect(r.percentual).toBe(100)
  })

  it('cliente lista os campos faltantes', () => {
    const r = avaliarCompletude('cliente', { nome: 'Ana', telefone: '1199' })
    expect(r.completa).toBe(false)
    expect(r.faltantes).toEqual(['E-mail', 'Empresa'])
    expect(r.preenchidos).toBe(2)
    expect(r.total).toBe(4)
    expect(r.percentual).toBe(50)
  })

  it('cliente trata campos em branco como ausentes', () => {
    const r = avaliarCompletude('cliente', {
      nome: 'Ana',
      telefone: '1199',
      email: '   ',
      empresa: '',
    })
    expect(r.faltantes).toEqual(['E-mail', 'Empresa'])
  })

  it('agendamento exige título, data, horas e cliente', () => {
    const completo = avaliarCompletude('agendamento', {
      titulo: 'Reunião',
      data: {},
      horaInicio: '09:00',
      horaFim: '10:00',
      clienteId: 'c1',
    })
    expect(completo.completa).toBe(true)

    const provisorio = avaliarCompletude('agendamento', {
      titulo: 'Reunião',
      data: {},
    })
    expect(provisorio.faltantes).toEqual([
      'Hora de início',
      'Hora de fim',
      'Cliente',
    ])
  })

  it('tarefa completa com título, prazo e cliente', () => {
    expect(
      avaliarCompletude('tarefa', {
        titulo: 'Ligar',
        prazo: {},
        clienteId: 'c1',
      }).completa
    ).toBe(true)

    expect(avaliarCompletude('tarefa', { titulo: 'Ligar' }).faltantes).toEqual([
      'Prazo',
      'Cliente',
    ])
  })

  it('nota completa com título e conteúdo (ignora HTML vazio)', () => {
    expect(avaliarCompletude('nota', { titulo: 'X', conteudo: '<p>oi</p>' }).completa).toBe(true)
    expect(
      avaliarCompletude('nota', { titulo: 'X', conteudo: '<p></p>' }).faltantes
    ).toEqual(['Conteúdo'])
    expect(
      avaliarCompletude('nota', { titulo: 'X', conteudo: '<p>&nbsp;</p>' }).faltantes
    ).toEqual(['Conteúdo'])
  })

  it('trata registro nulo como tudo faltante', () => {
    const r = avaliarCompletude('cliente', null)
    expect(r.completa).toBe(false)
    expect(r.faltantes).toHaveLength(4)
    expect(r.percentual).toBe(0)
  })
})
