import { useParams, Link } from 'react-router-dom'
import { Calendar, Tag } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { useGetSolicitacao } from './useSolicitacao'
import { supabase } from '@/lib/supabase'
import { PageHeader } from '@/components/molecules/PageHeader'
import { BackButton } from '@/components/molecules/BackButton'
import { InfoCard } from '@/components/molecules/InfoCard'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'

export default function SolicitacaoDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: solicitacao, isLoading, isError, refetch } = useGetSolicitacao(id ?? '')

  const { data: orcamentoVinculado, isLoading: isLoadingOrcamento } = useQuery({
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

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-4">
        <BackButton to="/solicitacoes" />
      </div>
      <PageHeader title={solicitacao.numero} />

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-4">
        <InfoCard label="Status" value={<StatusBadge status={solicitacao.status} />} />
        <InfoCard label="Categoria" value={solicitacao.categoria ?? '—'} icon={Tag} />
        <InfoCard
          label="Criado em"
          value={new Date(solicitacao.created_at).toLocaleDateString('pt-BR')}
          icon={Calendar}
        />
      </div>

      <div className="mt-6">
        <h2 className="text-base font-semibold text-neutral-800 mb-2">{solicitacao.titulo}</h2>
        <p className="text-sm text-neutral-600 whitespace-pre-wrap">{solicitacao.descricao}</p>
      </div>

      {solicitacao.status === 'orcamento_enviado' && (
        <div className="mt-6">
          {isLoadingOrcamento ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-neutral-200" />
          ) : orcamentoVinculado ? (
            <Link
              to={`/orcamentos/${orcamentoVinculado.id}/revisar`}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Ver Orçamento
            </Link>
          ) : null}
        </div>
      )}
    </div>
  )
}
