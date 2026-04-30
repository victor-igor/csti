import { describe, it, expect } from 'vitest'
import { CreateSolicitacaoSchema } from '../solicitacaoSchemas'

describe('CreateSolicitacaoSchema', () => {
  it('1. Título vazio → success: false', () => {
    const result = CreateSolicitacaoSchema.safeParse({
      titulo: '',
      descricao: 'Descrição com mais de dez chars',
      categoria: 'hardware',
    })
    expect(result.success).toBe(false)
  })

  it('2. Título com 2 chars → success: false (min 3)', () => {
    const result = CreateSolicitacaoSchema.safeParse({
      titulo: 'ab',
      descricao: 'Descrição com mais de dez chars',
      categoria: 'hardware',
    })
    expect(result.success).toBe(false)
  })

  it('3. Título com 101 chars → success: false (max 100)', () => {
    const result = CreateSolicitacaoSchema.safeParse({
      titulo: 'a'.repeat(101),
      descricao: 'Descrição com mais de dez chars',
      categoria: 'hardware',
    })
    expect(result.success).toBe(false)
  })

  it('4. Descrição com 9 chars → success: false (min 10)', () => {
    const result = CreateSolicitacaoSchema.safeParse({
      titulo: 'Título válido',
      descricao: '123456789',
      categoria: 'hardware',
    })
    expect(result.success).toBe(false)
  })

  it('5. Categoria "invalida" → success: false', () => {
    const result = CreateSolicitacaoSchema.safeParse({
      titulo: 'Título válido',
      descricao: 'Descrição com mais de dez chars',
      categoria: 'invalida',
    })
    expect(result.success).toBe(false)
  })

  it('6. Categoria "hardware" com título e descrição válidos → success: true', () => {
    const result = CreateSolicitacaoSchema.safeParse({
      titulo: 'Problema no hardware',
      descricao: 'O computador não liga ao pressionar o botão de energia.',
      categoria: 'hardware',
    })
    expect(result.success).toBe(true)
  })

  it('7. Todos os campos válidos (outro conjunto) → success: true', () => {
    const result = CreateSolicitacaoSchema.safeParse({
      titulo: 'Instalação de software',
      descricao: 'Preciso instalar o pacote Office na máquina do setor financeiro.',
      categoria: 'software',
    })
    expect(result.success).toBe(true)
  })
})
