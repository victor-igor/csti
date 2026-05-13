# UX/UI Prestador — Dashboard e Solicitações Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refatorar a experiência do prestador: dashboard vira painel de pipeline (4 StatCards + gráfico mensal), "Ação Necessária" separa aprovados de oportunidades, e SolicitacaoCard ganha urgência/prazo.

**Architecture:** Novos componentes `UrgenciaBadge` (atom) e `OrcamentosMetricsChart` (molecule) são parametrizados por props e reutilizáveis. Utilitário `metricsUtils.ts` encapsula lógica de agrupamento por mês. DashboardPage substitui (não duplica) as queries existentes do `PrestadorDashboard`.

**Tech Stack:** React 18, TypeScript, Tailwind v4, Supabase + react-query, recharts, Vitest + Testing Library

---

## File Map

| Ação | Arquivo | Responsabilidade |
|------|---------|-----------------|
| Create | `src/lib/metricsUtils.ts` | Agrupar orçamentos por mês, calcular taxa de aprovação |
| Create | `src/lib/__tests__/metricsUtils.test.ts` | Testes unitários do utilitário |
| Modify | `src/lib/constants.ts` | Adicionar `URGENCIA_CONFIG` |
| Create | `src/components/atoms/UrgenciaBadge.tsx` | Badge visual de urgência reutilizável |
| Create | `src/components/atoms/__tests__/UrgenciaBadge.test.tsx` | Testes do atom |
| Create | `src/components/molecules/OrcamentosMetricsChart.tsx` | Gráfico de barras mensais com recharts |
| Modify | `src/pages/DashboardPage.tsx` | Substituir `PrestadorDashboard`: queries + JSX |
| Modify | `src/features/solicitacao/components/SolicitacaoCard.tsx` | Adicionar urgência/prazo para variant prestador |
| Modify | `src/features/solicitacao/SolicitacaoListPrestadorPage.tsx` | Subtitle + filtros de urgência |

---

### Task 1: Adicionar URGENCIA_CONFIG em constants.ts

**Files:**
- Modify: `src/lib/constants.ts`

- [ ] **Step 1: Ler o arquivo antes de editar**

```bash
# Leia o arquivo para ter o conteúdo em contexto antes de qualquer Edit
```

- [ ] **Step 2: Adicionar URGENCIA_CONFIG após o bloco STATUS_BORDER_CLASS**

Adicione ao final de `src/lib/constants.ts`:

```ts
export const URGENCIA_CONFIG: Record<string, { label: string; className: string }> = {
  urgente: { label: 'Urgente', className: 'bg-danger-light text-danger' },
  media:   { label: 'Normal',  className: 'bg-warning-light text-warning' },
  baixa:   { label: 'Baixa',   className: 'bg-neutral-25 text-neutral-500' },
}
```

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Esperado: sem erros relacionados a constants.ts

- [ ] **Step 4: Commit**

```bash
git add src/lib/constants.ts
git commit -m "feat: add URGENCIA_CONFIG to constants"
```

---

### Task 2: Criar metricsUtils.ts + testes

**Files:**
- Create: `src/lib/metricsUtils.ts`
- Create: `src/lib/__tests__/metricsUtils.test.ts`

- [ ] **Step 1: Escrever o teste primeiro (TDD)**

