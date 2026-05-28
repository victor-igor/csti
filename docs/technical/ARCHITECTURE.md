<!-- refreshed: 2025-05-15 -->
# Architecture

**Analysis Date:** 2025-05-15

## System Overview

```mermaid
graph TD
    UI[UI Layer - React SPA] --> Feature[Feature Layer - Domain Logic]
    Feature --> State[State Layer - TanStack Query/Zustand]
    State --> Supabase[Backend Layer - Supabase]
    
    subgraph "Frontend"
        UI
        Feature
        State
    end
    
    subgraph "Backend"
        Supabase
        Supabase --> DB[(PostgreSQL)]
        Supabase --> Auth[Auth Service]
        Supabase --> RPC[[RPC Functions]]
    end
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| `App` | Root router and provider setup | `src/App.tsx` |
| `authStore` | Global auth state and profile management | `src/store/authStore.ts` |
| `useAuthStore` | Zustand hook for auth state | `src/store/authStore.ts` |
| `AppShell` | Main authenticated layout shell | `src/components/layout/AppShell.tsx` |
| `ProtectedRoute` | Authentication gate for routes | `src/components/guards/ProtectedRoute.tsx` |
| `RoleGuard` | Role-based access control gate | `src/components/guards/RoleGuard.tsx` |
| `useOrcamento` | Budget domain logic and API calls | `src/features/orcamento/useOrcamento.ts` |
| `useSolicitacao` | Request domain logic and API calls | `src/features/solicitacao/useSolicitacao.ts` |

## Data Model (ERD)

```mermaid
erDiagram
    profiles ||--o{ solicitacoes_orcamento : "cria"
    profiles ||--o{ orcamentos : "provê"
    solicitacoes_orcamento ||--o{ orcamentos : "recebe"
    solicitacoes_orcamento ||--o{ mensagens_solicitacao : "contém"
    orcamentos ||--o{ itens_orcamento : "possui"
    orcamentos ||--o| ordens_servico : "gera"
    solicitacoes_orcamento ||--o| ordens_servico : "vincula"

    profiles {
        uuid id PK
        string email
        string nome
        string role "cliente | prestador | admin"
    }
    solicitacoes_orcamento {
        uuid id PK
        uuid cliente_id FK
        string equipamento
        string status "aberta | aprovado | cancelado"
        string urgencia
    }
    orcamentos {
        uuid id PK
        uuid solicitacao_id FK
        uuid prestador_id FK
        decimal valor_total
        string status "rascunho | enviado | aceito | recusado"
    }
    itens_orcamento {
        uuid id PK
        uuid orcamento_id FK
        string descricao
        decimal preco_unitario
        int quantidade
    }
    ordens_servico {
        uuid id PK
        uuid orcamento_id FK
        uuid solicitacao_id FK
        string status "aberta | em_andamento | concluida"
    }
```

## Pattern Overview

**Overall:** Feature-based SPA with role-based access control (RBAC) and Atomic Design.

**Key Characteristics:**
- **Encapsulated Features**: Domains like `orcamento`, `solicitacao`, and `ordem-servico` are self-contained under `src/features/`.
- **Atomic Design**: Generic UI components are organized into `atoms`, `molecules`, and `organisms` under `src/components/`.
- **Server State Management**: TanStack Query (React Query) is used for all server-side data synchronization and caching.
- **RPC-First Mutations**: Complex operations are offloaded to Supabase PostgreSQL functions (RPCs) to ensure atomicity and security.

## Component Interaction

```mermaid
graph TD
    View[React View] --> Hook[Feature Hook - useFeature]
    Hook --> Store[Auth Store - Zustand]
    Hook --> Query[TanStack Query]
    Query --> Supabase[Supabase Client]
    Supabase --> RPC[RPC Functions]
    Supabase --> DB[(PostgreSQL)]
    
    style RPC fill:#f9f,stroke:#333,stroke-width:2px
```

## Layers

**Auth Layer:**
- Purpose: Session management and role enforcement.
- Location: `src/store/authStore.ts`, `src/components/guards/`.
- Contains: Zustand store, `ProtectedRoute`, `RoleGuard`.
- Depends on: Supabase client (`src/lib/supabase.ts`).
- Used by: `App.tsx` (route wrappers), feature hooks.

**Logic Layer (Hooks):**
- Purpose: Encapsulate domain logic and server state operations.
- Location: `src/features/**/use*.ts`, `src/hooks/`.
- Contains: `useQuery`, `useMutation` implementations.
- Depends on: `src/lib/supabase.ts`, `src/store/authStore.ts`.
- Used by: Page and organism components.

**UI Layer:**
- Purpose: Present data and capture user interaction.
- Location: `src/features/**/Pages.tsx`, `src/components/`.
- Contains: React components, Tailwind styling.
- Depends on: Logic layer hooks, shared components.

## Data Flow

### Budget Approval Flow (Robust)

```mermaid
sequenceDiagram
    autonumber
    participant C as Cliente (UI)
    participant H as useOrcamento Hook
    participant Q as TanStack Query
    participant S as Supabase (RPC)
    participant DB as Database

    C->>H: aprovarOrcamento(orcamentoId)
    H->>S: rpc('aprovar_orcamento', { p_orcamento_id: orcamentoId })
    
    rect rgb(240, 240, 240)
        Note over S, DB: Transação Atômica (PostgreSQL)
        S->>DB: UPDATE orcamentos SET status = 'aceito'
        S->>DB: UPDATE solicitacoes SET status = 'aprovado'
        S->>DB: INSERT INTO ordens_servico (...)
    end
    
    DB-->>S: Success (os_id)
    S-->>H: { data: os_id }
    
    H->>Q: invalidateQueries(['orcamentos'])
    H->>Q: invalidateQueries(['solicitacoes'])
    H->>Q: invalidateQueries(['ordens_servico'])
    
    H->>C: Notificar Sucesso (Toast)
    H->>C: Redirecionar para /ordens-servico/:id
```

### Service Lifecycle (Activity Diagram)

```mermaid
graph TD
    Start((Inicio)) --> CreateReq[Cliente cria Solicitação]
    CreateReq --> WaitProvider[Aguardando Orçamentos]
    WaitProvider --> SubmitBudget[Prestador envia Orçamento]
    SubmitBudget --> Decision{Cliente Aprova?}
    Decision -- Não --> Reject[Orçamento Recusado]
    Reject --> WaitProvider
    Decision -- Sim --> Approve[Orçamento Aceito]
    Approve --> CreateOS[Sistema cria Ordem de Serviço]
    CreateOS --> ExecuteOS[Execução do Serviço]
    ExecuteOS --> FinishOS[Finalização do Serviço]
    FinishOS --> End((Fim))
```

### Auth State Flow

```mermaid
graph TD
    A[Supabase Auth Listener] -->|onAuthStateChange| B(Update authStore Session)
    B --> C{User Logged In?}
    C -->|Yes| D[Fetch Profile in Background]
    C -->|No| E[Clear Session & Profile]
    D --> F(Update authStore Profile)
    F --> G[Re-render Protected Routes]
```

**State Management:**
- **Auth**: Zustand (`useAuthStore`) for persistent session and profile.
- **Server State**: TanStack Query for caching domain entities (`orcamentos`, `solicitacoes`, etc.).
- **Local UI State**: `useState` or specialized Zustand stores (e.g., `perfilModalStore`).

## Key Abstractions

**Custom Hooks (useFeature):**
- Purpose: Centralize all API interactions for a feature.
- Examples: `src/features/orcamento/useOrcamento.ts`.

**Route Guards:**
- Purpose: declarative access control.
- Examples: `src/components/guards/RoleGuard.tsx`.

## Entry Points

**Main Entry:**
- Location: `src/main.tsx`
- Responsibilities: Renders the React application and sets up the root provider.

**Router Entry:**
- Location: `src/App.tsx`
- Responsibilities: Defines the component-based routing table and wraps routes in guards and layouts.

## Architectural Constraints

- **Single Entry Point**: All routes must be declared in `src/App.tsx`.
- **Atomic Commits**: Data mutations involving multiple tables must use Supabase RPCs to ensure database integrity.
- **Role Isolation**: Business logic must respect the user role fetched from the `profiles` table.

## Anti-Patterns

### Logic in Components
**What happens:** Placing complex Supabase queries or data transformation directly inside JSX components.
**Why it's wrong:** Harder to test and reuse; breaks the separation of concerns.
**Do this instead:** Move logic to a custom hook in `src/features/{domain}/use{Domain}.ts`.

## Error Handling

**Strategy:** Centralized error boundary for crashes, toast notifications for API failures.

**Patterns:**
- `GlobalErrorBoundary`: Catches React rendering errors.
- `sonner`: Used for user-facing success/error feedback during mutations.
- `parseApiError`: Utility to transform Supabase/PostgREST errors into readable messages.

---

*Architecture analysis: 2025-05-15*
