# Codebase Concerns

**Analysis Date:** 2026-05-09
**Spec Reference:** `/Users/victorigor/eep-projeto/eep-projeto/docs/superpowers/specs/2026-05-09-frontend-redesign-stripe.md`

---

## SP2 Shell Bugs (Layout)

**TopBar — mobile layout quebrado:**
- Issue: No mobile, o breadcrumb é ocultado com `hidden md:flex` mas o `<div className="flex-1 md:hidden" />` (spacer) ocupa espaço sem conteúdo, deixando a topbar com distribuição desequilibrada entre logo e ações.
- File: `src/components/layout/TopBar.tsx` (lines 39-44)
- Impact: Header mobile sem identidade visual — sem logo, sem nome do app visível.
- Fix: Adicionar logo/wordmark OrçaFácil no centro do TopBar em mobile (substituir o spacer vazio).

**Sidebar — overflow-hidden pode vazar conteúdo:**
- Issue: A sidebar usa `hidden md:flex` (só aparece em desktop), mas o `overflow-hidden` no `<aside>` pode cortar tooltips de ícones quando retraída (`w-[64px]`). Os links usam `title={!isExpanded ? label : undefined}` para tooltips nativos, que podem ser cortados pelo `overflow-hidden`.
- File: `src/components/layout/Sidebar.tsx` (lines 44-47)
- Impact: Tooltips de navegação invisíveis quando sidebar retraída.
- Fix: Remover `overflow-hidden` do `<aside>` e usar `overflow-y-auto overflow-x-visible` apenas no `<nav>` interno.

**BottomNav — z-index conflict com modals:**
- Issue: `BottomNav` tem `z-[200]`. Modais baseados em Radix/Base UI usam z-index padrão ao redor de `z-50` a `z-[100]`. `ConfirmDialog` e `DropdownMenu` podem aparecer atrás do BottomNav em mobile.
- File: `src/components/layout/BottomNav.tsx` (line 15)
- Impact: Modais de confirmação ficam parcialmente tapados pelo BottomNav em telas pequenas.
- Fix: Garantir que dialogs/portals usem `z-[300]` ou superior, ou reduzir BottomNav para `z-[50]` e elevar modais.

**Double padding — AppShell + páginas:**
- Issue: `AppShell` já envolve o `<Outlet>` em `<div className="p-4 md:p-6 lg:p-8">`. Todas as páginas adicionam seu próprio `<div className="p-6">` internamente, resultando em padding duplicado (ex: 32px + 24px = 56px de padding total em desktop).
- Files: `src/components/layout/AppShell.tsx` (line 23), `src/pages/SolicitacoesPage.tsx` (line 55), `src/pages/OrcamentosPage.tsx` (line 97), `src/features/ordem-servico/OrdemServicoListPage.tsx` (line 50), `src/features/solicitacao/SolicitacaoDetailPage.tsx` (line 40), `src/features/orcamento/OrcamentoFormPage.tsx` (line 80), `src/features/orcamento/OrcamentoReviewPage.tsx` (line 63), `src/features/ordem-servico/OrdemServicoDetailPage.tsx` (line 45)
- Impact: Layout com padding excessivo em todas as páginas autenticadas.
- Fix: Remover o `p-4 md:p-6 lg:p-8` do AppShell e manter padding nas páginas individualmente, OU remover `p-6` das páginas e deixar AppShell controlar o espaçamento.

---

## Responsividade — Listas com Código Duplicado

**SolicitacoesPage — tabela desktop / cards mobile duplicados:**
- Issue: A página renderiza dois blocos independentes: `hidden md:block` (tabela HTML completa) e `md:hidden` (mapa de `SolicitacaoCard`). Toda lógica de renderização de linha é duplicada — colunas, formatação de data, navegação ao clicar.
- File: `src/pages/SolicitacoesPage.tsx` (lines 96-145)
- Impact: Manutenção dobrada. Adicionar uma coluna exige atualizar dois lugares. A tabela desktop não usa o componente `SolicitacaoCard` refinado.
- Fix: Usar o componente `DataTable` (já existente em `src/components/organisms/DataTable.tsx`) que já implementa o padrão tabela/cards responsivo em um único componente.

