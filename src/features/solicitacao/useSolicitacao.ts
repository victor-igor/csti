import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
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
