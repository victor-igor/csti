# Spec: UX/UI — Dashboard e Solicitações do Prestador

**Data:** 2026-05-12
**Escopo:** Experiência do prestador de serviço — dashboard, status de orçamentos, página de solicitações
**Status:** Aguardando aprovação

---

## 1. Problema

Dois problemas críticos de UX identificados na visão do prestador:

### 1.1 Dashboard = Solicitações (telas indistinguíveis)
- O `PrestadorDashboard` exibe "Precisa de atenção" com a mesma lista de solicitações da `SolicitacaoListPrestadorPage`
- O usuário não consegue identificar o propósito diferente de cada tela
- Quebra o princípio fundamental: **dashboard = visão geral; lista = exploração**

### 1.2 Status de orçamento sem semântica
- O StatCard "Orç. Enviados" agrega `enviado + aceito + recusado` sem distinção
- O prestador não sabe quantos orçamentos estão aguardando resposta, quantos foram aprovados, quantos foram reprovados
- Aprovações (status `aceito`) exigem ação do prestador (criar OS), mas ficam invisíveis no dashboard

---

## 2. Mental Model do Prestador

O prestador opera um **funil de conversão de serviços**:

```
[Oportunidades disponíveis]
        ↓  orça
[Orçamentos enviados — aguardando resposta]
        ↓  cliente aprova
[Orçamentos aceitos — iniciar OS]
        ↓  executa
[OS em andamento]
        ↓  conclui
[OS concluída]
```

O dashboard deve espelhar esse funil de relance.

---

## 3. Solução: Opção A — Pipeline Visual

### 3.1 Propósito de cada tela (diferenciação clara)

| Tela | Pergunta que responde | Modo de uso |
|------|----------------------|-------------|
| **Dashboard** | "O que preciso fazer agora?" | Scan rápido ao abrir o app |
| **Solicitações** | "Quais oportunidades posso orçar?" | Pesquisa e decisão |
| **Orçamentos** | "Como estão meus orçamentos?" | Acompanhamento detalhado |

---

## 4. Design — Dashboard

### 4.1 StatCards (substituição dos 3 atuais por 4)

Grid: `grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4`

Segue padrão DESIGN.md seção 11: **sem ícone colorido, sem border-l — label + número grande**.

| # | Label | Valor (fonte) | Rota ao clicar |
|---|-------|---------------|----------------|
| 1 | Disponíveis p/ Orçar | `solicitacoes_orcamento` status `aguardando_orcamento` | `/prestador/solicitacoes` |
| 2 | Aguardando Resposta | `orcamentos` status `enviado` do prestador | `/orcamentos` |
| 3 | Aceitos este mês | `orcamentos` status `aceito` do prestador (mês calendário corrente: 1º ao último dia do mês) | `/orcamentos` |
| 4 | OS Ativas | `ordens_servico` status != `concluida` e != `cancelada` | `/ordens-servico` |

**Componente:** `StatCard` inline existente no `DashboardPage.tsx` — apenas alterar labels e queries. Nenhum novo componente necessário.

---

### 4.2 Gráfico de Desempenho (nova seção)

**Posição:** entre os StatCards e a seção "Ação Necessária"

**Componente novo:** `OrcamentosMetricsChart`
- **Nível:** molecule (`src/components/molecules/OrcamentosMetricsChart.tsx`)
- **Biblioteca:** `recharts` (adicionar dependência)
- **Props:** `data: { mes: string; enviados: number; aprovados: number }[]`
- **Reusável em:** dashboard do cliente (futuramente), relatórios

