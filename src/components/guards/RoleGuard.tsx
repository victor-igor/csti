import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/domain'

interface RoleGuardProps {
  allowedRoles: Role[]
}

function RoleRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    toast.error('Você não tem permissão para acessar essa página.')
    navigate('/dashboard', { replace: true })
  }, [navigate])
  return null
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const profile = useAuthStore((s) => s.profile)

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!allowedRoles.includes(profile.role as Role)) {
    return <RoleRedirect />
  }

  return <Outlet />
}
