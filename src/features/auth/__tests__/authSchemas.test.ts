import { describe, it, expect } from 'vitest'
import { RegisterSchema } from '../authSchemas'

const valid = {
  nome: 'João Silva',
  email: 'joao@email.com',
  senha: '12345678',
  confirmar_senha: '12345678',
  role: 'cliente' as const,
  telefone: '',
  especialidade: '',
  aceita_termos: true,
}

describe('RegisterSchema', () => {
  it('nome vazio → erro Nome obrigatório', () => {
    const result = RegisterSchema.safeParse({ ...valid, nome: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.nome?.[0]).toBe('Nome obrigatório')
    }
  })

  it('nome com 1 char → erro de mínimo', () => {
    const result = RegisterSchema.safeParse({ ...valid, nome: 'A' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.nome?.[0]).toContain('2')
    }
  })

  it('email inválido → erro E-mail inválido', () => {
    const result = RegisterSchema.safeParse({ ...valid, email: 'nao-e-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.email?.[0]).toBe('E-mail inválido')
    }
  })

  it('senha com 7 chars → erro Mínimo 8 caracteres', () => {
    const result = RegisterSchema.safeParse({ ...valid, senha: '1234567', confirmar_senha: '1234567' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.senha?.[0]).toBe('Mínimo 8 caracteres')
    }
  })

  it('confirmar_senha diferente → erro Senhas não conferem', () => {
    const result = RegisterSchema.safeParse({ ...valid, confirmar_senha: 'diferente' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmar_senha?.[0]).toBe('Senhas não conferem')
    }
  })

  it('role inválida → erro de validação', () => {
    const result = RegisterSchema.safeParse({ ...valid, role: 'invalido' as any })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.role).toBeDefined()
    }
  })

  it('role=prestador sem especialidade → válido', () => {
    const result = RegisterSchema.safeParse({ ...valid, role: 'prestador', especialidade: '' })
    expect(result.success).toBe(true)
  })

  it('todos os campos válidos com role=cliente → passa', () => {
    const result = RegisterSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('todos os campos válidos com role=prestador + especialidade → passa', () => {
    const result = RegisterSchema.safeParse({
      ...valid,
      role: 'prestador',
      especialidade: 'Redes',
    })
    expect(result.success).toBe(true)
  })
})
