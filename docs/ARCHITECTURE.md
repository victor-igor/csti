<!-- generated-by: gsd-doc-writer -->
# Arquitetura — CSTI

## Visão Geral do Sistema

CSTI é uma SPA (Single Page Application) React que conecta **clientes** (empresas com equipamentos de TI para manutenção) a **prestadores** (técnicos de TI que elaboram orçamentos). O ciclo completo vai da abertura de uma solicitação de orçamento até a criação de uma Ordem de Serviço, com aprovação atômica via função RPC no Supabase.

A arquitetura segue o modelo **BFF-less**: o frontend conversa diretamente com o Supabase através do SDK `@supabase/supabase-js`. Toda a autorização é imposta no banco de dados via Row Level Security (RLS), eliminando a necessidade de um servidor intermediário de API.

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

---

## Pattern Overview

**Overall:** Feature-based SPA with role-based access control (RBAC) and Atomic Design.

**Key Characteristics:**
- **Encapsulated Features**: Domains like `orcamento`, `solicitacao`, and `ordem-servico` are self-contained under `src/features/`.
- **Atomic Design**: Generic UI components are organized into `atoms`, `molecules`, and `organisms` under `src/components/`.
- **Server State Management**: TanStack Query (React Query) is used for all server-side data synchronization and caching.
- **RPC-First Mutations**: Complex operations are offloaded to Supabase PostgreSQL functions (RPCs) to ensure atomicity and security.

---

## Diagrama de Componentes (Alto Nível)

```mermaid
graph TD
    subgraph "Browser — SPA React 19"
        A[main.tsx] --> B[App.tsx]
        B --> C[PersistQueryClientProvider]
        C --> D[BrowserRouter / Routes]
        D --> E[ProtectedRoute]
        E --> F[RoleGuard]
        F --> G[AppShell]
        G --> H[Feature Pages]
    end

    subgraph "Camada de Estado"
        I[Zustand — authStore]
        J[Zustand — perfilModalStore]
        K[TanStack Query — server cache]
        L[react-hook-form — form state]
    end

    subgraph "Supabase"
        M[Auth — signIn / signUp / onAuthStateChange]
        N[PostgREST — REST API com RLS]
        O[RPC — aprovar_orcamento]
        P[Realtime — opcional]
    end

    H -->|useQuery / useMutation| K
    K -->|supabase-js| N
    K -->|supabase.rpc| O
    I -->|onAuthStateChange listener| M
    H -->|formulários| L
    H -->|geração de PDF| Q[jsPDF]
```

---

## Camadas de Responsabilidade

| Componente | Responsabilidade | Localização |
|-----------|----------------|------|
| `App` | Root router and provider setup | `src/App.tsx` |
| `authStore` | Global auth state and profile management | `src/store/authStore.ts` |
| `AppShell` | Main authenticated layout shell | `src/components/layout/AppShell.tsx` |
| `ProtectedRoute` | Authentication gate for routes | `src/components/guards/ProtectedRoute.tsx` |
| `RoleGuard` | Role-based access control gate | `src/components/guards/RoleGuard.tsx` |
| `useOrcamento` | Budget domain logic and API calls | `src/features/orcamento/useOrcamento.ts` |
| `useSolicitacao` | Request domain logic and API calls | `src/features/solicitacao/useSolicitacao.ts` |

---

## Fluxo de Dados e Interações

### 1. Aprovação de Orçamento (Transação Atômica)

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

### 2. Ciclo de Vida do Serviço

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

### 3. Gerenciamento de Estado de Autenticação

```mermaid
graph TD
    A[Supabase Auth Listener] -->|onAuthStateChange| B(Update authStore Session)
    B --> C{User Logged In?}
    C -->|Yes| D[Fetch Profile in Background]
    C -->|No| E[Clear Session & Profile]
    D --> F(Update authStore Profile)
    F --> G[Re-render Protected Routes]
```

---

## Modelo de Dados (ERD)

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

### Dicionário de Dados (Principais Tabelas)

| Tabela | Descrição | Colunas Chave |
|-------|-------------|-------------|
| `profiles` | Perfis de usuário vinculados ao Auth.users | `id`, `nome`, `email`, `role`, `especialidade`, `telefone` |
| `solicitacoes_orcamento` | Pedidos de serviço criados por clientes | `id`, `numero`, `cliente_id`, `titulo`, `descricao`, `status`, `categoria` |
| `orcamentos` | Orçamentos enviados por prestadores | `id`, `numero`, `solicitacao_id`, `prestador_id`, `status`, `prazo_estimado_dias` |
| `itens_orcamento` | Itens de um orçamento específico | `id`, `orcamento_id`, `descricao`, `quantidade`, `valor_unitario`, `tipo` |
| `ordens_servico` | Ordens de serviço geradas após aceite | `id`, `numero`, `orcamento_id`, `cliente_id`, `prestador_id`, `status` |
| `notificacoes` | Notificações do sistema para usuários | `id`, `usuario_id`, `tipo`, `titulo`, `mensagem`, `lida` |
| `status_historico` | Log de auditoria de transições de status | `id`, `tabela_nome`, `registro_id`, `status_anterior`, `status_novo` |