**OrcamentosPage — sem layout responsivo:**
- Issue: `OrcamentosPage` usa apenas cards (`div` com `flex`) para todos os tamanhos de tela — sem tabela desktop. Não há FilterBar nem busca por texto.
- File: `src/pages/OrcamentosPage.tsx` (lines 31-59)
- Impact: Experiência inferior em desktop. Sem busca/filtro por status.
- Fix: Adicionar FilterBar com busca e filtro por status. Usar `DataTable` ou layout two-column em desktop.

**OrdemServicoListPage — navegação via data-index quebrada:**
- Issue: A página usa delegação de eventos para detectar cliques em `<tr data-index>`, mas `DataTable` **não define o atributo `data-index` nas rows** (o `<tr>` não tem esse atributo). A navegação ao clicar na tabela desktop está silenciosamente quebrada.
- File: `src/features/ordem-servico/OrdemServicoListPage.tsx` (lines 71-78), `src/components/organisms/DataTable.tsx` (line 60)
- Impact: Clique em linha da tabela no desktop não navega para o detalhe da OS.
- Fix: Passar `onRowClick` como prop ao `DataTable`, ou adicionar `data-index={i}` nas `<tr>` do DataTable.

---

## SP3 Pendente — FilterBar e Cards de Lista

**FilterBar sem resultCount/totalCount:**
- Issue: `FilterBar` não aceita props `resultCount` nem `totalCount`. Não há feedback visual de "X de Y resultados" ao filtrar.
- File: `src/components/molecules/FilterBar.tsx`
- Impact: Usuário não sabe quantos resultados foram encontrados, especialmente com filtro de status ativo.
- Fix: Adicionar props `resultCount?: number` e `totalCount?: number` ao `FilterBar` e renderizar texto informativo.

**SolicitacaoCard (organisms) sem refinamento Stripe:**
- Issue: `src/components/organisms/SolicitacaoCard.tsx` é um card básico sem borda-esquerda colorida por status, sem indicador "Novo", sem ícone de navegação. O card refinado existe apenas em `src/features/solicitacao/components/SolicitacaoCard.tsx`.
- Files: `src/components/organisms/SolicitacaoCard.tsx` (27 lines), `src/features/solicitacao/components/SolicitacaoCard.tsx` (75 lines)
- Impact: Inconsistência visual. O dashboard e outras áreas que importam de `organisms/` recebem card inferior.
- Fix: Consolidar em um único componente ou promover o card refinado de `features/` para `organisms/`.

**OrcamentoCard — sem título da solicitação:**
- Issue: `OrcamentoCard` em `src/components/organisms/OrcamentoCard.tsx` não exibe o título da solicitação vinculada. `OrcamentosPage` contorna isso com `(orc as any).solicitacoes_orcamento?.titulo` (type cast não tipado).
- File: `src/components/organisms/OrcamentoCard.tsx`, `src/pages/OrcamentosPage.tsx` (line 44)
- Impact: Cards de orçamento não identificam qual solicitação pertencem sem casts perigosos.
- Fix: Incluir `solicitacao_titulo` no tipo `IOrcamento` via join no hook, e renderizar no `OrcamentoCard`.

**OrdemServicoCard — informação mínima:**
- Issue: `OrdemServicoCard` exibe apenas `numero`, `data_inicio` e `StatusBadge`. Não exibe valor total, prazo, ou link para orçamento origem.
- File: `src/components/organisms/OrdemServicoCard.tsx`
- Impact: Cards de OS na lista mobile transmitem informação insuficiente para decisão de ação.
- Fix: Enriquecer com valor do orçamento vinculado e data de conclusão estimada.

---

## SP4 Pendente — Detail e Form Pages

**SolicitacaoDetailPage — sem layout 2 colunas e sem StatusTimeline:**
- Issue: A página usa `max-w-3xl` com layout single-column. Não há `StatusTimeline` mostrando histórico de transições de status. Os InfoCards ocupam `grid-cols-2 sm:grid-cols-2 md:grid-cols-4` mas não há coluna secundária sticky.
- File: `src/features/solicitacao/SolicitacaoDetailPage.tsx`
- Impact: Em desktop, a página desperdiça espaço. Sem histórico de status, o cliente não tem rastreabilidade.
- Fix: Implementar layout `lg:grid-cols-[1fr_320px]` com painel lateral sticky (histórico + ações). Conectar `StatusTimeline` ao histórico da solicitação.

