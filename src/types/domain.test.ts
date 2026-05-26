import { describe, it, expect, expectTypeOf } from 'vitest'
import type {
  Role,
  SolicitacaoStatus,
  OrcamentoStatus,
  OSStatus,
  IProfile,
  IOrcamento,
} from './domain'

describe('Role type', () => {
  it('todos os 4 valores de Role compilam', () => {
    const roles: Role[] = ['cliente', 'prestador', 'admin', 'super_admin']
    expect(roles).toHaveLength(4)
  })

  it('não aceita string inválida', () => {
    expectTypeOf<'invalido'>().not.toMatchTypeOf<Role>()
  })
})

describe('SolicitacaoStatus', () => {
  it('todos os 5 valores válidos compilam', () => {
    const values: SolicitacaoStatus[] = [
      'aberta',
      'aguardando_orcamento',
      'orcamento_enviado',
      'aprovado',
      'cancelado',
    ]
    expect(values).toHaveLength(5)
  })

  it('não aceita string arbitrária como SolicitacaoStatus', () => {
    expectTypeOf<'invalido'>().not.toMatchTypeOf<SolicitacaoStatus>()
  })
})

describe('OrcamentoStatus', () => {
  it('todos os 4 valores válidos compilam', () => {
    const values: OrcamentoStatus[] = ['rascunho', 'enviado', 'aceito', 'recusado']
    expect(values).toHaveLength(4)
  })

  it('não aceita string inválida', () => {
    expectTypeOf<'pendente'>().not.toMatchTypeOf<OrcamentoStatus>()
  })
})

describe('OSStatus', () => {
  it('todos os 4 valores válidos compilam', () => {
    const values: OSStatus[] = ['aberta', 'em_andamento', 'concluida', 'cancelada']
    expect(values).toHaveLength(4)
  })

  it('não aceita string inválida', () => {
    expectTypeOf<'finalizado'>().not.toMatchTypeOf<OSStatus>()
  })
})

describe('IProfile shape', () => {
  it('tem campos obrigatórios corretos', () => {
    expectTypeOf<IProfile>().toHaveProperty('id')
    expectTypeOf<IProfile>().toHaveProperty('nome')
    expectTypeOf<IProfile>().toHaveProperty('email')
    expectTypeOf<IProfile>().toHaveProperty('role')
    expectTypeOf<IProfile['role']>().toMatchTypeOf<Role>()
  })
})

describe('IOrcamento shape', () => {
  it('tem campos do ciclo de vida', () => {
    expectTypeOf<IOrcamento>().toHaveProperty('status')
    expectTypeOf<IOrcamento>().toHaveProperty('prazo_estimado_dias')
    expectTypeOf<IOrcamento>().toHaveProperty('validade_ate')
    expectTypeOf<IOrcamento['status']>().toMatchTypeOf<OrcamentoStatus>()
  })
})