---

## Estrutura de Diretórios (`src/`)

```
src/
├── main.tsx                     # Ponto de entrada — monta StrictMode + App
├── App.tsx                      # Roteamento, providers globais, lazy-loading
├── index.css                    # Tailwind CSS v4 — tokens e variáveis globais
│
├── features/                    # Módulos de negócio (feature-slice)
│   ├── auth/                    # Autenticação: login, cadastro, hooks de auth
│   ├── notificacoes/            # Listagem e leitura de notificações
│   ├── orcamento/               # CRUD de orçamentos, envio e revisão
│   ├── ordem-servico/           # Listagem e detalhe de ordens de serviço
│   ├── perfil/                  # Modal de perfil e edição de dados do usuário
│   └── solicitacao/             # CRUD de solicitações de orçamento
│
├── components/
│   ├── ui/                      # Componentes shadcn/ui (primitivos)
│   ├── atoms/                   # Primitivos sem dependência de domínio (Button, Badge)
│   ├── molecules/               # Composições (PhoneInput, InfoRow, FilterBar)
│   ├── organisms/               # Blocos complexos (DataTable, SolicitacaoCard)
│   ├── layout/                  # AppShell, Sidebar, TopBar, BottomNav
│   ├── guards/                  # ProtectedRoute, RoleGuard
│   └── pdf/                     # Geração de PDF com jsPDF
│
├── lib/                         # Utilitários e clientes singleton
│   ├── supabase.ts              # createClient — cliente Supabase tipado
│   ├── queryClient.ts           # QueryClient + persister localStorage
│   └── phoneUtils.ts            # Utilitários de telefone e máscaras
│
├── store/                       # Stores Zustand globais
│   ├── authStore.ts             # Sessão, usuário e perfil
│   └── perfilModalStore.ts      # Estado de abertura do PerfilModal
│
└── types/                       # Tipos TypeScript
    ├── domain.ts                # Role, ISolicitacao, IOrcamento...
    └── supabase.ts              # Tipos gerados pelo Supabase CLI
```

---

## Stack Tecnológica

| Camada | Tecnologias |
|---|---|
| **Linguagens** | TypeScript, SQL (PL/pgSQL), CSS3 |
| **Frontend** | React 19, Vite, Tailwind CSS 4 |
| **Estado/Dados** | TanStack Query v5, Zustand, React Hook Form, Zod |
| **Backend (BaaS)**| Supabase (Auth, PostgreSQL, RPC, Edge Functions) |
| **UI/UX** | shadcn/ui, Lucide React, Sonner (toasts), React Joyride (onboarding) |
| **Testes** | Vitest, Testing Library, Playwright |
| **Utilidades** | jsPDF (geração de PDF), Recharts (gráficos) |

---

## Roteamento e Acesso

Definido em `src/App.tsx`. Todas as páginas são **lazy-loaded**.

### Árvore de Rotas (Simplificada)

```
/login                              → Público
/cadastro                           → Público

[ProtectedRoute — Requer Sessão]
  /dashboard                        → Dashboard Principal
  /perfil                           → Modal de Perfil (Zustand controlled)
  
  [RoleGuard — role: 'cliente']
    /solicitacoes                   → Gestão de Solicitações
    /orcamentos/:id/revisar         → Revisão de Proposta

  [RoleGuard — role: 'prestador']
    /prestador/solicitacoes         → Marketplace de Demandas
    /prestador/orcamentos/novo      → Elaboração de Proposta
```

---

## Integrações Externas

### Supabase
- **Auth**: Gerenciado via `authStore.ts` e `useAuth`.
- **Database**: PostgreSQL acessado via `supabase-js` com Row Level Security (RLS) habilitado em todas as tabelas.
- **RPC**: Funções atômicas como `aprovar_orcamento` para garantir integridade.

### Sistema de Onboarding
- **Biblioteca**: `react-joyride`.
- **Funcionamento**: Monitora mudanças de rota e usa `MutationObserver` para disparar tours guiados baseados no papel do usuário (`cliente` ou `prestador`).

### Geração de PDF
- **Biblioteca**: `jsPDF`.
- **Fluxo**: Geração puramente client-side em `src/components/pdf/PdfGenerator.ts`.
