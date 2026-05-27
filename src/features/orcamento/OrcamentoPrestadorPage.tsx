import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ListPageShell } from '@/components/molecules/ListPageShell'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ErrorState } from '@/components/atoms/ErrorState'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'
import { relativeDate } from '@/lib/dateUtils'
import type { OrcamentoStatus } from '@/types/domain'
import { useListOrcamentosPrestador, type IOrcamentoComTotal } from './useOrcamento'

const STATUS_FILTERS: { label: string; value: OrcamentoStatus | '' }[] = [
  { label: 'Todos',     value: '' },
  { label: 'Rascunho',  value: 'rascunho' },
  { label: 'Enviado',   value: 'enviado' },
  { label: 'Aceito',    value: 'aceito' },
  { label: 'Recusado',  value: 'recusado' },
]

function calcTotal(orc: IOrcamentoComTotal): number {
  return (orc.itens_orcamento ?? []).reduce(
    (sum, item) => sum + (item.quantidade ?? 0) * (item.valor_unitario ?? 0),
    0,
  )
}

export default function OrcamentoPrestadorPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<OrcamentoStatus | ''>('')

  const { data = [], isLoading, isError, refetch } = useListOrcamentosPrestador()

  const filtered = data.filter((orc) => {
    const matchesStatus = !activeStatus || orc.status === activeStatus
    const matchesSearch =
      !search || orc.numero.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <ListPageShell
      title="Meus Orçamentos"
      subtitle="Orçamentos enviados por você"
      search={search}
      onSearchChange={(v) => setSearch(v)}
      searchPlaceholder="Buscar por número..."
      filters={
        <StatusFilterChips
          filters={STATUS_FILTERS}
          active={activeStatus}
          onSelect={(v) => setActiveStatus(v as OrcamentoStatus | '')}
        />
      }
      resultCount={filtered.length}
      totalCount={data.length}
      columns={1}
    >
      {isLoading && <LoadingSkeleton rows={4} />}

      {isError && (
        <ErrorState
          message="Erro ao carregar orçamentos. Verifique sua conexão e tente novamente."
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState
          title="Nenhum orçamento encontrado"
          description={
            data.length === 0
              ? 'Você ainda não enviou nenhum orçamento.'
              : 'Nenhum orçamento corresponde aos filtros aplicados.'
          }
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
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Valor Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Data</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((orc) => (
                  <tr
                    key={orc.id}
                    className="bg-card hover:bg-muted/20 transition-colors cursor-pointer"
                    onClick={() => navigate(`/prestador/orcamentos/${orc.id}`)}
                  >
                    <td className="px-4 py-3 font-mono text-xs uppercase text-foreground">{orc.numero}</td>
                    <td className="px-4 py-3"><StatusBadge status={orc.status} /></td>
                    <td className="px-4 py-3 text-foreground"><CurrencyDisplay value={calcTotal(orc)} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{relativeDate(orc.created_at)}</td>
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
            {filtered.map((orc) => (
              <button
                key={orc.id}
                className="flex w-full items-center justify-between rounded-lg border border-border bg-card p-4 text-left hover:bg-muted/20 transition-colors"
                onClick={() => navigate(`/prestador/orcamentos/${orc.id}`)}
              >
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-xs uppercase text-foreground">{orc.numero}</span>
                  <StatusBadge status={orc.status} />
                  <span className="text-xs text-muted-foreground">{relativeDate(orc.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    <CurrencyDisplay value={calcTotal(orc)} />
                  </span>
                  <ChevronRight className="h-4 w-4 text-neutral-300" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </ListPageShell>
  )
}