**Layout interno:**
```
┌─────────────────────────────────────────────────────────────┐
│  📊 Desempenho — últimos 6 meses                            │
│                                                             │
│  Taxa de aprovação (mês atual): 67%  ↑ +12% vs mês ant.   │
│                                                             │
│  [BarChart: barras agrupadas Enviados vs Aprovados]         │
│   eixo X: meses (Dez, Jan, Fev, Mar, Abr, Mai)             │
│   eixo Y: quantidade                                        │
│   cor Enviados: var(--color-primary)                        │
│   cor Aprovados: var(--color-success)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Wrapper:** `DashboardSection` existente com título "Desempenho dos últimos 6 meses"

**Query Supabase:** `orcamentos` agrupados por mês via `created_at`, filtrados por `prestador_id`, sem nova tabela.

**Cores:** apenas tokens já no safelist — `text-primary` (#533afd) e `text-success` (#00b261). Regra: não inventar tokens.

**Documentação:** adicionar entrada na seção 11 do `DESIGN.md` após implementação.

---

### 4.3 Seção "Ação Necessária" (reformulada)

**Componente:** `DashboardSection` existente — dois grupos ordenados por prioridade de negócio.

**Grupo 1 — Orçamentos Aprovados** (visível apenas quando `aceito.length > 0`)
- Header interno: texto simples `text-xs text-muted-foreground uppercase` — "Orçamentos aprovados"
- Item: `ActionItem` existente
  - `numero`: número do orçamento
  - `titulo`: título da solicitação vinculada
  - `subtexto`: "aprovado há X dias" (sem valor total — visível na página de detalhes)
  - `ctaLabel`: "Criar OS"
  - `to`: `/prestador/orcamentos/:id`

**Grupo 2 — Novas Solicitações para Orçar**
- Header interno: "Novas oportunidades" (mesmo estilo)
- Item: `ActionItem` existente
  - `subtexto`: urgência como texto — ex: "Urgente · Categoria: rede" (badge visual completo só na página Solicitações)
  - `ctaLabel`: "Orçar"
  - Máx. 5 itens; link "Ver todas" no `DashboardSection`

**Regra:** se não há aprovados, Grupo 1 não renderiza (sem header vazio).

---

## 5. Design — Página Solicitações (`SolicitacaoListPrestadorPage`)

### 5.1 Diferenciação de propósito

- **Subtitle** da página: "Explore e avalie oportunidades disponíveis" (atualmente: "Aguardando orçamento")
- **Foco:** descoberta e avaliação — cards ricos para decisão de orçar ou não

### 5.2 `SolicitacaoCard` enriquecido

Adicionar ao card existente:

| Campo | Origem | Exibição |
|-------|--------|----------|
| Badge de urgência | `solicitacao.urgencia` (`baixa/media/urgente`) | `UrgenciaBadge` (atom novo) |
| Tempo aberto | `solicitacao.created_at` via `relativeDate()` | "Aberta há 2 dias" |
| Prazo desejado | `solicitacao.prazo_desejado` | "Prazo: 15/06" (quando preenchido) |

**`UrgenciaBadge`** — novo atom reutilizável:
- Arquivo: `src/components/atoms/UrgenciaBadge.tsx`
- Usa mapa `URGENCIA_CONFIG` em `constants.ts`:
  ```ts
  urgente: { label: 'Urgente', className: 'bg-danger-light text-danger' }
  media:   { label: 'Normal',  className: 'bg-warning-light text-warning' }
  baixa:   { label: 'Baixa',   className: 'bg-neutral-25 text-neutral-500' }
  ```
- Mesmo padrão visual do `StatusBadge` — editado uma vez, reflete em qualquer tela que o use

### 5.3 Filtros expandidos

Adicionar chips de urgência após os chips de categoria:

```
[Todas] [Rede] [Segurança] ...   |   [Urgente] [Normal] [Baixa]
```

Separador visual (`border-l border-border`) entre grupos de filtro.
Componente: `StatusFilterChips` existente — apenas passar os novos filtros.

---

## 6. Arquitetura de Componentes

### Princípio: reusabilidade primeiro

Todo componente novo deve ser parametrizado por props — nenhum valor hardcoded.

```
atoms/
  UrgenciaBadge.tsx          ← novo; reutilizável em OS, Orçamentos, Dashboard

molecules/
  OrcamentosMetricsChart.tsx ← novo; recebe data[] como prop

pages/
  DashboardPage.tsx          ← editar PrestadorDashboard: queries + layout
  
features/solicitacao/
  components/SolicitacaoCard.tsx  ← editar: adicionar urgência, tempo, prazo
  SolicitacaoListPrestadorPage.tsx ← editar: subtitle + filtros de urgência
```

**Regra:** ao editar `UrgenciaBadge`, muda em toda tela que o usa. Ao editar `OrcamentosMetricsChart`, muda em todo dashboard que o inclui.

### Sem regressão

- `ClienteDashboard` não é alterado
- `OrcamentosPage` não é alterada (já tem filtros por status)
- Queries existentes do `PrestadorDashboard` são substituídas, não duplicadas

---

## 7. Dependências

| Item | Ação |
|------|------|
| `recharts` | `npm install recharts` — única nova dependência |
| `DESIGN.md` | Adicionar seção de gráfico após implementação |
| `URGENCIA_CONFIG` | Adicionar em `src/lib/constants.ts` |
| Supabase | Nenhuma migração necessária — dados já existem |

---

## 8. Fora do Escopo

- Dashboard do cliente (não alterado nesta fase)
- Notificações push de aprovação (fase futura)
- Tela de detalhes do orçamento (não alterada)
- Mobile layout (segue padrão responsivo existente automaticamente)
