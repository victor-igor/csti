import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { useListMensagensSolicitacao, useEnviarMensagemSolicitacao } from '@/features/solicitacao/useSolicitacao'

interface TimelineMensagensProps {
  solicitacaoId: string
}

export function TimelineMensagens({ solicitacaoId }: TimelineMensagensProps) {
  const [mensagem, setMensagem] = useState('')
  const currentUser = useAuthStore((s) => s.user)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { data: mensagens = [], isLoading } = useListMensagensSolicitacao(solicitacaoId)
  const { mutate: enviar, isPending } = useEnviarMensagemSolicitacao()

  // Rola o chat para o fim sempre que chegam mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens])

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!mensagem.trim()) return

    enviar(
      { solicitacaoId, mensagem },
      {
        onSuccess: () => {
          setMensagem('')
        },
      }
    )
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white shadow-card flex flex-col h-[400px]">
      <div className="border-b border-neutral-100 px-4 py-3 bg-neutral-50/50 rounded-t-xl flex justify-between items-center">
        <h3 className="text-sm font-semibold text-neutral-800">Mensagens & Negociação</h3>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
      </div>

      {/* Listagem */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-neutral-25/30">
        {mensagens.length === 0 && !isLoading && (
          <p className="text-xs text-center text-neutral-400 py-8">
            Nenhuma mensagem enviada. Comece a conversa abaixo para alinhar detalhes ou negociar!
          </p>
        )}

        {mensagens.map((msg) => {
          const isMe = msg.usuario_id === currentUser?.id
          const senderName = msg.profiles?.nome || 'Usuário'
          const senderRole =
            msg.profiles?.role === 'super_admin'
              ? 'Super Admin'
              : msg.profiles?.role === 'prestador'
              ? 'Prestador'
              : msg.profiles?.role === 'admin'
              ? 'Admin'
              : 'Cliente'
          const dateStr = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

          return (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] space-y-1 ${
                isMe ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <span className="text-[10px] text-neutral-400 px-1 font-medium">
                {senderName} ({senderRole}) • {dateStr}
              </span>
              <div
                className={`rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm break-all ${
                  isMe
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white border border-neutral-200 text-neutral-800 rounded-tl-none'
                }`}
              >
                {msg.mensagem}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Caixa de Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-neutral-100 bg-white rounded-b-xl flex gap-2">
        <input
          type="text"
          value={mensagem}
          onChange={(e) => setMensagem(e.target.value)}
          placeholder="Tire dúvidas ou faça uma proposta..."
          disabled={isPending}
          className="flex-1 min-w-0 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={isPending || !mensagem.trim()}
          size="icon-sm"
          className="shrink-0"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  )
}