**OrcamentoFormPage — itens como cards empilhados, não tabela inline:**
- Issue: Cada item do orçamento é renderizado como um card separado com campos de formulário empilhados. Em desktop, uma tabela inline (descrição | qtd | valor unitário | subtotal | remover) seria mais eficiente e esperada pelos usuários.
- File: `src/features/orcamento/OrcamentoFormPage.tsx` (lines 144-184)
- Impact: Formulário de orçamento não escala visualmente para muitos itens. UX inferior em desktop.
- Fix: Substituir cards por tabela inline em `md:` breakpoint usando `ItemOrcamentoRow` como referência visual (já existe em `src/components/organisms/ItemOrcamentoRow.tsx`).

**OrcamentoReviewPage — sem painel sticky e sem botões de ação sticky:**
- Issue: Aprovação/recusa ficam no final do `max-w-3xl` single-column. Em listas longas de itens, o usuário precisa rolar até o fim para agir. Não há painel lateral fixo com total e CTAs.
- File: `src/features/orcamento/OrcamentoReviewPage.tsx` (lines 117-137)
- Impact: UX ruim para orçamentos com muitos itens. Botões de aprovar/recusar ficam off-screen.
- Fix: Implementar layout `lg:grid-cols-[1fr_300px]` com painel direito `sticky top-14` contendo `TotalSummary` + CTAs.

---

## Rota Inexistente — Bell de Notificações

**Link /notificacoes aponta para rota sem página:**
- Issue: O sino de notificações no `TopBar` linka para `/notificacoes`, que não está registrada em `App.tsx`. O catch-all `<Route path="*" element={<Navigate to="/dashboard" replace />} />` redireciona silenciosamente para o dashboard, sem feedback ao usuário.
- Files: `src/components/layout/TopBar.tsx` (line 50), `src/App.tsx` (line 77)
- Impact: Clique no sino (especialmente com badge de notificações não lidas) leva ao dashboard sem explicação. Experiência confusa com `notifCount > 0`.
- Fix: Criar `NotificacoesPage` placeholder com EmptyState, ou desabilitar o link com `cursor-not-allowed` e tooltip "Em breve" enquanto a feature não existe.

---

## Type Safety — Type Casts Não Tipados

**`as any` em OrcamentosPage:**
- Issue: `(orc as any).solicitacoes_orcamento?.titulo` é usado para acessar join de Supabase sem tipo definido.
- File: `src/pages/OrcamentosPage.tsx` (lines 44-46)
- Impact: Mudança no schema/join quebra silenciosamente em runtime sem erro de compilação.
- Fix: Definir tipo `IOrcamentoComSolicitacao` estendendo `IOrcamento` com `solicitacoes_orcamento?: { titulo: string }` e tipar o hook retornado por `useListOrcamentosCliente`.

**Dois componentes SolicitacaoCard com interfaces diferentes:**
- Issue: `src/components/organisms/SolicitacaoCard.tsx` aceita `{ solicitacao }` sem `onClick`. `src/features/solicitacao/components/SolicitacaoCard.tsx` aceita `{ solicitacao, onClick, variant }`. Nomes idênticos causam ambiguidade em imports.
- Files: `src/components/organisms/SolicitacaoCard.tsx`, `src/features/solicitacao/components/SolicitacaoCard.tsx`
- Impact: Import errado não gera erro de tipo imediato. `SolicitacoesPage` importa da feature e funciona; código futuro pode importar de organisms e perder o `onClick`.
- Fix: Renomear `organisms/SolicitacaoCard` para `SolicitacaoCardSimple` ou consolidar em um único componente.

---

## Fragile Areas

**DataTable — navegação por clique em desktop não funciona (OS):**
- Issue: `OrdemServicoListPage` usa event delegation buscando `tr[data-index]`, mas `DataTable` não adiciona `data-index` nas `<tr>`. A navegação desktop está quebrada silenciosamente.
- Files: `src/features/ordem-servico/OrdemServicoListPage.tsx` (lines 71-76), `src/components/organisms/DataTable.tsx` (line 60)
- Impact: Bug ativo — clique em linha de OS no desktop não navega.
- Priority: HIGH — bug funcional existente.

