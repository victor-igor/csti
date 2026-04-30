import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { ISolicitacao, SolicitacaoStatus } from '@/types/domain'
import type { CreateSolicitacaoFormData } from './solicitacaoSchemas'

export function useCreateSolicitacao() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (data: CreateSolicitacaoFormData) => {
      if (!user) throw new Error('Usuário não autenticado')
      const { error } = await supabase.from('solicitacoes_orcamento').insert({
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        cliente_id: user.id,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['solicitacoes'] })
      navigate('/solicitacoes')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar solicitação')
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
      const { data, error } = await supabase
        .from('solicitacoes_orcamento')
        .select('*')
        .is('deleted_at', null)
        .eq('id', id)
        .single()
      if (error) throw error
      return data as ISolicitacao
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
        .select('*')
        .eq('status', 'aguardando_orcamento')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as ISolicitacao[]
    },
  })
}
