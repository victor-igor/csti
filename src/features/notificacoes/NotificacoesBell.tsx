import { useState } from 'react'
import { Bell, FileText, ClipboardList, Wrench, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { relativeDate } from '@/lib/dateUtils'
import { useNotificacoes, useNotificacoesNaoLidas, useMarkAllAsRead } from './useNotificacoes'
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
    <li className={`flex items-start gap-3 px-4 py-3 border-b border-neutral-100 last:border-0 ${!n.lida ? 'bg-primary/[0.03]' : ''}`}>
      <div className="mt-0.5 shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100">
        <Icon className="h-3.5 w-3.5 text-neutral-500" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-neutral-800 leading-snug">{n.titulo}</p>
          {!n.lida && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
        </div>
        {n.mensagem && (
          <p className="mt-0.5 text-xs text-neutral-500 leading-relaxed">{n.mensagem}</p>
        )}
        <p className="mt-1 text-xs text-neutral-400">{relativeDate(n.created_at)}</p>
      </div>
    </li>
  )
}

type Tab = 'nao_lidas' | 'todas'

export function NotificacoesBell() {
  const [tab, setTab] = useState<Tab>('nao_lidas')
  const { data: notifCount = 0 } = useNotificacoesNaoLidas()
  const { data, isLoading } = useNotificacoes()
  const { mutate: markAll, isPending: marking } = useMarkAllAsRead()

  const todas = data ?? []
  const naoLidas = todas.filter((n) => !n.lida)
  const lista = tab === 'nao_lidas' ? naoLidas : todas

  return (
    <Popover>
      <PopoverTrigger
        className="relative p-2 rounded-lg transition-colors hover:bg-neutral-100"
        aria-label="Notificações"
      >
        <Bell className={notifCount > 0 ? 'h-5 w-5 text-neutral-700' : 'h-5 w-5 text-neutral-400'} />
        {notifCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-0.5 text-[10px] font-bold text-white">
            {notifCount > 9 ? '9+' : notifCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-16px)] sm:w-[460px] p-0 rounded-xl border border-neutral-200 shadow-floating bg-white overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <h3 className="text-sm font-semibold text-neutral-900">Notificações</h3>
          {naoLidas.length > 0 && (
            <button
              type="button"
              disabled={marking}
              onClick={() => markAll(undefined, {
                onSuccess: () => toast.success('Todas marcadas como lidas'),
                onError: () => toast.error('Erro ao marcar como lidas'),
              })}
              className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100">
          <button
            type="button"
            onClick={() => setTab('nao_lidas')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'nao_lidas'
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Não lidas {naoLidas.length > 0 && `(${naoLidas.length})`}
          </button>
          <button
            type="button"
            onClick={() => setTab('todas')}
            className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
              tab === 'todas'
                ? 'text-primary border-b-2 border-primary -mb-px'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Todas
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[360px] overflow-y-auto">
          {isLoading ? (
            <div className="p-4"><LoadingSkeleton rows={3} /></div>
          ) : lista.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <p className="text-sm font-semibold text-neutral-700">Sem novidades</p>
              <p className="mt-1 text-sm text-neutral-400">
                {tab === 'nao_lidas'
                  ? 'Não há novas notificações no momento.'
                  : 'Nenhuma notificação encontrada.'}
              </p>
            </div>
          ) : (
            <ul>
              {lista.map((n) => (
                <NotificacaoRow key={n.id} n={n} />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-4 py-2.5 flex justify-end">
          <button
            type="button"
            className="text-sm text-primary font-medium hover:underline"
          >
            Ver tudo
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
