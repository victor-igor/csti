import { Bell, Check, FileText, ClipboardList, Wrench, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/molecules/PageHeader'
import { EmptyState } from '@/components/atoms/EmptyState'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { ErrorState } from '@/components/atoms/ErrorState'
import { Button } from '@/components/ui/button'
import { relativeDate } from '@/lib/dateUtils'
import { useNotificacoes, useMarkAllAsRead } from '@/features/notificacoes/useNotificacoes'
import type { INotificacao } from '@/types/domain'

const ICON_BY_TIPO: Record<string, React.ElementType> = {
  orcamento: FileText,
  solicitacao: ClipboardList,
  os: Wrench,
  alerta: AlertCircle,
}

function NotificacaoRow({ n }: { n: INotificacao }) {
  const Icon = ICON_BY_TIPO[(n.tipo as string) ?? ''] ?? Bell
  return (
    <li
      className={`flex items-start gap-3 rounded-md border border-border p-3 ${
        n.lida ? 'bg-card' : 'bg-primary/5'
      }`}
    >
      <div className="mt-0.5 shrink-0">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-medium text-foreground">{n.titulo}</p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {relativeDate(n.created_at)}
          </span>
        </div>
        {n.mensagem && (
          <p className="mt-0.5 text-sm text-muted-foreground">{n.mensagem}</p>
        )}
      </div>
      {!n.lida && (
        <span
          className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"
          aria-label="Não lida"
        />
      )}
    </li>
  )
}

export default function NotificacoesPage() {
  const { data, isLoading, isError, refetch } = useNotificacoes()
  const { mutate: markAll, isPending: marking } = useMarkAllAsRead()

  const naoLidas = (data ?? []).filter((n) => !n.lida).length

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Notificações" />
        <LoadingSkeleton rows={4} />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 space-y-6">
        <PageHeader title="Notificações" />
        <ErrorState message="Não foi possível carregar as notificações. Verifique sua conexão e tente novamente." onRetry={refetch} />
      </div>
    )
  }

  const lista = data ?? []

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Notificações"
        actions={
          naoLidas > 0 ? (
            <Button
              variant="outline"
              size="sm"
              disabled={marking}
              onClick={() =>
                markAll(undefined, {
                  onSuccess: () => toast.success('Todas marcadas como lidas'),
                  onError: () => toast.error('Erro ao marcar como lidas'),
                })
              }
            >
              <Check className="size-4" />
              Marcar todas como lidas
            </Button>
          ) : null
        }
      />

      {lista.length === 0 ? (
        <EmptyState title="Nenhuma notificação por enquanto" />
      ) : (
        <ul className="space-y-2">
          {lista.map((n) => (
            <NotificacaoRow key={n.id} n={n} />
          ))}
        </ul>
      )}
    </div>
  )
}
