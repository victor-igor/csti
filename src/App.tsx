import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'

const LoginPage        = lazy(() => import('@/pages/LoginPage'))
const RegisterPage     = lazy(() => import('@/pages/RegisterPage'))
const DashboardPage    = lazy(() => import('@/pages/DashboardPage'))
const SolicitacoesPage = lazy(() => import('@/pages/SolicitacoesPage'))
const OrcamentosPage   = lazy(() => import('@/pages/OrcamentosPage'))
const OrdensServicoPage = lazy(() => import('@/pages/OrdensServicoPage'))
const PerfilPage       = lazy(() => import('@/pages/PerfilPage'))

const Fallback = () => <LoadingSkeleton rows={4} className="m-6" />

export default function App() {
  return (
    <GlobalErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<Fallback />}>
            <Routes>
              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />

                  {/* Cliente only */}
                  <Route element={<RoleGuard allowedRoles={['cliente']} />}>
                    <Route path="solicitacoes/*" element={<SolicitacoesPage />} />
                  </Route>

                  {/* All authenticated */}
                  <Route path="orcamentos/*"    element={<OrcamentosPage />} />
                  <Route path="ordens-servico/*" element={<OrdensServicoPage />} />
                  <Route path="perfil"           element={<PerfilPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  )
}
