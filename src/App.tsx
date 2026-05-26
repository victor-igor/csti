import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { Toaster } from 'sonner'
import { queryClient, persister } from '@/lib/queryClient'
import { GlobalErrorBoundary } from '@/components/GlobalErrorBoundary'
import { ProtectedRoute } from '@/components/guards/ProtectedRoute'
import { RoleGuard } from '@/components/guards/RoleGuard'
import { AppShell } from '@/components/layout/AppShell'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { OnboardingWelcome } from '@/pages/OnboardingWelcome'

const LoginPage        = lazy(() => import('@/features/auth/LoginPage'))
const RegisterPage     = lazy(() => import('@/features/auth/RegisterPage'))
const DashboardPage    = lazy(() => import('@/pages/DashboardPage'))
const SolicitacoesPage = lazy(() => import('@/pages/SolicitacoesPage'))
const OrcamentosPage   = lazy(() => import('@/pages/OrcamentosPage'))
const PerfilPage       = lazy(() => import('@/pages/PerfilPage'))
const SolicitacaoFormDialog = lazy(() => import('@/features/solicitacao/SolicitacaoFormDialog'))
const SolicitacaoDetailDialog = lazy(() => import('@/features/solicitacao/SolicitacaoDetailDialog'))
const OrcamentoFormPage = lazy(() => import('@/features/orcamento/OrcamentoFormPage'))
const OrcamentoDetailPage = lazy(() => import('@/features/orcamento/OrcamentoDetailPage'))
const OrcamentoReviewPage = lazy(() => import('@/features/orcamento/OrcamentoReviewPage'))
const OrdemServicoListPage = lazy(() => import('@/features/ordem-servico/OrdemServicoListPage'))
const OrdemServicoDetailPage = lazy(() => import('@/features/ordem-servico/OrdemServicoDetailPage'))
const SolicitacaoListPrestadorPage = lazy(() => import('@/features/solicitacao/SolicitacaoListPrestadorPage'))
const NotificacoesPage = lazy(() => import('@/pages/NotificacoesPage'))
const AdminUsuariosPage = lazy(() => import('@/pages/AdminUsuariosPage'))

const Fallback = () => <LoadingSkeleton rows={4} className="m-6" />

export default function App() {
  return (
    <GlobalErrorBoundary>
      <Toaster richColors position="top-right" />
      <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
        <BrowserRouter>
          <Suspense fallback={<Fallback />}>
            <Routes>
              {/* Public */}
              <Route path="/login"    element={<LoginPage />} />
              <Route path="/cadastro" element={<RegisterPage />} />

              {/* Protected */}
              <Route element={<ProtectedRoute />}>
                <Route element={<><OnboardingWelcome /><AppShell /></>}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />

                  {/* Cliente and Admin */}
                  <Route element={<RoleGuard allowedRoles={['cliente', 'admin', 'super_admin']} />}>
                    <Route path="solicitacoes" element={<SolicitacoesPage />}>
                      <Route path="nova" element={<SolicitacaoFormDialog />} />
                      <Route path=":id" element={<SolicitacaoDetailDialog />} />
                    </Route>
                  </Route>

                  {/* Prestador and Admin */}
                  <Route element={<RoleGuard allowedRoles={['prestador', 'admin', 'super_admin']} />}>
                    <Route path="prestador/solicitacoes" element={<SolicitacaoListPrestadorPage />}>
                      <Route path=":id" element={<SolicitacaoDetailDialog />} />
                    </Route>
                    <Route path="prestador/orcamentos/novo/:solicitacaoId" element={<OrcamentoFormPage />} />
                    <Route path="prestador/orcamentos/:id" element={<OrcamentoDetailPage />} />
                    <Route path="prestador/orcamentos/:id/editar" element={<OrcamentoFormPage />} />
                  </Route>

                  {/* Cliente and Admin — review orcamento */}
                  <Route element={<RoleGuard allowedRoles={['cliente', 'admin', 'super_admin']} />}>
                    <Route path="orcamentos/:id/revisar" element={<OrcamentoReviewPage />} />
                  </Route>

                  {/* Admin only */}
                  <Route element={<RoleGuard allowedRoles={['admin', 'super_admin']} />}>
                    <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
                  </Route>

                  {/* All authenticated */}
                  <Route path="orcamentos/*"    element={<OrcamentosPage />} />
                  <Route path="ordens-servico" element={<OrdemServicoListPage />} />
                  <Route path="ordens-servico/:id" element={<OrdemServicoDetailPage />} />
                  <Route path="perfil"           element={<PerfilPage />} />
                  <Route path="notificacoes"    element={<NotificacoesPage />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </PersistQueryClientProvider>
    </GlobalErrorBoundary>
  )
}
