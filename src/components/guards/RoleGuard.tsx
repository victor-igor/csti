import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/domain'

interface RoleGuardProps {
  allowedRoles: Role[]
}

// Type guard to safely validate role values from external sources (e.g., Supabase)
function isValidRole(role: string | undefined): role is Role {
  const VALID_ROLES: readonly string[] = ['cliente', 'prestador', 'admin', 'super_admin']
  return typeof role === 'string' && VALID_ROLES.includes(role)
}

function RoleRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    toast.error('Você não tem permissão para acessar essa página.')
    navigate('/dashboard', { replace: true })
  }, [navigate])
  return null
}

function ProfileErrorFallback() {
  const clearSession = useAuthStore((s) => s.clearSession)
  const navigate = useNavigate()

  function handleLogout() {
    clearSession()
    navigate('/login', { replace: true })
  }

  function handleRetry() {
    useAuthStore.getState().retryProfileLoad()
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4 text-center px-4">
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar seu perfil. Tente novamente ou faça login novamente.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleRetry}
          className="text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground"
        >
          Tentar novamente
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          onClick={handleLogout}
          className="text-sm underline underline-offset-4 hover:text-foreground text-muted-foreground"
        >
          Sair
        </button>
      </div>
    </div>
  )
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const profile = useAuthStore((s) => s.profile)
  const profileError = useAuthStore((s) => s.profileError)

  if (profileError) {
    return <ProfileErrorFallback />
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Safely validate the role value before including it in the check
  if (!isValidRole(profile.role) || !allowedRoles.includes(profile.role)) {
    return <RoleRedirect />
  }

  return <Outlet />
}
