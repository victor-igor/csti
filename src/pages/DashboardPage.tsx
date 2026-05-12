import { Link } from 'react-router-dom'
import { Plus, Search, Zap, Clock, BarChart2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/molecules/PageHeader'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { DashboardSection } from '@/components/molecules/DashboardSection'
import { DashboardEmptyState } from '@/components/molecules/DashboardEmptyState'
import { ActionItem } from '@/components/molecules/ActionItem'
import { ActivityItem } from '@/components/molecules/ActivityItem'
import { greetingByHour, relativeDate } from '@/lib/dateUtils'
import { groupOrcamentosByMonth } from '@/lib/metricsUtils'
import { OrcamentosMetricsChart } from '@/components/molecules/OrcamentosMetricsChart'

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  to,
}: {
  label: string
  value: number | undefined
  to: string
}) {
  return (
    <Link
      to={to}
      className="rounded-lg border border-border bg-card p-5 shadow-card hover:shadow-card-hover hover:border-primary transition-all"
    >
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-foreground">
        {value === undefined ? '—' : value}
      </p>
    </Link>
  )
}

// ─── Banner "tudo em dia" ─────────────────────────────────────────────────────

function AllClearBanner() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success-light px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-success shrink-0" />
      <p className="text-sm text-success font-medium">Tudo em dia! Nenhum item aguarda sua ação.</p>
    </div>
  )
}

// ─── Dashboard do Cliente ─────────────────────────────────────────────────────

function ClienteDashboard() {
  const profile = useAuthStore((s) => s.profile)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'cliente', profile?.id],
    queryFn: async () => {
      const [sol, orc, os, orcPendentes, recente] = await Promise.all([
        supabase
          .from('solicitacoes_orcamento')
          .select('id', { count: 'exact', head: false })
          .is('deleted_at', null),
        supabase
          .from('orcamentos')
          .select('id', { count: 'exact', head: false })
          .is('deleted_at', null)
          .eq('status', 'enviado'),
        supabase
          .from('ordens_servico')
          .select('id', { count: 'exact', head: false })
          .neq('status', 'concluida')
          .neq('status', 'cancelada'),
        supabase
          .from('orcamentos')
          .select('id, numero, solicitacao_id, validade_ate, created_at')
          .eq('status', 'enviado')
          .is('deleted_at', null)
          .order('validade_ate', { ascending: true, nullsFirst: false })
          .limit(5),
        supabase
          .from('status_historico')
          .select('id, tabela_nome, status_anterior, status_novo, created_at')
          .eq('usuario_id', profile?.id ?? '')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      return {
        totalSolicitacoes: sol.data?.length ?? 0,
        orcamentosPendentes: orc.data?.length ?? 0,
        osAtivas: os.data?.length ?? 0,
        orcPendentesLista: orcPendentes.data ?? [],
        recente: recente.data ?? [],
      }
    },
    enabled: !!profile?.id,
  })

  const isEmpty =
    data &&
    data.totalSolicitacoes === 0 &&
    data.orcamentosPendentes === 0 &&
    data.osAtivas === 0

  if (isLoading) return <LoadingSkeleton rows={5} />
  if (isEmpty) return <DashboardEmptyState role="cliente" />

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Minhas Solicitações" value={data?.totalSolicitacoes} to="/solicitacoes" />
        <StatCard label="Orçamentos p/ Revisar" value={data?.orcamentosPendentes} to="/orcamentos" />
        <StatCard label="OS em Andamento" value={data?.osAtivas} to="/ordens-servico" />
      </div>

      <Link
        to="/solicitacoes/nova"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
      >
        <Plus className="h-4 w-4" />
        Nova Solicitação
      </Link>

      <DashboardSection
        title="Precisa de atenção"
        icon={<Zap className="h-4 w-4 text-amber-500" />}
        viewAllTo="/orcamentos"
        viewAllLabel="Ver todos os orçamentos"
      >
        {(data?.orcPendentesLista.length ?? 0) === 0 ? (
          <AllClearBanner />
        ) : (
          data?.orcPendentesLista.map((orc) => {
            const venceEm = orc.validade_ate
              ? `vence ${relativeDate(orc.validade_ate)}`
              : undefined
            return (
              <ActionItem
                key={orc.id}
                numero={orc.numero}
                titulo="Orçamento aguardando revisão"
                subtexto={venceEm}
                to={`/orcamentos/${orc.id}/revisar`}
                ctaLabel="Revisar"
              />
            )
          })
        )}
      </DashboardSection>

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
}

// ─── Dashboard do Prestador ───────────────────────────────────────────────────

function PrestadorDashboard() {
  const profile = useAuthStore((s) => s.profile)

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'prestador', profile?.id],
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
    enabled: !!profile?.id,
  })

  const isEmpty =
    data &&
    data.solicitacoesDisponiveis === 0 &&
    data.aguardandoResposta === 0 &&
    data.aceitosEsteMes === 0 &&
    data.osAtivas === 0

  if (isLoading) return <LoadingSkeleton rows={5} />
  if (isEmpty) return <DashboardEmptyState role="prestador" />

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disponíveis p/ Orçar" value={data?.solicitacoesDisponiveis} to="/prestador/solicitacoes" />
        <StatCard label="Orç. Enviados" value={data?.meusOrcamentos} to="/orcamentos" />
        <StatCard label="OS em Andamento" value={data?.osAtivas} to="/ordens-servico" />
      </div>

      <Link
        to="/prestador/solicitacoes"
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity shadow-sm"
      >
        <Search className="h-4 w-4" />
        Ver Disponíveis para Orçar
        {(data?.solicitacoesDisponiveis ?? 0) > 0 && (
          <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
            {data?.solicitacoesDisponiveis}
          </span>
        )}
      </Link>

      <DashboardSection
        title="Precisa de atenção"
        icon={<Zap className="h-4 w-4 text-amber-500" />}
        viewAllTo="/prestador/solicitacoes"
        viewAllLabel="Ver todas as solicitações"
      >
        {(data?.disponiveisLista.length ?? 0) === 0 ? (
          <AllClearBanner />
        ) : (
          data?.disponiveisLista.map((sol) => (
            <ActionItem
              key={sol.id}
              numero={sol.numero}
              titulo={sol.titulo}
              subtexto={sol.categoria ? `Categoria: ${sol.categoria}` : undefined}
              to={`/prestador/solicitacoes/${sol.id}`}
              ctaLabel="Orçar"
            />
          ))
        )}
      </DashboardSection>

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
}

// ─── DashboardPage ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)

  const greeting = greetingByHour()
  const firstName = profile?.nome?.split(' ')[0] ?? 'bem-vindo'
  const roleLabel = profile?.role === 'prestador' ? 'Prestador' : 'Cliente'

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={`${greeting}, ${firstName}!`}
        subtitle={`${hoje.charAt(0).toUpperCase() + hoje.slice(1)} • Painel do ${roleLabel}`}
      />
      {profile?.role === 'prestador' ? <PrestadorDashboard /> : <ClienteDashboard />}
    </div>
  )
}
