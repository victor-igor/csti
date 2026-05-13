import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { calcApprovalRate } from '@/lib/metricsUtils'
import type { MonthMetric } from '@/lib/metricsUtils'

interface OrcamentosMetricsChartProps {
  data: MonthMetric[] | undefined
}

export function OrcamentosMetricsChart({ data }: OrcamentosMetricsChartProps) {
  if (!data) return null
  const { rate, delta } = calcApprovalRate(data)

  const TrendIcon = delta > 0 ? TrendingUp : delta < 0 ? TrendingDown : Minus
  const trendClass =
    delta > 0 ? 'text-success' : delta < 0 ? 'text-danger' : 'text-muted-foreground'

  return (
    <div className="rounded-lg border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Taxa de aprovação</p>
          <p className="mt-0.5 text-3xl font-semibold text-foreground">{rate}%</p>
        </div>
        {data.length >= 2 && (
          <div className={`flex items-center gap-1 text-sm font-medium ${trendClass}`}>
            <TrendIcon className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              {delta > 0 ? '+' : ''}{delta}% vs mês anterior
            </span>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
            axisLine={false}
            tickLine={false}
            width={24}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 6, border: '1px solid var(--color-border)' }}
            labelStyle={{ fontWeight: 600, marginBottom: 4 }}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="enviados"
            name="Enviados"
            fill="var(--color-primary)"
            radius={[3, 3, 0, 0]}
          />
          <Bar
            dataKey="aprovados"
            name="Aprovados"
            fill="var(--color-success)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
