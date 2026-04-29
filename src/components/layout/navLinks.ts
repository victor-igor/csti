import { LayoutDashboard, ClipboardList, FileText, Wrench, User, type LucideIcon } from 'lucide-react'

export interface NavLink {
  label: string
  href: string
  icon: LucideIcon
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Dashboard',    href: '/',               icon: LayoutDashboard },
  { label: 'Solicitações', href: '/solicitacoes',   icon: ClipboardList },
  { label: 'Orçamentos',   href: '/orcamentos',     icon: FileText },
  { label: 'OS',           href: '/ordens-servico', icon: Wrench },
  { label: 'Perfil',       href: '/perfil',         icon: User },
]
