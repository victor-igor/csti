import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { IOrdemServico, OSStatus } from '@/types/domain'

interface StatusHistoricoEntry {
  status_novo: string
  created_at: string
  alterado_por?: string | null
}

export interface IOrdemServicoDetalhada extends IOrdemServico {
  historico: StatusHistoricoEntry[]
}

const TRANSICOES: Partial<Record<OSStatus, OSStatus>> = {
  aberta: 'em_andamento',
  em_andamento: 'concluida',
}

export function getProximoStatus(status: OSStatus): OSStatus | null {
  return TRANSICOES[status] ?? null
}

export function useListOrdensServico(filters?: { status?: OSStatus }) {
  return useQuery({
    queryKey: ['ordens-servico', filters],
    queryFn: async () => {
      let query = supabase
        .from('ordens_servico')
        .select('*')
        .order('created_at', { ascending: false })
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      const { data, error } = await query
      if (error) throw error
      return data as IOrdemServico[]
    },
  })
}

export function useGetOrdemServico(id: string) {
  return useQuery({
    queryKey: ['ordens-servico', id],
    queryFn: async () => {
      const [osResult, historicoResult] = await Promise.all([
        supabase
          .from('ordens_servico')
          .select('*')
          .eq('id', id)
          .single(),
        supabase
          .from('status_historico')
          .select('status_novo, created_at, usuario_id')
          .eq('tabela_nome', 'ordens_servico')
          .eq('registro_id', id)
          .order('created_at', { ascending: true }),
      ])
      if (osResult.error) throw osResult.error
      return {
        ...osResult.data,
        historico: (historicoResult.data ?? []) as StatusHistoricoEntry[],
      } as IOrdemServicoDetalhada
    },
    enabled: !!id,
  })
}

export function useUpdateStatusOS() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OSStatus }) => {
      const today = new Date().toISOString().split('T')[0]
      const { error } = await supabase
        .from('ordens_servico')
        .update(status === 'concluida' ? { status, data_conclusao: today } : { status })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ordens-servico'] })
      toast.success('Status atualizado com sucesso')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar status')
    },
  })
}
