import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ListPageShell } from '@/components/molecules/ListPageShell'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { OrdemServicoCard } from '@/components/organisms/OrdemServicoCard'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { useAuthStore } from '@/store/authStore'
import { relativeDate } from '@/lib/dateUtils'
import type { OSStatus } from '@/types/domain'
import { useListOrdensServico } from './useOrdemServico'

const STATUS_FILTERS: { label: string; value: OSStatus | '' }[] = [
  { label: 'Todos',        value: '' },
  { label: 'Aberta',       value: 'aberta' },
  { label: 'Em Andamento', value: 'em_andamento' },
  { label: 'Concluída',    value: 'concluida' },
  { label: 'Cancelada',    value: 'cancelada' },
]

export default function OrdemServicoListPage() {
  const navigate = useNavigate()
  const role = useAuthStore((s) => s.profile?.role)
  const isPrestador = role === 'prestador'

  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<OSStatus | ''>('')

  const { data = [], isLoading, isError, refetch } = useListOrdensServico(
    activeStatus ? { status: activeStatus } : undefined,
  )

  const filtered = search
    ? data.filter(os => os.numero.toLowerCase().includes(search.toLowerCase()))
    : data

  const emptyDescription = search
    ? 'Tente outros termos de busca'
    : isPrestador
      ? 'As ordens de serviço aparecerão aqui quando um cliente aprovar seu orçamento'
      : 'As ordens de serviço serão criadas automaticamente quando um orçamento for aprovado'

  return (
    <ListPageShell
      title="Ordens de Serviço"
      subtitle={isPrestador ? 'Serviços em execução' : 'Acompanhe seus serviços'}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar por número..."
      filters={
        <StatusFilterChips
          filters={STATUS_FILTERS}
          active={activeStatus}
          onSelect={(v) => setActiveStatus(v as OSStatus | '')}
        />
      }
      resultCount={filtered.length}
      totalCount={data.length}
      columns={1}
    >
      {isLoading && <LoadingSkeleton rows={4} />}
      {isError && (
        <ErrorState
          message="Não foi possível carregar as ordens de serviço. Verifique sua conexão e tente novamente."
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Nenhuma ordem de serviço encontrada"
          description={emptyDescription}
        />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Número</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Início</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Conclusão</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Criado em</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(os => (
                  <tr
                    key={os.id}
                    className="bg-card hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/ordens-servico/${os.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs uppercase text-foreground">{os.numero}</td>
                    <td className="px-4 py-3"><StatusBadge status={os.status} /></td>
                    <td className="px-4 py-3 text-foreground">
                      {os.data_inicio ? new Date(os.data_inicio).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {os.data_conclusao ? new Date(os.data_conclusao).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{relativeDate(os.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-neutral-300" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="flex flex-col gap-3 md:hidden">
            {filtered.map(os => (
              <OrdemServicoCard
                key={os.id}
                os={os}
                onClick={() => navigate(`/ordens-servico/${os.id}`)}
              />
            ))}
          </div>
        </>
      )}
    </ListPageShell>
  )
}
