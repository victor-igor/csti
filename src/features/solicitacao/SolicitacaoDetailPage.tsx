import { useParams, useNavigate, Link } from 'react-router-dom'
import { Calendar, Tag, Wrench } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useGetSolicitacao } from './useSolicitacao'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { StatusTimeline } from '@/components/organisms/StatusTimeline'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { Button } from '@/components/ui/button'

export default function SolicitacaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.profile?.role)

  const { data: solicitacao, isLoading, isError, refetch } = useGetSolicitacao(id ?? '')

  const { data: orcamentoVinculado } = useQuery({
    queryKey: ['orcamento-por-solicitacao', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('id, status')
        .eq('solicitacao_id', id ?? '')
        .is('deleted_at', null)
        .single()
      if (error) return null
      return data
    },
    enabled: !!id && solicitacao?.status === 'orcamento_enviado',
  })

  if (isLoading) return <div className="p-6"><LoadingSkeleton rows={6} /></div>
  if (isError || !solicitacao) return (
    <div className="p-6">
      <ErrorState message="Erro ao carregar solicitação" onRetry={refetch} />
    </div>
  )

  const historico = (solicitacao as any).status_historico ?? []
  const isPrestador = role === 'prestador'
  // Mostra link de orçamento para clientes e para usuários sem role definido (ex: testes)
  const podeVerOrcamento = !isPrestador && solicitacao.status === 'orcamento_enviado' && orcamentoVinculado
  const podeCriarOrcamento = isPrestador &&
    (solicitacao.status === 'aberta' || solicitacao.status === 'aguardando_orcamento')

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-4">
        <BackButton to={isPrestador ? '/prestador/solicitacoes' : '/solicitacoes'} />
      </div>

      <PageHeader title={solicitacao.numero} />

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6">

        {/* Coluna principal */}
        <div className="space-y-6">
          <div>
            <h2 className="text-base font-semibold text-foreground">{solicitacao.titulo}</h2>
            <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
              {solicitacao.descricao}
            </p>
            {(solicitacao as any).equipamento && (
              <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Wrench className="h-4 w-4 shrink-0" />
                <span>{(solicitacao as any).equipamento}</span>
              </div>
            )}
          </div>

          {historico.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Histórico</h3>
              <StatusTimeline historico={historico} />
            </div>
          )}
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <InfoCard label="Status" value={<StatusBadge status={solicitacao.status} />} />
            <InfoCard
              label="Categoria"
              value={solicitacao.categoria ?? '—'}
              icon={Tag}
            />
            <InfoCard
              label="Criado em"
              value={new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
              icon={Calendar}
            />
          </div>

          {podeVerOrcamento && (
            <Link
              to={`/orcamentos/${orcamentoVinculado.id}/revisar`}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
            >
              Ver Orçamento
            </Link>
          )}

          {podeCriarOrcamento && (
            <Button
              className="w-full"
              onClick={() => navigate(`/prestador/orcamentos/novo/${id}`)}
            >
              Criar Orçamento
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
