import { Bell, Check, FileText, ClipboardList, Wrench, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { relativeDate } from '@/lib/dateUtils'
import { useNotificacoes, useMarkAllAsRead } from './useNotificacoes'
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
        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Não lida" />
      )}
    </li>
  )
}

interface NotificacoesDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NotificacoesDrawer({ open, onOpenChange }: NotificacoesDrawerProps) {
  const { data, isLoading } = useNotificacoes()
  const { mutate: markAll, isPending: marking } = useMarkAllAsRead()

  const lista = data ?? []
  const naoLidas = lista.filter((n) => !n.lida).length

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="flex flex-row items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <SheetTitle className="text-base">Notificações</SheetTitle>
          {naoLidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              disabled={marking}
              className="h-8 text-xs"
              onClick={() =>
                markAll(undefined, {
                  onSuccess: () => toast.success('Todas marcadas como lidas'),
                  onError: () => toast.error('Erro ao marcar como lidas'),
                })
              }
            >
              <Check className="size-3.5" />
              Marcar todas
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-4">
          {isLoading ? (
            <LoadingSkeleton rows={4} />
          ) : lista.length === 0 ? (
            <EmptyState title="Nenhuma notificação por enquanto" />
          ) : (
            <ul className="space-y-2">
              {lista.map((n) => (
                <NotificacaoRow key={n.id} n={n} />
              ))}
            </ul>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
