import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { parseApiError } from '@/lib/errorUtils'
import type { IOrcamento, IItemOrcamento } from '@/types/domain'
import type { CreateOrcamentoFormData } from './orcamentoSchemas'

export type IOrcamentoComItens = IOrcamento & { itens_orcamento: IItemOrcamento[] }
export type IOrcamentoComTotal = IOrcamento & {
  itens_orcamento: Pick<IItemOrcamento, 'valor_unitario' | 'quantidade'>[]
}

export function useAprovarOrcamento() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (orcamentoId: string) => {
      const { data, error } = await supabase.rpc('aprovar_orcamento', {
        p_orcamento_id: orcamentoId,
      })
      if (error) throw error
      return data as string
    },
    onSuccess: (osId: string) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['ordens-servico'] })
      toast.success('Orçamento aprovado! OS criada.')
      navigate(`/ordens-servico/${osId}`)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao aprovar orçamento')
    },
  })
}

export function useRecusarOrcamento() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      orcamentoId,
      solicitacaoId: _solicitacaoId,
      motivo,
    }: {
      orcamentoId: string
      solicitacaoId: string
      motivo?: string
    }) => {
      // RPC atômica: marca orçamento como recusado + reverte solicitação
      const { data: solId, error } = await supabase.rpc('recusar_orcamento', {
        p_orcamento_id: orcamentoId,
        p_motivo: motivo ?? null,
      })
      if (error) throw error
      return (solId ?? _solicitacaoId) as string
    },
    onSuccess: (solicitacaoId: string) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Orçamento recusado.')
      navigate(`/solicitacoes/${solicitacaoId}`)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao recusar orçamento')
    },
  })
}

export function useCreateOrcamento() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (data: CreateOrcamentoFormData) => {
      if (!user) throw new Error('Usuário não autenticado')

      const { data: orcamento, error: orcErr } = await supabase
        .from('orcamentos')
        .insert({
          solicitacao_id: data.solicitacao_id,
          prestador_id: user.id,
          prazo_estimado_dias: data.prazo_dias,
          observacoes: data.observacoes ?? null,
          status: 'rascunho',
        })
        .select('id')
        .single()
      if (orcErr) throw orcErr

      const itens = data.itens.map((item) => ({
        orcamento_id: orcamento.id,
        descricao: item.descricao,
        quantidade: item.quantidade,
        valor_unitario: item.valor_unitario,
        tipo: item.tipo,
      }))
      const { error: itensErr } = await supabase.from('itens_orcamento').insert(itens)
      if (itensErr) throw itensErr

      return orcamento.id
    },
    onSuccess: (id: string) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      toast.success('Rascunho salvo')
      navigate(`/prestador/orcamentos/${id}`)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao criar orçamento')
    },
  })
}

export function useUpdateOrcamento(orcamentoId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (data: CreateOrcamentoFormData) => {
      // Atualiza campos do orçamento
      const { error: errOrc } = await supabase
        .from('orcamentos')
        .update({
          prazo_estimado_dias: data.prazo_dias ?? null,
          observacoes: data.observacoes ?? null,
        })
        .eq('id', orcamentoId)
      if (errOrc) throw errOrc

      // Substitui itens: delete antigos + insert novos
      const { error: errDel } = await supabase
        .from('itens_orcamento')
        .delete()
        .eq('orcamento_id', orcamentoId)
      if (errDel) throw errDel

      const itens = data.itens.map((i) => ({
        orcamento_id: orcamentoId,
        descricao: i.descricao,
        quantidade: i.quantidade,
        valor_unitario: i.valor_unitario,
        tipo: i.tipo,
      }))
      const { error: errIns } = await supabase
        .from('itens_orcamento')
        .insert(itens)
      if (errIns) throw errIns
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['orcamentos', orcamentoId] })
      toast.success('Rascunho atualizado')
      navigate(`/prestador/orcamentos/${orcamentoId}`)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao atualizar rascunho')
    },
  })
}

export function useDeleteOrcamento() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async ({
      orcamentoId,
      solicitacaoId: _solicitacaoId,
    }: {
      orcamentoId: string
      solicitacaoId: string
    }) => {
      // RPC atômica: soft delete + reverte solicitação se necessário
      const { error } = await supabase.rpc('deletar_orcamento_prestador', {
        p_orcamento_id: orcamentoId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Orçamento excluído.')
      navigate('/prestador/orcamentos')
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao excluir orçamento')
    },
  })
}

export function useEnviarOrcamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orcamentoId,
      solicitacaoId: _solicitacaoId,
    }: {
      orcamentoId: string
      solicitacaoId: string
    }) => {
      // RPC atômica: atualiza orcamento + solicitacao em uma transação segura
      const { error } = await supabase.rpc('enviar_orcamento', {
        p_orcamento_id: orcamentoId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Orçamento enviado ao cliente')
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao enviar orçamento')
    },
  })
}

export function useGetOrcamento(id: string) {
  return useQuery({
    queryKey: ['orcamentos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, itens_orcamento(*), ordens_servico(id, numero)')
        .is('deleted_at', null)
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!data) throw new Error('Orçamento não encontrado ou acesso negado')
      return data as IOrcamentoComItens
    },
    enabled: !!id,
  })
}

export function useListOrcamentosPrestador() {
  return useQuery({
    queryKey: ['orcamentos', 'prestador'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, itens_orcamento(valor_unitario, quantidade)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as IOrcamentoComTotal[]
    },
  })
}

export function useListOrcamentosCliente() {
  return useQuery({
    queryKey: ['orcamentos', 'cliente'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, solicitacoes_orcamento(numero, titulo), itens_orcamento(valor_unitario, quantidade)')
        .is('deleted_at', null)
        .in('status', ['enviado', 'aceito', 'recusado'])
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as (IOrcamentoComTotal & { solicitacoes_orcamento: { numero: string; titulo: string } | null })[]
    },
  })
}