**DropdownMenu — mistura de duas bibliotecas:**
- Issue: `src/components/ui/dropdown-menu.tsx` é baseado em `@base-ui/react/menu`. `src/components/organisms/ActionMenu.tsx` usa `@radix-ui/react-dropdown-menu` diretamente. Dois sistemas de menu diferentes coexistem.
- Files: `src/components/ui/dropdown-menu.tsx` (line 2), `src/components/organisms/ActionMenu.tsx` (line 1)
- Impact: Bundle maior. Comportamento inconsistente (acessibilidade, animações, z-index). O `DropdownMenuTrigger` de `@base-ui` não aceita `asChild` — qualquer tentativa de uso como em Radix vai falhar com warning.
- Fix: Consolidar em uma biblioteca. Migrar `ActionMenu.tsx` para usar `src/components/ui/dropdown-menu.tsx` (Base UI).

**AppShell — `md:ml-[64px]` hardcoded mas sidebar pode não existir:**
- Issue: `AppShell` sempre aplica `md:ml-[64px]` ao `<main>`, assumindo que a sidebar sempre tem 64px. Se a sidebar for removida ou escondida por role, o conteúdo fica deslocado.
- File: `src/components/layout/AppShell.tsx` (line 19)
- Impact: Layout quebrado se sidebar for condicionalmente não renderizada.
- Fix: Usar CSS custom property ou estado do sidebar para calcular margin dinamicamente.

---

## Missing Features — EmptyState em Páginas

**OrdensServicoPage sem EmptyState customizado:**
- Issue: `OrdemServicoListPage` passa `emptyMessage="Nenhuma ordem de serviço encontrada."` para `DataTable`, que renderiza um texto simples em div. Não usa o componente `EmptyState` com ícone e ação.
- File: `src/features/ordem-servico/OrdemServicoListPage.tsx` (line 85)
- Impact: Inconsistência visual entre páginas. `SolicitacoesPage` usa `<EmptyState>` com ação; OS não.
- Fix: Adicionar prop `emptySlot?: React.ReactNode` ao `DataTable` para injetar `EmptyState` customizado.

**StatusTimeline não usada em SolicitacaoDetailPage:**
- Issue: `StatusTimeline` existe em `src/components/organisms/StatusTimeline.tsx` mas não é importada em `SolicitacaoDetailPage`. A página não exibe histórico de status da solicitação.
- Files: `src/components/organisms/StatusTimeline.tsx`, `src/features/solicitacao/SolicitacaoDetailPage.tsx`
- Impact: Falta de rastreabilidade para o cliente. O prestador vê histórico em OS detail, mas o cliente não vê em solicitação detail.
- Fix: Conectar `StatusTimeline` ao histórico da solicitação (requer query de `historico_solicitacoes` ou campo equivalente).

---

## Test Coverage Gaps

**OrdemServicoListPage — sem testes:**
- What's not tested: Navegação por clique (o bug de `data-index`), filtro por status, estados de loading/error.
- Files: `src/features/ordem-servico/` (sem arquivos `.test.tsx`)
- Risk: O bug de navegação desktop permanece invisível.
- Priority: HIGH

**OrcamentoFormPage — fluxo enviar sem testes:**
- What's not tested: Lógica de criar-rascunho-e-depois-enviar em sequência (Promise aninhada com `criarOrcamento` + `enviarOrcamento`).
- File: `src/features/orcamento/OrcamentoFormPage.tsx` (lines 53-68)
- Risk: Race condition ou falha silenciosa no envio sem feedback de erro.
- Priority: HIGH

**OrcamentosPage — `as any` cast sem teste de contrato:**
- What's not tested: A propriedade `solicitacoes_orcamento` retornada pelo hook não tem tipo nem teste.
- File: `src/pages/OrcamentosPage.tsx`
- Risk: Mudança no select do Supabase quebra a exibição de títulos silenciosamente.
- Priority: MEDIUM

---

*Concerns audit: 2026-05-09*
