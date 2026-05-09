import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

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
