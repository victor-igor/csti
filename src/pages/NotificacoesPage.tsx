import { PageHeader } from '@/components/molecules/PageHeader'
import { EmptyState } from '@/components/atoms/EmptyState'

export default function NotificacoesPage() {
  return (
    <div className="p-6 space-y-6">
      <PageHeader title="Notificações" />
      <EmptyState title="Nenhuma notificação por enquanto" />
    </div>
  )
}
