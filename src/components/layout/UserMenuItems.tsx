import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { usePerfilModal } from '@/store/perfilModalStore'
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'

export function UserMenuItems() {
  const navigate = useNavigate()
  const openPerfilModal = usePerfilModal((s) => s.open)

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <>
      <DropdownMenuItem onClick={openPerfilModal}>Meu Perfil</DropdownMenuItem>
      <DropdownMenuItem onClick={openPerfilModal}>Configurações</DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogout} className="text-danger focus:text-danger">
        Sair
      </DropdownMenuItem>
    </>
  )
}