Crie `src/lib/__tests__/metricsUtils.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { groupOrcamentosByMonth, calcApprovalRate } from '../metricsUtils'

describe('groupOrcamentosByMonth', () => {
  it('retorna 6 meses mesmo sem dados', () => {
    const result = groupOrcamentosByMonth([])
    expect(result).toHaveLength(6)
    result.forEach((m) => {
      expect(m.enviados).toBe(0)
      expect(m.aprovados).toBe(0)
    })
  })

  it('conta enviado, aceito e recusado como enviados', () => {
    const now = new Date().toISOString()
    const orcamentos = [
      { created_at: now, status: 'enviado' },
      { created_at: now, status: 'aceito' },
      { created_at: now, status: 'recusado' },
    ]
    const result = groupOrcamentosByMonth(orcamentos)
    const last = result.at(-1)!
    expect(last.enviados).toBe(3)
    expect(last.aprovados).toBe(1)
  })

  it('ignora status fora do funil (rascunho)', () => {
    const now = new Date().toISOString()
    const orcamentos = [{ created_at: now, status: 'rascunho' }]
    const result = groupOrcamentosByMonth(orcamentos)
    const last = result.at(-1)!
    expect(last.enviados).toBe(0)
  })

  it('ignora datas fora dos últimos 6 meses', () => {
    const old = new Date()
    old.setMonth(old.getMonth() - 7)
    const orcamentos = [{ created_at: old.toISOString(), status: 'aceito' }]
    const result = groupOrcamentosByMonth(orcamentos)
    expect(result.every((m) => m.aprovados === 0)).toBe(true)
  })
})

describe('calcApprovalRate', () => {
  it('retorna 0% quando enviados é zero', () => {
    const data = Array(6).fill({ mes: 'Jan', enviados: 0, aprovados: 0 })
    expect(calcApprovalRate(data).rate).toBe(0)
  })

  it('calcula taxa do último mês corretamente', () => {
    const data = [
      ...Array(4).fill({ mes: 'Jan', enviados: 0, aprovados: 0 }),
      { mes: 'Abr', enviados: 4, aprovados: 2 },
      { mes: 'Mai', enviados: 3, aprovados: 3 },
    ]
    const { rate, delta } = calcApprovalRate(data)
    expect(rate).toBe(100)
    expect(delta).toBe(50)
  })
})
```

- [ ] **Step 2: Rodar testes para confirmar que falham**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/lib/__tests__/metricsUtils.test.ts --reporter=verbose
```

Esperado: FAIL — "Cannot find module '../metricsUtils'"

- [ ] **Step 3: Implementar metricsUtils.ts**

Crie `src/lib/metricsUtils.ts`:

```ts
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
```

- [ ] **Step 4: Rodar testes para confirmar que passam**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/lib/__tests__/metricsUtils.test.ts --reporter=verbose
```

Esperado: PASS — 6 testes passando

- [ ] **Step 5: Commit**

```bash
git add src/lib/metricsUtils.ts src/lib/__tests__/metricsUtils.test.ts
git commit -m "feat: add metricsUtils for monthly orçamento grouping"
```

---

### Task 3: Criar UrgenciaBadge atom + testes

**Files:**
- Create: `src/components/atoms/UrgenciaBadge.tsx`
- Create: `src/components/atoms/__tests__/UrgenciaBadge.test.tsx`

- [ ] **Step 1: Escrever o teste primeiro (TDD)**

Crie `src/components/atoms/__tests__/UrgenciaBadge.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UrgenciaBadge } from '../UrgenciaBadge'

describe('UrgenciaBadge', () => {
  it.each([
    ['urgente', 'Urgente'],
    ['media',   'Normal'],
    ['baixa',   'Baixa'],
  ])('renderiza label correta para urgencia "%s"', (urgencia, label) => {
    render(<UrgenciaBadge urgencia={urgencia} />)
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('não renderiza nada quando urgencia é undefined', () => {
    const { container } = render(<UrgenciaBadge urgencia={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('aplica className de danger para urgente', () => {
    const { container } = render(<UrgenciaBadge urgencia="urgente" />)
    expect(container.firstChild).toHaveClass('text-danger')
  })
})
```

- [ ] **Step 2: Rodar para confirmar que falha**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/components/atoms/__tests__/UrgenciaBadge.test.tsx --reporter=verbose
```

Esperado: FAIL — "Cannot find module '../UrgenciaBadge'"

- [ ] **Step 3: Implementar UrgenciaBadge.tsx**

Crie `src/components/atoms/UrgenciaBadge.tsx`:

```tsx
import { URGENCIA_CONFIG } from '@/lib/constants'

interface UrgenciaBadgeProps {
  urgencia: string | null | undefined
}

export function UrgenciaBadge({ urgencia }: UrgenciaBadgeProps) {
  if (!urgencia) return null
  const config = URGENCIA_CONFIG[urgencia]
  if (!config) return null

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}
```

- [ ] **Step 4: Rodar testes para confirmar que passam**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/components/atoms/__tests__/UrgenciaBadge.test.tsx --reporter=verbose
```

Esperado: PASS — 5 testes passando

- [ ] **Step 5: Commit**

```bash
git add src/components/atoms/UrgenciaBadge.tsx src/components/atoms/__tests__/UrgenciaBadge.test.tsx
git commit -m "feat: add UrgenciaBadge atom"
```

