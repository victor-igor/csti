import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { IProfile } from '@/types/domain'

export function useGetPerfil(userId: string) {
  return useQuery({
    queryKey: ['perfil', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) throw error
      return data as IProfile
    },
    enabled: !!userId,
  })
}

type UpdatePerfilData = Pick<IProfile, 'nome' | 'telefone' | 'especialidade'>

export function useUpdatePerfil(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (dados: UpdatePerfilData) => {
      const { error } = await supabase
        .from('profiles')
        .update(dados)
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['perfil'] })
    },
  })
}
