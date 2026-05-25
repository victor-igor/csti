import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { parseApiError } from '@/lib/errorUtils'
import type { ISolicitacao, SolicitacaoStatus } from '@/types/domain'
import type { CreateSolicitacaoFormData } from './solicitacaoSchemas'

export function useCreateSolicitacao() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (data: CreateSolicitacaoFormData) => {
      if (!user) throw new Error('Usuário não autenticado')
      // urgencia e prazo_desejado existem na DB mas ainda não foram regenerados nos tipos gerados pelo Supabase
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase.from('solicitacoes_orcamento') as any).insert({
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        equipamento: data.equipamento || null,
        urgencia: data.urgencia,
        prazo_desejado: data.prazo_desejado || null,
        cliente_id: user.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      toast.success('Solicitação enviada com sucesso!')
      navigate('/solicitacoes')
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao criar solicitação')
    },
  })
}

export function useListSolicitacoes(filters?: { status?: SolicitacaoStatus }) {
  return useQuery({
    queryKey: ['solicitacoes', filters],
    queryFn: async () => {
      let query = supabase
        .from('solicitacoes_orcamento')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      const { data, error } = await query
      if (error) throw error
      return data as ISolicitacao[]
    },
  })
}

export function useGetSolicitacao(id: string) {
  return useQuery({
    queryKey: ['solicitacoes', id],
    queryFn: async () => {
      const [{ data: solicitacao, error }, { data: historico, error: historicoError }] =
        await Promise.all([
          supabase
            .from('solicitacoes_orcamento')
            .select('*')
            .is('deleted_at', null)
            .eq('id', id)
            .maybeSingle(),
          supabase
            .from('status_historico')
            .select('status_novo, created_at, observacao')
            .eq('registro_id', id)
            .eq('tabela_nome', 'solicitacoes_orcamento')
            .order('created_at', { ascending: true }),
        ])
      if (error) throw error
      if (!solicitacao) throw new Error('Solicitação não encontrada ou acesso negado')
      if (historicoError) throw historicoError
      return {
        ...solicitacao,
        status_historico: historico ?? [],
      } as ISolicitacao & {
        status_historico: Array<{
          status_novo: string
          created_at: string
          observacao: string | null
        }>
      }
    },
    enabled: !!id,
  })
}

export function useListSolicitacoesParaPrestador() {
  return useQuery({
    queryKey: ['solicitacoes', 'prestador', 'pendentes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('solicitacoes_orcamento')
        .select('*, profiles!cliente_id(nome)')
        .eq('status', 'aguardando_orcamento')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []).map((row) => {
        const { profiles, ...rest } = row as typeof row & { profiles: { nome: string } | null }
        return { ...rest, cliente_nome: profiles?.nome ?? null } as ISolicitacao
      })
    },
  })
}

export function useCancelSolicitacao() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (solicitacaoId: string) => {
      const { error } = await supabase
        .from('solicitacoes_orcamento')
        .update({ status: 'cancelado' })
        .eq('id', solicitacaoId)
      if (error) throw error
    },
    onSuccess: (_data, solicitacaoId) => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['solicitacoes', solicitacaoId] })
      toast.success('Solicitação cancelada')
      navigate('/solicitacoes')
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao cancelar solicitação')
    },
  })
}

export function useListMensagensSolicitacao(solicitacaoId: string) {
  return useQuery({
    queryKey: ['solicitacao-mensagens', solicitacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mensagens_solicitacao')
        .select('*, profiles!usuario_id(nome, role)')
        .eq('solicitacao_id', solicitacaoId)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as any[]
    },
    enabled: !!solicitacaoId,
  })
}

export function useEnviarMensagemSolicitacao() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async ({
      solicitacaoId,
      mensagem,
    }: {
      solicitacaoId: string
      mensagem: string
    }) => {
      if (!user) throw new Error('Usuário não autenticado')
      const { error } = await supabase
        .from('mensagens_solicitacao')
        .insert({
          solicitacao_id: solicitacaoId,
          usuario_id: user.id,
          mensagem: mensagem.trim(),
        })
      if (error) throw error
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ['solicitacao-mensagens', vars.solicitacaoId] })
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao enviar mensagem')
    },
  })
}
