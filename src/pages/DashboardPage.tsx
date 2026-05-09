import { Link } from 'react-router-dom'
import { ClipboardList, FileText, Wrench, Plus, Search, Zap, Clock, ArrowRight } from 'lucide-react'
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

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  to,
  color = 'bg-primary',
  urgent = false,
}: {
  label: string
  value: number | undefined
  icon: React.ElementType
  to: string
  color?: string
  urgent?: boolean
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-5 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.05)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group"
    >
      <div className="relative shrink-0">
        <div className={`${color} flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-sm group-hover:scale-105 group-hover:shadow-md transition-all duration-300`}>
          <Icon className="h-5 w-5" />
        </div>
        {urgent && (value ?? 0) > 0 && (
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold truncate mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-neutral-900 tracking-tight">
          {value === undefined ? '—' : value}
        </p>
      </div>
      <ArrowRight className="ml-auto h-4 w-4 text-neutral-300 shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
    </Link>
  )
}

// ─── Banner "tudo em dia" ─────────────────────────────────────────────────────

function AllClearBanner() {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
      <div className="h-2 w-2 rounded-full bg-green-500 shrink-0" />
      <p className="text-sm text-green-700 font-medium">Tudo em dia! Nenhum item aguarda sua ação.</p>
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
        <StatCard label="Minhas Solicitações" value={data?.totalSolicitacoes} icon={ClipboardList} to="/solicitacoes" color="bg-blue-500" />
        <StatCard label="Orçamentos p/ Revisar" value={data?.orcamentosPendentes} icon={FileText} to="/orcamentos" color="bg-amber-500" urgent />
        <StatCard label="OS em Andamento" value={data?.osAtivas} icon={Wrench} to="/ordens-servico" color="bg-green-500" />
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
          <div className="rounded-xl border border-neutral-100 bg-white px-4 py-1 shadow-sm">
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
      const [disponiveis, meusOrc, osAtivas, disponiveisLista, recente] = await Promise.all([
        supabase
          .from('solicitacoes_orcamento')
          .select('id', { count: 'exact', head: false })
          .eq('status', 'aguardando_orcamento')
          .is('deleted_at', null),
        supabase
          .from('orcamentos')
          .select('id', { count: 'exact', head: false })
          .is('deleted_at', null),
        supabase
          .from('ordens_servico')
          .select('id', { count: 'exact', head: false })
          .neq('status', 'concluida')
          .neq('status', 'cancelada'),
        supabase
          .from('solicitacoes_orcamento')
          .select('id, numero, titulo, categoria, created_at')
          .eq('status', 'aguardando_orcamento')
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
          .limit(5),
        supabase
          .from('status_historico')
          .select('id, tabela_nome, status_anterior, status_novo, created_at')
          .eq('usuario_id', profile?.id ?? '')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      return {
        solicitacoesDisponiveis: disponiveis.data?.length ?? 0,
        meusOrcamentos: meusOrc.data?.length ?? 0,
        osAtivas: osAtivas.data?.length ?? 0,
        disponiveisLista: disponiveisLista.data ?? [],
        recente: recente.data ?? [],
      }
    },
    enabled: !!profile?.id,
  })

  const isEmpty =
    data &&
    data.solicitacoesDisponiveis === 0 &&
    data.meusOrcamentos === 0 &&
    data.osAtivas === 0

  if (isLoading) return <LoadingSkeleton rows={5} />
  if (isEmpty) return <DashboardEmptyState role="prestador" />

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Disponíveis p/ Orçar" value={data?.solicitacoesDisponiveis} icon={ClipboardList} to="/prestador/solicitacoes" color="bg-blue-500" urgent />
        <StatCard label="Meus Orçamentos" value={data?.meusOrcamentos} icon={FileText} to="/orcamentos" color="bg-primary" />
        <StatCard label="OS em Andamento" value={data?.osAtivas} icon={Wrench} to="/ordens-servico" color="bg-green-500" />
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
          <div className="rounded-xl border border-neutral-100 bg-white px-4 py-1 shadow-sm">
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
