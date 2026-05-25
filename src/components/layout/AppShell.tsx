import { Outlet } from 'react-router-dom'
import { Clock, ShieldAlert, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { PerfilModal } from '@/features/perfil/PerfilModal'
import { useSidebar } from '@/hooks/useSidebar'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

export function AppShell() {
  const isExpanded = useSidebar((s) => s.isExpanded)
  const profile = useAuthStore((s) => s.profile)

  // 1. Caso a conta esteja pendente de aprovação
  if (profile && profile.status_aprovacao === 'pendente') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full text-center bg-white border border-border rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amber-500 animate-pulse">
              <Clock className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">Sua conta está em análise</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Olá, <span className="font-semibold text-foreground">{profile.nome}</span>! Um administrador precisa analisar e aprovar o seu perfil antes de você ter acesso completo ao OrçaFácil. Isso costuma levar alguns minutos.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 2. Caso a conta tenha sido recusada
  if (profile && profile.status_aprovacao === 'recusado') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4 py-12 animate-fade-in">
        <div className="max-w-md w-full text-center bg-white border border-border rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-danger">
              <ShieldAlert className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-neutral-900">Acesso Recusado</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lamentamos, mas seu cadastro no OrçaFácil foi recusado por um administrador. Caso acredite que isso seja um engano, entre em contato com nossa equipe de suporte.
            </p>
          </div>
          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => supabase.auth.signOut()}
            >
              <LogOut className="h-4 w-4" />
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Sidebar />
      <TopBar />

      <main
        className={cn(
          'pt-20 md:pt-16 pb-20 md:pb-6 min-h-screen transition-all duration-200',
          isExpanded ? 'md:ml-[256px]' : 'md:ml-[72px]',
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />
      <PerfilModal />
    </div>
  )
}
