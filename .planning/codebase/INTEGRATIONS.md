# External Integrations

**Analysis Date:** 2025-05-24

## APIs & External Services

**Backend-as-a-Service:**
- Supabase - Provides Authentication, PostgreSQL Database, and Edge Functions.
  - SDK/Client: `@supabase/supabase-js`
  - Auth: Handled via `VITE_SUPABASE_ANON_KEY` and session persistence in `src/lib/supabase.ts`.

## Data Storage

**Databases:**
- PostgreSQL (Supabase)
  - Connection: via Supabase Client (`src/lib/supabase.ts`)
  - Client: Supabase-js (direct queries and RPC calls)

**File Storage:**
- Supabase Storage (configured in migrations for potential future use).

**Caching:**
- TanStack Query (React Query) for in-memory caching and state synchronization.
- LocalStorage for persisting Auth sessions and Onboarding state.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth
  - Implementation: Managed via `useAuth` hook and `authStore.ts`.
  - **Password Recovery**:
    - Request: `supabase.auth.resetPasswordForEmail` in `src/features/auth/RecuperarSenhaPage.tsx`.
    - Redefine: `supabase.auth.updateUser({ password })` in `src/features/auth/RedefinirSenhaPage.tsx`.

## Feature Logic Mapping

### Onboarding System
- **Library**: `react-joyride`
- **State Management**: `useOnboardingStore` in `src/hooks/useOnboarding.ts`.
- **Tour Steps**: `tourStepsByRole` in `src/features/onboarding/tourSteps.ts`.
- **Integration**: `OnboardingTour.tsx` (src/features/onboarding/) monitors route changes and uses a `MutationObserver` (`waitForElement`) to trigger steps when target elements appear in the DOM.

### Admin/User Management
- **Primary Page**: `src/pages/AdminUsuariosPage.tsx`
- **CRUD Operations**:
  - **Create**: Invokes Edge Function `admin-criar-usuario` via `supabase.functions.invoke`.
  - **Read**: Direct select from `profiles` table.
  - **Update**: Direct update to `profiles` table.
  - **Deactivate/Reactivate**: RPCs `admin_desativar_usuario` and `admin_reativar_usuario`.
  - **Delete**: RPC `admin_deletar_usuario` for permanent removal of account and associated data.

### Notification System
- **Frontend Logic**: `src/features/notificacoes/useNotificacoes.ts` handles fetching and marking as read.
- **Backend Logic**: Notifications are generated via PostgreSQL triggers and functions (defined in `supabase/migrations/`) during key events (e.g., budget approval in `aprovar_orcamento` RPC).
- **Real-time**: Currently uses React Query invalidation; database-level insertions are ready for Supabase Realtime integration.

### Dashboard Data Providers
- **Cliente**: `DashboardPage.tsx` fetches `solicitacoes_orcamento`, `orcamentos` (sent), `ordens_servico` (active), and `status_historico`.
- **Prestador**: `DashboardPage.tsx` fetches available `solicitacoes_orcamento` (status: `aguardando_orcamento`), sent/accepted `orcamentos`, active `ordens_servico`, and calculates metrics from the last 6 months of quotes.
- **Admin**: `DashboardPage.tsx` provides global counts for all major entities (`profiles`, `solicitacoes_orcamento`, `orcamentos`, `ordens_servico`).

## Data Dictionary (Supabase Tables)

| Table | Description | Key Columns |
|-------|-------------|-------------|
| `profiles` | User profiles linked to Auth.users | `id`, `nome`, `email`, `role`, `especialidade`, `telefone` |
| `solicitacoes_orcamento` | Service requests from clients | `id`, `numero`, `cliente_id`, `titulo`, `descricao`, `status`, `categoria` |
| `orcamentos` | Quotes submitted by providers | `id`, `numero`, `solicitacao_id`, `prestador_id`, `status`, `prazo_estimado_dias` |
| `itens_orcamento` | Line items for a specific quote | `id`, `orcamento_id`, `descricao`, `quantidade`, `valor_unitario`, `tipo` |
| `ordens_servico` | Service orders from accepted quotes | `id`, `numero`, `orcamento_id`, `cliente_id`, `prestador_id`, `status` |
| `notificacoes` | System notifications for users | `id`, `usuario_id`, `tipo`, `titulo`, `mensagem`, `lida` |
| `mensagens_solicitacao` | Chat messages for service requests | `id`, `solicitacao_id`, `usuario_id`, `mensagem` |
| `status_historico` | Audit log of status transitions | `id`, `tabela_nome`, `registro_id`, `status_anterior`, `status_novo` |

## CRUD Services & Endpoints Mapping

### Authentication & Profiles
- `src/features/auth/useAuth.ts`: `signIn`, `signUp`, `signOut` actions.
- `src/features/perfil/usePerfil.ts`: `useGetProfile`, `useUpdateProfile`.

### Service Requests (Solicitações)
- `src/features/solicitacao/useSolicitacao.ts`:
  - `useCreateSolicitacao`, `useListSolicitacoes`, `useGetSolicitacao`, `useUpdateSolicitacao`, `useCancelSolicitacao`, `useDeleteSolicitacao`.

### Quotes (Orçamentos)
- `src/features/orcamento/useOrcamento.ts`:
  - `useCreateOrcamento`, `useUpdateOrcamento`, `useEnviarOrcamento` (RPC), `useAprovarOrcamento` (RPC), `useRecusarOrcamento` (RPC), `useDeleteOrcamento` (RPC).

### Service Orders (Ordens de Serviço)
- `src/features/ordem-servico/useOrdemServico.ts`:
  - `useListOrdensServico`, `useGetOrdemServico`, `useUpdateStatusOS`.

---

*Integration audit: 2025-05-24*
