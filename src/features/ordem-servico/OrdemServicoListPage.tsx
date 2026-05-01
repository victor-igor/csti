import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/molecules/PageHeader'
import { DataTable } from '@/components/organisms/DataTable'
import { OrdemServicoCard } from '@/components/organisms/OrdemServicoCard'
import { StatusBadge } from '@/components/atoms/StatusBadge'
import type { IOrdemServico, OSStatus } from '@/types/domain'
import { useListOrdensServico } from './useOrdemServico'

const STATUS_OPTIONS: { value: OSStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'aberta', label: 'Aberta' },
  { value: 'em_andamento', label: 'Em Andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('pt-BR')
}

export default function OrdemServicoListPage() {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState<OSStatus | ''>('')
  const { data = [], isLoading } = useListOrdensServico(
    statusFilter ? { status: statusFilter } : undefined,
  )

  const columns = [
    { key: 'numero', label: 'Número' },
    {
      key: 'status',
      label: 'Status',
      render: (row: IOrdemServico) => <StatusBadge status={row.status} />,
    },
    {
      key: 'data_inicio',
      label: 'Início',
      render: (row: IOrdemServico) => formatDate(row.data_inicio),
    },
    {
      key: 'data_conclusao',
      label: 'Conclusão',
      render: (row: IOrdemServico) => formatDate(row.data_conclusao),
    },
  ]

  return (
    <div className="p-6">
      <PageHeader title="Ordens de Serviço" />

      {/* Status filter tabs */}
      <div className="mt-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value as OSStatus | '')}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === opt.value
                ? 'bg-primary text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div
        className="mt-6 [&_tr]:cursor-pointer"
        onClick={(e) => {
          const tr = (e.target as HTMLElement).closest('tr[data-index]')
          if (tr) {
            const index = Number(tr.getAttribute('data-index'))
            navigate(`/ordens-servico/${data[index]?.id}`)
          }
        }}
      >
        <DataTable
          columns={columns}
          data={data}
          isLoading={isLoading}
          emptyMessage="Nenhuma ordem de serviço encontrada."
        >
          {(os) => (
            <div
              onClick={() => navigate(`/ordens-servico/${os.id}`)}
              className="cursor-pointer"
            >
              <OrdemServicoCard os={os} />
            </div>
          )}
        </DataTable>
      </div>
    </div>
  )
}
