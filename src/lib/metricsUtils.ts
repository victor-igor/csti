export interface MonthMetric {
  mes: string
  enviados: number
  aprovados: number
}

const PT_MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export function groupOrcamentosByMonth(
  orcamentos: { created_at: string; status: string }[],
  months = 6,
): MonthMetric[] {
  const buckets: Record<string, MonthMetric> = {}

  for (let i = months - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    buckets[key] = { mes: PT_MONTHS[d.getMonth()], enviados: 0, aprovados: 0 }
  }

  for (const { created_at, status } of orcamentos) {
    const d = new Date(created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!buckets[key]) continue
    if (['enviado', 'aceito', 'recusado'].includes(status)) {
      buckets[key].enviados++
    }
    if (status === 'aceito') {
      buckets[key].aprovados++
    }
  }

  return Object.values(buckets)
}

export function calcApprovalRate(data: MonthMetric[]): { rate: number; delta: number } {
  const last = data.at(-1)
  const prev = data.at(-2)
  const rate = last && last.enviados > 0 ? Math.round((last.aprovados / last.enviados) * 100) : 0
  const prevRate = prev && prev.enviados > 0 ? Math.round((prev.aprovados / prev.enviados) * 100) : 0
  return { rate, delta: rate - prevRate }
}
