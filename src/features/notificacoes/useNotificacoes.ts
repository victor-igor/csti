import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { INotificacao } from '@/types/domain'

export function useNotificacoesNaoLidas() {
  const profileId = useAuthStore((s) => s.profile?.id)

  return useQuery({
    queryKey: ['notificacoes', 'nao-lidas', profileId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notificacoes')
        .select('*', { count: 'exact', head: true })
        .eq('usuario_id', profileId!)
        .eq('lida', false)
      if (error) throw error
      return count ?? 0
    },
    enabled: !!profileId,
  })
}

export function useNotificacoes() {
  const profileId = useAuthStore((s) => s.profile?.id)

  return useQuery({
    queryKey: ['notificacoes', 'lista', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', profileId!)
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return (data ?? []) as INotificacao[]
    },
    enabled: !!profileId,
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  const profileId = useAuthStore((s) => s.profile?.id)

  return useMutation({
    mutationFn: async () => {
      if (!profileId) throw new Error('Usuário não autenticado')
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', profileId)
        .eq('lida', false)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notificacoes', 'nao-lidas', profileId] })
      queryClient.invalidateQueries({ queryKey: ['notificacoes', 'lista', profileId] })
    },
  })
}
