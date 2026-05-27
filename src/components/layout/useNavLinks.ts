import { LayoutDashboard, ClipboardList, FileText, Wrench, Users, type LucideIcon } from 'lucide-react'
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
      if (role === 'cliente' || role === 'admin' || role === 'super_admin') return 0
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
      if (role === 'prestador' || role === 'admin' || role === 'super_admin') return 0
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
  const role = useAuthStore((s) => s.profile?.role) as Role | undefined

  const solicitacoesHref = role === 'prestador' ? '/prestador/solicitacoes' : '/solicitacoes'

  const orcamentosItem: NavLink = role === 'prestador'
    ? { label: 'Meus Orçamentos', href: '/prestador/orcamentos', icon: FileText }
    : { label: 'Orçamentos', href: '/orcamentos', icon: FileText, badge: orcBadge || undefined }

  const gestaoItems: NavLink[] = [
    { label: 'Solicitações', href: solicitacoesHref, icon: ClipboardList, badge: solBadge || undefined },
    orcamentosItem,
    { label: 'OS', href: '/ordens-servico', icon: Wrench },
  ]

  if (role === 'admin' || role === 'super_admin') {
    gestaoItems.push({ label: 'Usuários', href: '/admin/usuarios', icon: Users })
  }

  return [
    {
      label: null,
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Gestão',
      items: gestaoItems,
    },
  ]
}
