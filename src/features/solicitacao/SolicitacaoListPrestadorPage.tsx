import { useNavigate } from 'react-router-dom'
import { useListSolicitacoesParaPrestador } from './useSolicitacao'
import { SolicitacaoCard } from './components/SolicitacaoCard'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'

export default function SolicitacaoListPrestadorPage() {
  const navigate = useNavigate()
  const { data = [], isLoading, isError, refetch } = useListSolicitacoesParaPrestador()

  return (
    <div className="p-6">
      <div className="pb-4">
        <h1 className="text-xl font-semibold text-neutral-800">Solicitações Disponíveis</h1>
        <p className="mt-1 text-sm text-neutral-500">Solicitações aguardando orçamento</p>
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <LoadingSkeleton rows={4} />}
        {isError && <ErrorState message="Erro ao carregar solicitações" onRetry={refetch} />}
        {!isLoading && !isError && data.length === 0 && (
          <EmptyState
            title="Nenhuma solicitação disponível"
            description="Não há solicitações aguardando orçamento no momento."
          />
        )}
        {!isLoading && !isError && data.map((sol) => (
          <SolicitacaoCard
            key={sol.id}
            solicitacao={sol}
            variant="prestador"
            onClick={() => navigate(`/prestador/solicitacoes/${sol.id}`)}
          />
        ))}
      </div>
    </div>
  )
}
