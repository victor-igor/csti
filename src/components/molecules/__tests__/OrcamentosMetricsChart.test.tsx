import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { OrcamentosMetricsChart } from '../OrcamentosMetricsChart'
import type { MonthMetric } from '@/lib/metricsUtils'

// recharts usa ResizeObserver internamente — mock mínimo para vitest/jsdom
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts')
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div style={{ width: 500, height: 200 }}>{children}</div>
    ),
  }
})

const mockData: MonthMetric[] = [
  { mes: 'Dez', enviados: 2, aprovados: 1 },
  { mes: 'Jan', enviados: 3, aprovados: 2 },
  { mes: 'Fev', enviados: 1, aprovados: 0 },
  { mes: 'Mar', enviados: 4, aprovados: 3 },
  { mes: 'Abr', enviados: 2, aprovados: 1 },
  { mes: 'Mai', enviados: 6, aprovados: 4 },
]

describe('OrcamentosMetricsChart', () => {
  it('renderiza sem erros com dados válidos', () => {
    render(<OrcamentosMetricsChart data={mockData} />)
    expect(screen.getByText(/Taxa de aprovação/i)).toBeInTheDocument()
  })

  it('exibe percentual do último mês', () => {
    render(<OrcamentosMetricsChart data={mockData} />)
    // Mai: 4/6 = 67%
    expect(screen.getByText('67%')).toBeInTheDocument()
  })

  it('renderiza mesmo com todos os meses zerados', () => {
    const empty = Array(6).fill({ mes: 'Jan', enviados: 0, aprovados: 0 }) as MonthMetric[]
    render(<OrcamentosMetricsChart data={empty} />)
    expect(screen.getByText('0%')).toBeInTheDocument()
  })
})