---

### Task 4: Instalar recharts + criar OrcamentosMetricsChart

**Files:**
- Modify: `package.json` (via npm install)
- Create: `src/components/molecules/OrcamentosMetricsChart.tsx`
- Create: `src/components/molecules/__tests__/OrcamentosMetricsChart.test.tsx`

- [ ] **Step 1: Instalar recharts**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npm install recharts
```

Esperado: recharts adicionado ao package.json sem erros

- [ ] **Step 2: Escrever o teste (smoke test)**

Crie `src/components/molecules/__tests__/OrcamentosMetricsChart.test.tsx`:

```tsx
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
```

- [ ] **Step 3: Rodar para confirmar que falha**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/components/molecules/__tests__/OrcamentosMetricsChart.test.tsx --reporter=verbose
```

Esperado: FAIL — "Cannot find module '../OrcamentosMetricsChart'"

- [ ] **Step 4: Implementar OrcamentosMetricsChart.tsx**

Crie `src/components/molecules/OrcamentosMetricsChart.tsx`:

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { calcApprovalRate } from '@/lib/metricsUtils'
import type { MonthMetric } from '@/lib/metricsUtils'

interface OrcamentosMetricsChartProps {
  data: MonthMetric[]
}

export function OrcamentosMetricsChart({ data }: OrcamentosMetricsChartProps) {
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
```

- [ ] **Step 5: Rodar testes para confirmar que passam**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/components/molecules/__tests__/OrcamentosMetricsChart.test.tsx --reporter=verbose
```

Esperado: PASS — 3 testes passando

- [ ] **Step 6: Verificar typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/components/molecules/OrcamentosMetricsChart.tsx src/components/molecules/__tests__/OrcamentosMetricsChart.test.tsx
git commit -m "feat: add OrcamentosMetricsChart molecule with recharts"
```

---

### Task 5: Atualizar queries do PrestadorDashboard

**Files:**
- Modify: `src/pages/DashboardPage.tsx` (apenas a função queryFn)

- [ ] **Step 1: Ler DashboardPage.tsx antes de editar**

Leia o arquivo completo para ter o conteúdo em contexto.

- [ ] **Step 2: Adicionar import de groupOrcamentosByMonth no topo do arquivo**

Após os imports existentes, adicione:

```ts
import { groupOrcamentosByMonth } from '@/lib/metricsUtils'
import { OrcamentosMetricsChart } from '@/components/molecules/OrcamentosMetricsChart'
import { BarChart2 } from 'lucide-react'
```

Atualize também a linha de import do lucide-react existente:

```ts
// antes:
import { Plus, Search, Zap, Clock } from 'lucide-react'
// depois (adicionar BarChart2):
import { Plus, Search, Zap, Clock, BarChart2 } from 'lucide-react'
```

- [ ] **Step 3: Substituir a função queryFn do PrestadorDashboard**

Localize o bloco `queryFn: async () => {` dentro de `PrestadorDashboard` e substitua pelo seguinte:

```ts
queryFn: async () => {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const sixMonthsAgo = new Date()
  sixMonthsAgo.setDate(1)
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setHours(0, 0, 0, 0)

  const [
    disponiveis,
    aguardando,
    aceitosEsteMes,
    osAtivas,
    disponiveisLista,
    aceitosLista,
    metricsRaw,
    recente,
  ] = await Promise.all([
    supabase
      .from('solicitacoes_orcamento')
      .select('id', { count: 'exact', head: false })
      .eq('status', 'aguardando_orcamento')
      .is('deleted_at', null),
    supabase
      .from('orcamentos')
      .select('id', { count: 'exact', head: false })
      .eq('status', 'enviado')
      .eq('prestador_id', profile?.id ?? '')
      .is('deleted_at', null),
    supabase
      .from('orcamentos')
      .select('id', { count: 'exact', head: false })
      .eq('status', 'aceito')
      .eq('prestador_id', profile?.id ?? '')
      .is('deleted_at', null)
      .gte('created_at', startOfMonth.toISOString()),
    supabase
      .from('ordens_servico')
      .select('id', { count: 'exact', head: false })
      .neq('status', 'concluida')
      .neq('status', 'cancelada'),
    supabase
      .from('solicitacoes_orcamento')
      .select('id, numero, titulo, categoria, urgencia')
      .eq('status', 'aguardando_orcamento')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orcamentos')
      .select('id, numero, created_at')
      .eq('status', 'aceito')
      .eq('prestador_id', profile?.id ?? '')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('orcamentos')
      .select('created_at, status')
      .eq('prestador_id', profile?.id ?? '')
      .is('deleted_at', null)
      .in('status', ['enviado', 'aceito', 'recusado'])
      .gte('created_at', sixMonthsAgo.toISOString()),
    supabase
      .from('status_historico')
      .select('id, tabela_nome, status_anterior, status_novo, created_at')
      .eq('usuario_id', profile?.id ?? '')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  return {
    solicitacoesDisponiveis: disponiveis.data?.length ?? 0,
    aguardandoResposta:      aguardando.data?.length ?? 0,
    aceitosEsteMes:          aceitosEsteMes.data?.length ?? 0,
    osAtivas:                osAtivas.data?.length ?? 0,
    disponiveisLista:        disponiveisLista.data ?? [],
    aceitosLista:            aceitosLista.data ?? [],
    metricsData:             groupOrcamentosByMonth(metricsRaw.data ?? []),
    recente:                 recente.data ?? [],
  }
},
```

- [ ] **Step 4: Atualizar o bloco isEmpty**

Localize e substitua:

```ts
// antes:
const isEmpty =
  data &&
  data.solicitacoesDisponiveis === 0 &&
  data.meusOrcamentos === 0 &&
  data.osAtivas === 0

// depois:
const isEmpty =
  data &&
  data.solicitacoesDisponiveis === 0 &&
  data.aguardandoResposta === 0 &&
  data.aceitosEsteMes === 0 &&
  data.osAtivas === 0
```

- [ ] **Step 5: Verificar typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Esperado: sem erros de tipo

- [ ] **Step 6: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: update PrestadorDashboard queries for pipeline view"
```

---

### Task 6: Atualizar JSX do PrestadorDashboard

**Files:**
- Modify: `src/pages/DashboardPage.tsx` (apenas o bloco return do PrestadorDashboard)

> O arquivo já está em contexto da task anterior. Se iniciou uma nova sessão, leia o arquivo antes de editar.

- [ ] **Step 1: Substituir o bloco return de PrestadorDashboard**

Localize `return (` dentro da função `PrestadorDashboard` e substitua todo o JSX pelo seguinte:

```tsx
return (
  <div className="space-y-8">
    {/* 4 StatCards — pipeline */}
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <StatCard label="Disponíveis p/ Orçar"  value={data?.solicitacoesDisponiveis} to="/prestador/solicitacoes" />
      <StatCard label="Aguardando Resposta"    value={data?.aguardandoResposta}       to="/orcamentos" />
      <StatCard label="Aceitos este mês"       value={data?.aceitosEsteMes}           to="/orcamentos" />
      <StatCard label="OS Ativas"              value={data?.osAtivas}                 to="/ordens-servico" />
    </div>

    {/* Gráfico de desempenho */}
    {data && (
      <DashboardSection
        title="Desempenho dos últimos 6 meses"
        icon={<BarChart2 className="h-4 w-4 text-neutral-400" />}
      >
        <OrcamentosMetricsChart data={data.metricsData} />
      </DashboardSection>
    )}

    {/* Ação necessária — dois grupos por prioridade */}
    <DashboardSection
      title="Ação necessária"
      icon={<Zap className="h-4 w-4 text-amber-500" />}
      viewAllTo="/prestador/solicitacoes"
      viewAllLabel="Ver todas as solicitações"
    >
      {/* Grupo 1: Orçamentos aprovados (só aparece quando existem) */}
      {(data?.aceitosLista.length ?? 0) > 0 && (
        <div className="space-y-1">
          <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Orçamentos aprovados
          </p>
          {data?.aceitosLista.map((orc) => (
            <ActionItem
              key={orc.id}
              numero={orc.numero}
              titulo="Orçamento aprovado"
              subtexto={`aprovado ${relativeDate(orc.created_at)}`}
              to={`/prestador/orcamentos/${orc.id}`}
              ctaLabel="Criar OS"
            />
          ))}
        </div>
      )}

      {/* Grupo 2: Novas oportunidades */}
      {(data?.disponiveisLista.length ?? 0) > 0 && (
        <div className="space-y-1">
          {(data?.aceitosLista.length ?? 0) > 0 && (
            <p className="mt-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Novas oportunidades
            </p>
          )}
          {data?.disponiveisLista.map((sol) => {
            const urgLabel =
              sol.urgencia && sol.urgencia !== 'baixa'
                ? sol.urgencia.charAt(0).toUpperCase() + sol.urgencia.slice(1)
                : null
            const subtexto = [
              urgLabel,
              sol.categoria ? `Categoria: ${sol.categoria}` : null,
            ]
              .filter(Boolean)
              .join(' · ') || undefined

            return (
              <ActionItem
                key={sol.id}
                numero={sol.numero}
                titulo={sol.titulo}
                subtexto={subtexto}
                to={`/prestador/solicitacoes/${sol.id}`}
                ctaLabel="Orçar"
              />
            )
          })}
        </div>
      )}

      {/* Tudo em dia */}
      {(data?.aceitosLista.length ?? 0) === 0 &&
        (data?.disponiveisLista.length ?? 0) === 0 && <AllClearBanner />}
    </DashboardSection>

    {/* Atividade recente */}
    {(data?.recente.length ?? 0) > 0 && (
      <DashboardSection
        title="Atividade Recente"
        icon={<Clock className="h-4 w-4 text-neutral-400" />}
      >
        <div className="rounded-lg border border-border bg-card px-4 py-1 shadow-card">
          {data?.recente.map((item) => (
            <ActivityItem
              key={item.id}
              tabelaNome={item.tabela_nome}
              statusAnterior={item.status_anterior}
              statusNovo={item.status_novo}
              createdAt={item.created_at}
            />
          ))}
        </div>
      </DashboardSection>
    )}
  </div>
)
```

- [ ] **Step 2: Remover o botão "Ver Disponíveis para Orçar" que existia antes**

O `<Link to="/prestador/solicitacoes">Ver Disponíveis para Orçar</Link>` existente no JSX antigo deve ser removido — as informações agora estão no StatCard e nos grupos da seção.

- [ ] **Step 3: Verificar typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 4: Rodar lint**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx eslint src/pages/DashboardPage.tsx --max-warnings=0
```

Esperado: sem warnings

- [ ] **Step 5: Commit**

```bash
git add src/pages/DashboardPage.tsx
git commit -m "feat: refactor PrestadorDashboard to pipeline view with metrics chart"
```

---

### Task 7: Enriquecer SolicitacaoCard (variant prestador)

**Files:**
- Modify: `src/features/solicitacao/components/SolicitacaoCard.tsx`

- [ ] **Step 1: Ler SolicitacaoCard.tsx**

Leia o arquivo antes de editar para ter o conteúdo em contexto.

- [ ] **Step 2: Adicionar import de UrgenciaBadge no topo**

```tsx
import { UrgenciaBadge } from '@/components/atoms/UrgenciaBadge'
```

- [ ] **Step 3: Adicionar bloco de urgência/prazo após o div de categoria/equipamento**

Localize o fechamento `</div>` do bloco de chips (categoria + equipamento). Após ele, insira:

```tsx
{variant === 'prestador' && (solicitacao.urgencia || solicitacao.prazo_desejado) && (
  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
    {solicitacao.urgencia && (
      <UrgenciaBadge urgencia={solicitacao.urgencia} />
    )}
    {solicitacao.prazo_desejado && (
      <span className="text-xs text-muted-foreground">
        Prazo: {new Date(solicitacao.prazo_desejado).toLocaleDateString('pt-BR')}
      </span>
    )}
  </div>
)}
```

- [ ] **Step 4: Verificar typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Esperado: sem erros. Se houver erro de tipo em `solicitacao.prazo_desejado`, verifique que `ISolicitacao` tem esse campo em `src/types/domain.ts` (deve ter `prazo_desejado?: string | null`).

- [ ] **Step 5: Rodar testes existentes do SolicitacaoCard**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run src/features/solicitacao/components/__tests__/SolicitacaoCard.test.tsx --reporter=verbose
```

Esperado: PASS — todos os testes pré-existentes passando (sem regressão)

- [ ] **Step 6: Commit**

```bash
git add src/features/solicitacao/components/SolicitacaoCard.tsx
git commit -m "feat: enrich SolicitacaoCard with urgency badge and deadline for prestador variant"
```

---

### Task 8: Atualizar SolicitacaoListPrestadorPage

**Files:**
- Modify: `src/features/solicitacao/SolicitacaoListPrestadorPage.tsx`

- [ ] **Step 1: Ler SolicitacaoListPrestadorPage.tsx**

Leia o arquivo antes de editar.

- [ ] **Step 2: Adicionar estado e filtros de urgência**

Após a linha `const [activeCategoria, setActiveCategoria] = useState<string>('')`, adicione:

```ts
const [activeUrgencia, setActiveUrgencia] = useState<string>('')
```

Adicione a constante de filtros de urgência após `CATEGORIA_FILTERS`:

```ts
const URGENCIA_FILTERS = [
  { label: 'Qualquer urgência', value: '' as const },
  { label: 'Urgente',           value: 'urgente' as const },
  { label: 'Normal',            value: 'media' as const },
  { label: 'Baixa',             value: 'baixa' as const },
]
```

- [ ] **Step 3: Atualizar lógica de filtro para incluir urgência**

Localize o bloco `const filtered = data.filter(...)` e substitua por:

```ts
const filtered = data.filter((s) => {
  const matchesSearch =
    !search ||
    s.titulo.toLowerCase().includes(search.toLowerCase()) ||
    s.numero.toLowerCase().includes(search.toLowerCase())
  const matchesCategoria = !activeCategoria || s.categoria === activeCategoria
  const matchesUrgencia  = !activeUrgencia  || s.urgencia  === activeUrgencia
  return matchesSearch && matchesCategoria && matchesUrgencia
})
```

- [ ] **Step 4: Adicionar handler de urgência e atualizar handleCategoriaChange para resetar urgência**

```ts
const handleUrgenciaChange = (v: string) => {
  setActiveUrgencia(v)
  setPage(1)
}
```

- [ ] **Step 5: Atualizar o subtitle e o bloco de filtros no ListPageShell**

Localize `subtitle="Aguardando orçamento"` e substitua por:

```tsx
subtitle="Explore e avalie oportunidades disponíveis"
```

Localize o prop `filters={...}` e substitua por:

```tsx
filters={
  <div className="flex items-center gap-4 flex-wrap">
    <StatusFilterChips
      filters={CATEGORIA_FILTERS}
      active={activeCategoria}
      onSelect={handleCategoriaChange}
    />
    <span className="h-4 border-l border-border" aria-hidden />
    <StatusFilterChips
      filters={URGENCIA_FILTERS}
      active={activeUrgencia}
      onSelect={handleUrgenciaChange}
    />
  </div>
}
```

- [ ] **Step 6: Verificar typecheck**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx tsc --noEmit
```

Esperado: sem erros

- [ ] **Step 7: Rodar todos os testes**

```bash
cd /Users/victorigor/eep-projeto/eep-projeto/orcafacil && npx vitest run --reporter=verbose
```

Esperado: PASS — todos os testes passando

- [ ] **Step 8: Commit final**

```bash
git add src/features/solicitacao/SolicitacaoListPrestadorPage.tsx
git commit -m "feat: add urgency filters and improved subtitle to SolicitacaoListPrestadorPage"
```

---

## Self-Review Checklist

Spec coberta:

| Requisito | Task |
|-----------|------|
| 4 StatCards de funil (Disponíveis, Aguardando, Aceitos, OS) | Task 5 + 6 |
| Gráfico mensal Enviados vs Aprovados | Task 4 + 6 |
| Taxa de aprovação no gráfico | Task 2 + 4 |
| "Ação Necessária" com grupo aprovados + grupo oportunidades | Task 6 |
| `UrgenciaBadge` atom reutilizável | Task 3 |
| `URGENCIA_CONFIG` em constants.ts | Task 1 |
| SolicitacaoCard enriquecido (urgência + prazo) para variant prestador | Task 7 |
| Subtitle e filtros de urgência em SolicitacaoListPrestadorPage | Task 8 |
| recharts como única nova dependência | Task 4 |
| ClienteDashboard inalterado | — (não tocado) |
| OrcamentosPage inalterada | — (não tocada) |
