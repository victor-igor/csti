import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, ChevronLeft, Send, Loader2 } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { useListMensagensSolicitacao, useEnviarMensagemSolicitacao } from '@/features/solicitacao/useSolicitacao'

interface ChatConversa {
  id: string
  numero: string
  titulo: string
  status: string
  ultima_mensagem?: string
  updated_at: string
}

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeSolicitacao, setActiveSolicitacao] = useState<ChatConversa | null>(null)
  const [mensagemText, setMensagemText] = useState('')
  
  const profile = useAuthStore((s) => s.profile)
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 1. Buscar a lista de conversas (solicitações ativas do usuário)
  const { data: conversas = [], isLoading: loadingConversas } = useQuery<ChatConversa[]>({
    queryKey: ['chat-conversas', profile?.id, profile?.role],
    queryFn: async () => {
      if (!profile) return []

      let query = supabase
        .from('solicitacoes_orcamento')
        .select('id, numero, titulo, status, updated_at')
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })

      // Se for cliente, lista apenas as solicitações dele
      if (profile.role === 'cliente') {
        query = query.eq('cliente_id', profile.id)
      } 
      // Se for prestador, lista solicitações abertas ou as que ele já enviou orçamento
      else if (profile.role === 'prestador') {
        // Obter ids de solicitações que o prestador interagiu ou orçou
        const { data: orcamentos } = await supabase
          .from('orcamentos')
          .select('solicitacao_id')
          .eq('prestador_id', profile.id)
          .is('deleted_at', null)
        
        const solicitacaoIds = (orcamentos ?? []).map((o) => o.solicitacao_id)
        
        if (solicitacaoIds.length > 0) {
          query = query.or(`status.eq.aguardando_orcamento,status.eq.aberta,id.in.(${solicitacaoIds.join(',')})`)
        } else {
          query = query.in('status', ['aberta', 'aguardando_orcamento'])
        }
      }

      const { data, error } = await query
      if (error) throw error
      return data as ChatConversa[]
    },
    enabled: !!profile?.id && isOpen,
  })

  // 2. Buscar mensagens se houver uma solicitação selecionada
  const { data: mensagens = [], isLoading: loadingMensagens } = useListMensagensSolicitacao(activeSolicitacao?.id ?? '')
  const { mutate: enviarMensagem, isPending: enviando } = useEnviarMensagemSolicitacao()

  // Rolar para a última mensagem
  useEffect(() => {
    if (isOpen && activeSolicitacao) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [mensagens, activeSolicitacao, isOpen])

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault()
    if (!mensagemText.trim() || !activeSolicitacao) return

    enviarMensagem(
      { solicitacaoId: activeSolicitacao.id, mensagem: mensagemText },
      {
        onSuccess: () => {
          setMensagemText('')
          // Atualiza as listagens locais
          queryClient.invalidateQueries({ queryKey: ['chat-conversas'] })
        },
      }
    )
  }

  if (!profile) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-[500] font-sans">
      {/* Balão flutuante principal */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
          aria-label="Abrir central de mensagens"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}

      {/* Janela expandida do chat */}
      {isOpen && (
        <div className="w-[360px] h-[500px] bg-white rounded-2xl border border-neutral-200 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
            {activeSolicitacao ? (
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={() => setActiveSolicitacao(null)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                  aria-label="Voltar para a lista"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <p className="text-xs font-mono opacity-80 truncate">{activeSolicitacao.numero}</p>
                  <p className="text-sm font-semibold truncate leading-tight">{activeSolicitacao.titulo}</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-sm font-bold">Mensagens</h3>
                <p className="text-[10px] opacity-80">Tire dúvidas e negocie orçamentos</p>
              </div>
            )}

            <button
              onClick={() => {
                setIsOpen(false)
                setActiveSolicitacao(null)
              }}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Fechar mensagens"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Corpo do Widget */}
          <div className="flex-1 flex flex-col min-h-0 bg-neutral-25/20">
            {activeSolicitacao ? (
              /* MODO JANELA DE CHAT */
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {mensagens.length === 0 && !loadingMensagens && (
                    <p className="text-xs text-center text-neutral-400 py-8">
                      Inicie a conversa enviando uma mensagem no campo abaixo!
                    </p>
                  )}
                  {mensagens.map((msg) => {
                    const isMe = msg.usuario_id === user?.id
                    const senderName = msg.profiles?.nome || 'Usuário'
                    const senderRole = msg.profiles?.role === 'prestador' ? 'Prestador' : 'Cliente'
                    const dateStr = new Date(msg.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col max-w-[85%] space-y-0.5 ${
                          isMe ? 'ml-auto items-end' : 'mr-auto items-start'
                        }`}
                      >
                        <span className="text-[9px] text-neutral-400 px-1">
                          {senderName} ({senderRole}) • {dateStr}
                        </span>
                        <div
                          className={`rounded-2xl px-3 py-1.5 text-xs leading-relaxed shadow-sm break-all ${
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

                {/* Form de envio */}
                <form onSubmit={handleSend} className="p-2 border-t border-neutral-100 bg-white flex gap-1.5">
                  <input
                    type="text"
                    value={mensagemText}
                    onChange={(e) => setMensagemText(e.target.value)}
                    placeholder="Escreva sua mensagem..."
                    disabled={enviando}
                    className="flex-1 min-w-0 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                  <Button
                    type="submit"
                    disabled={enviando || !mensagemText.trim()}
                    size="icon-xs"
                    className="shrink-0 h-[30px] w-[30px]"
                  >
                    {enviando ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Send className="h-3 w-3" />
                    )}
                  </Button>
                </form>
              </>
            ) : (
              /* MODO LISTA DE CONVERSAS */
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {loadingConversas && (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                  </div>
                )}

                {!loadingConversas && conversas.length === 0 && (
                  <p className="text-xs text-center text-neutral-400 py-10 px-4">
                    Nenhuma solicitação ativa ou com mensagens iniciadas no momento.
                  </p>
                )}

                {conversas.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setActiveSolicitacao(conv)}
                    className="w-full text-left p-3 rounded-xl border border-neutral-100 bg-white shadow-sm hover:border-primary/50 transition-all flex flex-col gap-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-neutral-400">{conv.numero}</span>
                      <span className="text-[9px] uppercase font-bold tracking-wider text-neutral-400 bg-neutral-100 rounded px-1">{conv.status.replace('_', ' ')}</span>
                    </div>
                    <span className="text-xs font-semibold text-neutral-800 truncate">{conv.titulo}</span>
                    <span className="text-[10px] text-neutral-400 truncate mt-1">Clique para abrir a conversa</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
