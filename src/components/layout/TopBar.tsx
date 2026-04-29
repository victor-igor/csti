import { Menu, LogOut } from 'lucide-react'
import { useSidebar } from '@/hooks/useSidebar'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

export function TopBar() {
  const { openDrawer } = useSidebar()
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={openDrawer}
          className="lg:hidden p-1.5 rounded-md text-neutral-600 hover:bg-neutral-100"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-primary text-base">OrçaFácil</span>
      </div>

      <button
        onClick={handleLogout}
        className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-danger transition-colors"
        aria-label="Sair"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sair</span>
      </button>
    </header>
  )
}
