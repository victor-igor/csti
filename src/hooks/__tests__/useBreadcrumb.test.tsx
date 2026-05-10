import { renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { useBreadcrumb } from '../useBreadcrumb'

function wrapper(path: string) {
  return ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter>
  )
}

describe('useBreadcrumb', () => {
  it('retorna [Dashboard] para rota raiz', () => {
    const { result } = renderHook(() => useBreadcrumb(), { wrapper: wrapper('/') })
    expect(result.current).toEqual([{ label: 'Dashboard', href: null }])
  })

  it('retorna [Dashboard, Solicitações] para /solicitacoes', () => {
    const { result } = renderHook(() => useBreadcrumb(), { wrapper: wrapper('/solicitacoes') })
    expect(result.current).toEqual([
      { label: 'Dashboard', href: '/' },
      { label: 'Solicitações', href: null },
    ])
  })

  it('retorna [Dashboard, Solicitações, Nova Solicitação] para /solicitacoes/nova', () => {
    const { result } = renderHook(() => useBreadcrumb(), { wrapper: wrapper('/solicitacoes/nova') })
    expect(result.current).toEqual([
      { label: 'Dashboard', href: '/' },
      { label: 'Solicitações', href: '/solicitacoes' },
      { label: 'Nova Solicitação', href: null },
    ])
  })

  it('trunca segmento UUID para ID curto', () => {
    const uuid = '550e8400-e29b-41d4-a716-446655440000'
    const { result } = renderHook(() => useBreadcrumb(), { wrapper: wrapper(`/solicitacoes/${uuid}`) })
    const last = result.current[result.current.length - 1]
    expect(last.label).toMatch(/^#[A-Za-z0-9]{6}$/)
    expect(last.href).toBeNull()
  })

  it('omite segmento "prestador" (prefixo invisível)', () => {
    const { result } = renderHook(() => useBreadcrumb(), { wrapper: wrapper('/prestador/orcamentos') })
    const labels = result.current.map(b => b.label)
    expect(labels).not.toContain('prestador')
    expect(labels).toContain('Orçamentos')
  })

  it('limita a 3 níveis no máximo', () => {
    const { result } = renderHook(() => useBreadcrumb(), {
      wrapper: wrapper('/solicitacoes/abc123/revisar/extra/deep'),
    })
    expect(result.current.length).toBeLessThanOrEqual(3)
  })
})
