import { Link } from 'react-router-dom'
import { ClipboardList, Wrench } from 'lucide-react'

interface DashboardEmptyStateProps {
  role: 'cliente' | 'prestador'
}

export function DashboardEmptyState({ role }: DashboardEmptyStateProps) {
  if (role === 'cliente') {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-12 px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
          <ClipboardList className="h-7 w-7 text-blue-500" />
        </div>
        <h3 className="font-semibold text-neutral-800">Bem-vindo ao OrçaFácil!</h3>
        <p className="mt-1 text-sm text-neutral-500 max-w-xs">
          Crie sua primeira solicitação de orçamento de TI e receba propostas de prestadores.
        </p>
        <Link
          to="/solicitacoes/nova"
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
        >
          Nova Solicitação
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-12 px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
        <Wrench className="h-7 w-7 text-green-500" />
      </div>
      <h3 className="font-semibold text-neutral-800">Sua área de trabalho está pronta!</h3>
      <p className="mt-1 text-sm text-neutral-500 max-w-xs">
        Confira as solicitações abertas e comece a enviar orçamentos para clientes.
      </p>
      <Link
        to="/solicitacoes"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
      >
        Ver Solicitações
      </Link>
    </div>
  )
}
