import { LayoutDashboard, ClipboardList, FileText, Wrench, type LucideIcon } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/domain'

export interface NavLink {
  label: string
  href: string
  icon: LucideIcon
  badge?: number
}

export interface NavGroup {
  label: string | null
  items: NavLink[]
}

function useSolicitacoesBadge() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role as Role | undefined

  return useQuery({
    queryKey: ['badge', 'solicitacoes', role, profile?.id],
    queryFn: async () => {
      if (role === 'cliente') return 0
      const { count, error } = await supabase
        .from('solicitacoes_orcamento')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'aberta')
      if (error) throw error
      return count ?? 0
    },
    enabled: !!profile?.id,
  })
}

function useOrcamentosBadge() {
  const profile = useAuthStore((s) => s.profile)
  const role = profile?.role as Role | undefined

  return useQuery({
    queryKey: ['badge', 'orcamentos', role, profile?.id],
    queryFn: async () => {
      if (role === 'prestador') return 0
      const { count, error } = await supabase
        .from('orcamentos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'enviado')
      if (error) throw error
      return count ?? 0
    },
    enabled: !!profile?.id,
  })
}

export function useNavLinks(): NavLink[] {
  const groups = useNavGroups()
  return groups.flatMap((g) => g.items)
}

export function useNavGroups(): NavGroup[] {
  const { data: solBadge = 0 } = useSolicitacoesBadge()
  const { data: orcBadge = 0 } = useOrcamentosBadge()

  return [
    {
      label: null,
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Gestão',
      items: [
        { label: 'Solicitações', href: '/solicitacoes', icon: ClipboardList, badge: solBadge || undefined },
        { label: 'Orçamentos', href: '/orcamentos', icon: FileText, badge: orcBadge || undefined },
        { label: 'OS', href: '/ordens-servico', icon: Wrench },
      ],
    },
  ]
}
