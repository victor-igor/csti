import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import type { Role } from '@/types/domain'

interface RoleGuardProps {
  allowedRoles: Role[]
}

export function RoleGuard({ allowedRoles }: RoleGuardProps) {
  const profile = useAuthStore((s) => s.profile)

  if (!profile || !allowedRoles.includes(profile.role as Role)) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}
