import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { IOrcamento, IItemOrcamento } from '@/types/domain'
import type { CreateOrcamentoFormData } from './orcamentoSchemas'

export type IOrcamentoComItens = IOrcamento & { itens_orcamento: IItemOrcamento[] }

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
      }))
      const { error: itensErr } = await supabase.from('itens_orcamento').insert(itens)
      if (itensErr) throw itensErr

      return orcamento.id
    },
    onSuccess: (id: string) => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      navigate(`/prestador/orcamentos/${id}`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar orçamento')
    },
  })
}

export function useEnviarOrcamento() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orcamentoId,
      solicitacaoId,
    }: {
      orcamentoId: string
      solicitacaoId: string
    }) => {
      const { error: orcErr } = await supabase
        .from('orcamentos')
        .update({ status: 'enviado' })
        .eq('id', orcamentoId)
      if (orcErr) throw orcErr

      const { error: solErr } = await supabase
        .from('solicitacoes_orcamento')
        .update({ status: 'orcamento_enviado' })
        .eq('id', solicitacaoId)
      if (solErr) throw solErr
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orcamentos'] })
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      toast.success('Orçamento enviado ao cliente')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao enviar orçamento')
    },
  })
}

export function useGetOrcamento(id: string) {
  return useQuery({
    queryKey: ['orcamentos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, itens_orcamento(*)')
        .is('deleted_at', null)
        .eq('id', id)
        .single()
      if (error) throw error
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
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as IOrcamento[]
    },
  })
}
