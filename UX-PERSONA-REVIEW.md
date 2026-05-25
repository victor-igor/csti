# UX Persona Review — OrçaFácil/CSTI

**Data:** 2026-05-15
**Escopo:** Análise funcional/informacional da jornada Cliente e Prestador no sistema em produção.
**Método:** Journey walk em código, identificando gaps de informação, ação e fricção por step da jornada de cada persona.
**Baseline:** UI-REVIEW.md (24 findings, 23 no backlog Phase 1; F-18 avaliação pós-OS fora do escopo declarado mas identificado como gap crítico de negócio neste review).

---

## TL;DR — Top 10 gaps NOVOS (não cobertos pelo Phase 1)

| # | Severidade | Persona | Gap | Onde | Fix sugerido |
|---|-----------|---------|-----|------|--------------|
| 1 | 🔴 Critical | Prestador | Sem acesso ao contato do cliente mesmo após orçamento aprovado — OS criada mas sem telefone visível antes de abrir o detalhe da OS | `OrcamentosPage` / `OrcamentoDetailPage` | Exibir info do cliente no detalhe do orçamento aprovado; tornar telefone visível imediatamente após aprovação |
| 2 | 🔴 Critical | Ambos | Notificações não são clicáveis — não navegam para o registro relacionado | `NotificacoesPage` / `NotificacoesDrawer` | Adicionar `link_path` à tabela `notificacoes` e implementar navegação ao clicar na notificação |
| 3 | 🔴 Critical | Cliente | Após aprovar orçamento, cliente não sabe o que acontece a seguir — não há confirmação de próximo passo nem link direto para a OS recém-criada | `OrcamentoReviewPage` | Após `aprovar()` com sucesso, navegar diretamente para a OS criada ou mostrar banner "Sua OS foi criada — número: OS-XXXX" |
| 4 | 🔴 Critical | Prestador | Campo `observacoes` da OS (campo `ordens_servico.observacoes` existe no banco desde migration 4) nunca é exibido nem editável na interface | `OrdemServicoDetailPage` | Exibir `observacoes` no detalhe da OS; permitir que Prestador preencha ao longo da execução |
| 5 | 🟠 High | Ambos | Cards de OS na lista não exibem o nome da contraparte — Prestador não sabe de qual cliente é a OS; Cliente não sabe qual prestador está atendendo sem abrir o detalhe | `OrdemServicoCard` / `OrdemServicoListPage` | Incluir contraparte (nome) no card; requer join na query `useListOrdensServico` |
| 6 | 🟠 High | Prestador | Dashboard não mostra OS em andamento por cliente/prioridade — a stat "OS Ativas" é apenas um número sem drill-down útil | `DashboardPage` (PrestadorDashboard) | Adicionar lista das OS em andamento com nome do cliente e data de início ao "Ação necessária" |
| 7 | 🟠 High | Cliente | Perfil do prestador não tem área de atendimento/localidade — o cliente não sabe se o prestador atende na sua cidade antes de aprovar o orçamento | `OrcamentoReviewPage` / `profiles` | Adicionar coluna `cidade` ou `area_atendimento` à tabela `profiles`; exibir na review do orçamento |
| 8 | 🟠 High | Cliente | Avaliação pós-OS (F-18) fora do backlog Phase 1 mas é gap de negócio real — sem avaliação, não há feedback loop entre as partes | `OrdemServicoDetailPage` | F-18 é greenfield; criar tabela `avaliacoes` e exibir card de avaliação quando `status = 'concluida'` |
| 9 | 🟡 Medium | Prestador | Prestador não vê quantos orçamentos já enviou para a mesma solicitação, nem se outro prestador já enviou — sem contexto de competitividade | `SolicitacaoDetailDialog` (view prestador) | Exibir badge "X orçamentos já enviados" na solicitação (sem revelar os valores dos concorrentes) |
| 10 | 🟡 Medium | Ambos | Notificações não têm sub-tipo de ação claro — "os" aparece com ícone de chave mas não diz "OS iniciada", "OS concluída", etc. | `NotificacoesPage` / `NotificacoesDrawer` | Usar campo `tipo` com granularidade maior (`os_iniciada`, `os_concluida`) ou usar o campo `titulo` da notificação de forma mais descritiva |

---

## Persona 1: Cliente

### Jornada 1.1 — Onboarding

**Passos atuais (lido no código):**
`RegisterPage.tsx` coleta nome, email, senha, confirmação de senha, role (`cliente`/`prestador`), telefone (via `PhoneInput`) e especialidade (somente se role = prestador). Após registro bem-sucedido, `OnboardingWelcome.tsx` é disparado como `Dialog.Root` sobre o Dashboard; detecta usuário novo via heurística de timestamps (`created_at` vs `updated_at` < 60s) ou campo `onboarding_done` (que não existe no schema base — é tentado com `try/catch` silencioso). O onboarding é um dialog único com 3 ícones de feature (Solicitação → Orçamento → OS) sem interação além de "Começar".

**Gaps identificados:**
- 🟠 **[NOVO — N-01]** Onboarding não é diferenciado por role — Cliente e Prestador veem exatamente o mesmo texto genérico de 3 passos. O Prestador precisa entender que sua jornada começa em "Solicitações Disponíveis", não em "Nova Solicitação". — _Evidência:_ `src/pages/OnboardingWelcome.tsx` (dialog único sem verificação de `profile.role`) — _Sugestão:_ Dividir o conteúdo do dialog em dois scripts: um para `role = 'cliente'` (foco em "abrir solicitação") e outro para `role = 'prestador'` (foco em "encontrar oportunidades e enviar orçamento").
- 🟡 **[NOVO — N-02]** Campo `onboarding_done` não existe no schema (`20260429000001_schema.sql` + migration 4 não o definem), então o `localStorage` é o único mecanismo de controle. Se o usuário troca de dispositivo ou limpa o cache, o onboarding reaparece. — _Evidência:_ `src/pages/OnboardingWelcome.tsx:22–35` + ausência de `onboarding_done` em todas as migrations — _Sugestão:_ Adicionar `onboarding_done BOOLEAN DEFAULT false` à tabela `profiles` via nova migration. VERIFICAR EM USO REAL se o campo já foi adicionado manualmente.
- ✅ **[JÁ NO BACKLOG]** F-11 — Termos de uso + onboarding (01-10-PLAN.md)
- ✅ **[JÁ NO BACKLOG]** F-10 — Microcopy auth (01-01-PLAN.md)

### Jornada 1.2 — Abrir solicitação

**Passos atuais:**
`SolicitacaoFormPage.tsx` renderiza: Título (text, máx 100), Categoria (select com 6 opções), Equipamento (text, optional), Urgência (select), Prazo Desejado (date), Descrição (textarea). Formulário submetido via `useCreateSolicitacao`. Após envio, sem toast de sucesso explícito no form.

**Gaps identificados:**
- ✅ **[JÁ NO BACKLOG]** F-01 — Equipamento (implementado na 01-04-PLAN.md, que está marcada como concluída `[x]`)
- ✅ **[JÁ NO BACKLOG]** F-02 — Urgência + prazo (01-04-PLAN.md concluída)
- ✅ **[JÁ NO BACKLOG]** F-03 — Toast pós-submit (01-04-PLAN.md concluída)
- 🟡 **[NOVO — N-03]** Sem possibilidade de upload de foto/evidência — Cliente com equipamento com defeito físico visível (tela trincada, placa queimada) não consegue enviar imagem que ajudaria o Prestador a avaliar a complexidade antes de formular o orçamento. — _Evidência:_ `src/features/solicitacao/SolicitacaoFormPage.tsx` (nenhum campo de upload) + schema `solicitacoes_orcamento` sem coluna de anexo — _Sugestão:_ Adicionar campo `foto_url TEXT` (ou tabela `anexos_solicitacao`) e integrar upload ao Supabase Storage. Esta feature é greenfield.

### Jornada 1.3 — Esperar respostas (Solicitações / Notificações)

**Passos atuais:**
Cliente volta ao app e acessa `SolicitacoesPage` (não inspecionada diretamente, mas inferida como lista com `SolicitacaoCard` variant `cliente`). O Dashboard do Cliente exibe 3 StatCards: "Minhas Solicitações", "Orçamentos p/ Revisar" e "OS em Andamento", além de seção "Precisa de atenção" com orçamentos pendentes. `NotificacoesPage.tsx` exibe lista de notificações com mark-all-as-read.

**Gaps identificados:**
- 🔴 **[NOVO — N-04]** Notificações não são clicáveis — ao tocar em uma notificação sobre "Orçamento recebido", o usuário não é levado à tela do orçamento. A tabela `notificacoes` não tem coluna `link_path` ou `registro_id` (apenas `tipo`, `titulo`, `mensagem`, `lida`). Tanto `NotificacoesPage` quanto `NotificacoesDrawer` não implementam `onClick` com navegação. — _Evidência:_ `supabase/migrations/20260429000004_schema_complement.sql` (schema da tabela `notificacoes` sem `link_path`); `src/features/notificacoes/NotificacoesDrawer.tsx:70` (onClick sem navegação); `src/pages/NotificacoesPage.tsx` (sem navigate) — _Sugestão:_ Adicionar `link_path TEXT` à tabela `notificacoes`; ao inserir notificação, preencher o path (`/orcamentos/{id}/revisar`, `/ordens-servico/{id}` etc.); no `NotificacaoRow`, envolver com `<button onClick={() => navigate(n.link_path)}>` marcando como lida ao clicar.
- ✅ **[JÁ NO BACKLOG]** F-12 — NotificacoesPage funcional (01-02-PLAN.md)
- 🟡 **[NOVO — N-05]** Dashboard do Cliente não exibe o título da solicitação mais urgente ou a que está aguardando há mais tempo — o StatCard "Minhas Solicitações" é apenas um número sem contexto de qual está pendente de ação. — _Evidência:_ `src/pages/DashboardPage.tsx` (ClienteDashboard): `StatCard label="Minhas Solicitações"` sem lista de itens recentes com status de urgência. — _Sugestão:_ Adicionar seção "Sem resposta há mais de X dias" mostrando as 2–3 solicitações mais antigas com status `aberta` ou `aguardando_orcamento`.

### Jornada 1.4 — Avaliar e aprovar orçamento

**Passos atuais:**
`OrcamentoReviewPage.tsx` exibe: número do orçamento, status badge, itens com descrição/qtd/valor unitário/total, total em destaque, `UserCard` do Prestador (nome + especialidade), botões Aprovar/Recusar com `ConfirmDialog`. Ao recusar, campo de motivo (textarea opcional). Download PDF disponível. Prestador exibido: nome e especialidade (buscados via `useQuery` em `profiles`), sem telefone na tela de review.

**Gaps identificados:**
- 🟠 **[NOVO — N-06]** Prestador visível apenas por nome e especialidade — sem telefone, sem localização, sem histórico de OS concluídas. Cliente não tem como avaliar credibilidade do prestador antes de aprovar. — _Evidência:_ `src/features/orcamento/OrcamentoReviewPage.tsx:52–57` (`prestador.telefone` existe no objeto mas não é renderizado no `UserCard` — só vai para `prestadorPdf`); `profiles.telefone` existe no banco. — _Sugestão:_ Exibir `InfoRow label="Telefone"` no card do Prestador na OrcamentoReviewPage (após aprovação, pois pré-aprovação pode ser considerado prematuro). Adicionar contador "N OS concluídas" se futuro rating estiver disponível.
- 🟠 **[NOVO — N-07]** Após aprovar, não há indicação de qual OS foi criada — a mutation `aprovarOrcamento` cria automaticamente uma OS, mas a UI apenas redireciona (ou não navega) sem mostrar o número da nova OS ao cliente. — _Evidência:_ `src/features/orcamento/OrcamentoReviewPage.tsx:85–94` (ConfirmDialog de aprovação sem lógica pós-sucesso visível no JSX analisado; fluxo pós-aprovação não redireciona para `/ordens-servico/{id}`) — _Sugestão:_ Após `aprovar()` com sucesso, redirecionar para `/ordens-servico/{osId}` ou exibir toast com link "Ver OS criada — OS-2026-XXXX".
- 🟠 **[NOVO — N-07b]** Comparação entre múltiplos orçamentos é impossível — se uma solicitação recebeu 2+ orçamentos, o Cliente não tem tela de comparação lado a lado; só vê um de cada vez via lista. — _Evidência:_ `src/pages/OrcamentosPage.tsx` (OrcamentosCliente renderiza lista simples de cards individuais sem agrupamento por solicitação) — _Sugestão:_ Agrupar orçamentos por solicitação na OrcamentosPage do Cliente, permitindo "ver todos os orçamentos desta solicitação" em tela de comparação. Greenfield de média complexidade.
- ✅ **[JÁ NO BACKLOG]** F-20 — Motivo de recusa (01-08-PLAN.md)

### Jornada 1.5 — Acompanhar a OS

**Passos atuais:**
`OrdemServicoDetailPage.tsx` exibe: número, StatusBadge, InfoCards (Status, Criado em, Início, Conclusão), links "Ver Solicitação" / "Ver Orçamento", seção de contraparte (nome + especialidade se prestador + telefone clicável), StatusTimeline do histórico. Cliente não tem nenhum botão de ação além de visualizar.

**Gaps identificados:**
- 🟡 **[NOVO — N-08]** Campo `observacoes` da OS existe no banco (`ordens_servico.observacoes TEXT`, migration 4) mas nunca é exibido na `OrdemServicoDetailPage` — tanto para leitura pelo Cliente quanto para edição pelo Prestador. — _Evidência:_ grep de `observacoes` em `src/features/ordem-servico/OrdemServicoDetailPage.tsx` retorna zero resultados; `supabase/migrations/20260429000004_schema_complement.sql:22` confirma que a coluna existe. — _Sugestão:_ Exibir `observacoes` como seção "Observações do Prestador" no detalhe da OS; adicionar textarea editável (somente Prestador) enquanto status for `em_andamento`.
- 🟡 **[NOVO — N-09]** Cliente sem nenhuma ação enquanto OS está `em_andamento` — sem como reportar problema, confirmar presença do técnico ou solicitar reagendamento. — _Evidência:_ `src/features/ordem-servico/OrdemServicoDetailPage.tsx` (bloco condicional de botões existe apenas para `isPrestador`) — _Sugestão:_ Adicionar botão "Reportar problema" (abre textarea para envio de mensagem/notificação ao Prestador). Requer chat in-app ou sistema de mensagens — greenfield.
- ✅ **[JÁ NO BACKLOG]** F-06 — Contatos cruzados na OS (01-07-PLAN.md)
- ✅ **[JÁ NO BACKLOG]** F-17 — Contatos cruzados na OS (01-07-PLAN.md)

### Jornada 1.6 — Finalizar (Avaliação pós-OS)

**Passos atuais:**
Quando `status = 'concluida'`, o cliente vê a OS estática. Não existe fluxo de avaliação. Não existe tabela `avaliacoes` no schema. F-18 foi explicitamente colocado fora do escopo do Phase 1.

**Gaps identificados:**
- 🔴 **[NOVO — N-10 / confirmação de F-18]** Ausência total de avaliação pós-serviço é gap crítico de negócio para uma plataforma de marketplace de TI — sem rating, prestadores não têm incentivo de qualidade e clientes não têm como escolher com base em reputação. — _Evidência:_ Schema sem tabela `avaliacoes`; `OrdemServicoDetailPage.tsx` sem bloco de avaliação. — _Sugestão:_ Criar tabela `avaliacoes (id, os_id, avaliador_id, avaliado_id, nota INT CHECK(1-5), comentario TEXT, created_at)` + card de avaliação condicional em `OrdemServicoDetailPage` quando `status = 'concluida'` e `avaliacao_id IS NULL`. Greenfield, Onda B.

### Jornada 1.7 — Perfil/conta

**Passos atuais:**
`PerfilPage.tsx` e `PerfilModal.tsx` exibem nome, email (leitura), telefone (com máscara via `PhoneInput`), especialidade (texto livre, só para prestador), botão "Trocar Senha". Sem avatar real — apenas inicial gerada. Sem exclusão de conta.

**Gaps identificados:**
- 🟡 **[NOVO — N-11]** Sem opção de exclusão/desativação de conta — usuário que deseja sair da plataforma não tem caminho self-service. Relevante para conformidade com LGPD. — _Evidência:_ `src/pages/PerfilPage.tsx` (nenhuma seção de "Zona de perigo") — _Sugestão:_ Adicionar "Solicitar exclusão de conta" com modal de confirmação; internamente marcar `deleted_at` em `profiles` ou enviar email para administrador. Greenfield.
- ✅ **[JÁ NO BACKLOG]** F-13 — Email read-only (01-01-PLAN.md)
- ✅ **[JÁ NO BACKLOG]** F-14 — Máscara telefone (01-09-PLAN.md)
- ✅ **[JÁ NO BACKLOG]** F-15 — Troca senha (01-09-PLAN.md)

---

## Persona 2: Prestador

### Jornada 2.1 — Onboarding como prestador

**Passos atuais:**
`RegisterPage.tsx` exibe campo "Especialidade" condicionalmente quando `role = 'prestador'` (texto livre, placeholder "Ex: Redes, Hardware, Suporte"). O campo `especialidade` existe em `profiles` (migration 4). Não existe campo de área de atendimento, cidade, CNPJ/CPF ou portfólio no cadastro. `documento TEXT` existe na migration 4 mas não aparece em nenhum form.

**Gaps identificados:**
- 🟠 **[NOVO — N-12]** Especialidade é texto livre sem validação ou sugestão — Prestador pode digitar "Informatica" (sem acento), "TI geral", "hardware e software" em formatos inconsistentes, dificultando o filtro por categoria no `SolicitacaoListPrestadorPage`. — _Evidência:_ `src/features/auth/RegisterPage.tsx:60–68` (FormField type="text" sem select/autocomplete); `src/features/perfil/PerfilModal.tsx:46–50` (mesma inconsistência) — _Sugestão:_ Substituir input livre por MultiSelect alinhado com as categorias de `solicitacoes_orcamento` (hardware, software, rede, segurança, suporte, outro). Campo `especialidade` pode ser `TEXT[]` no banco ou manter TEXT com valor CSV controlado.
- 🟠 **[NOVO — N-13]** Sem campo de localidade/área de atendimento — Prestador não informa em qual cidade ou região atua. Cliente aprova um orçamento sem saber se o técnico pode atender presencialmente. — _Evidência:_ Schema `profiles` (sem `cidade`, `estado` ou `area_atendimento`); `OrcamentoReviewPage.tsx` (UserCard exibe apenas nome e especialidade) — _Sugestão:_ Adicionar `cidade TEXT` e `estado CHAR(2)` a `profiles`; exibir no card do prestador na review do orçamento. Greenfield de baixa complexidade.
- ✅ **[JÁ NO BACKLOG]** F-11 — Onboarding (01-10-PLAN.md)

### Jornada 2.2 — Encontrar trabalho (Lista de Solicitações)

**Passos atuais:**
`SolicitacaoListPrestadorPage.tsx` exibe `SolicitacaoCard` variant `prestador` com: número, título, categoria (chip), equipamento (se preenchido), `cliente_nome` (se disponível no objeto), urgência (UrgenciaBadge), prazo desejado. Filtros por categoria e urgência. Busca por título ou número.

**Gaps identificados:**
- 🟡 **[NOVO — N-14]** Sem informação de localidade do cliente na lista — Prestador não sabe se a solicitação é para atendimento presencial na sua cidade ou remoto. — _Evidência:_ `src/features/solicitacao/components/SolicitacaoCard.tsx:60` (campos exibidos: numero, titulo, categoria, equipamento, cliente_nome, urgencia, prazo_desejado — sem cidade/localidade) — _Sugestão:_ Exibir cidade do cliente (se disponível em `profiles.cidade` — campo que também precisa ser criado) no card da solicitação para o prestador. Depende de N-13.
- 🟡 **[NOVO — N-15]** Lista de solicitações do prestador não tem ordenação configurável — padrão é provavelmente `created_at DESC`. Prestador não consegue ordenar por urgência ou prazo para priorizar as mais urgentes. — _Evidência:_ `src/features/solicitacao/SolicitacaoListPrestadorPage.tsx` (sem controle de ordenação no JSX) — _Sugestão:_ Adicionar select de ordenação: "Mais recentes", "Mais urgentes", "Prazo mais próximo".

### Jornada 2.3 — Avaliar uma solicitação ⚠️

**Passos atuais:**
Ao clicar em uma solicitação, `SolicitacaoDetailDialog.tsx` abre exibindo: número (header), título, descrição, equipamento (se preenchido, com ícone Wrench), histórico de status (StatusTimeline), InfoCards laterais: Status, Categoria, Criado em, Urgência, Prazo Desejado. Para o Prestador: botão "Criar Orçamento" (se status permitir). Não há nome completo do cliente, telefone do cliente, ou qualquer forma de contato pré-orçamento.

**Gaps identificados:**
- 🔴 **[JÁ MAPEADO PARCIALMENTE EM F-06 + F-17, mas há agravante NOVO]** O `SolicitacaoDetailDialog` não exibe o nome do cliente para o Prestador. O campo `cliente_nome` aparece no card da lista (`SolicitacaoCard:61`), mas no dialog de detalhe a coluna lateral não inclui essa informação. Além disso, o `cliente_id` (UUID) está disponível no objeto `ISolicitacao` via `solicitacoes_orcamento.cliente_id`, mas o perfil do cliente não é buscado com join neste contexto. — _Evidência:_ `src/features/solicitacao/SolicitacaoDetailDialog.tsx:85–125` (InfoCards laterais: Status, Categoria, Criado em, Urgência, Prazo — sem Cliente) — _Sugestão:_ Carregar `profiles` do `cliente_id` na query do dialog (join ou query separada); exibir "Cliente: [nome]" como InfoCard lateral. Não expor telefone pré-orçamento (privacidade); revelar após envio de orçamento.
- 🟡 **[NOVO — N-09b]** Prestador não sabe quantos outros orçamentos já foram enviados para a mesma solicitação — sem contexto de concorrência. — _Evidência:_ `src/features/solicitacao/SolicitacaoDetailDialog.tsx` (sem query de contagem de orçamentos para a solicitação) — _Sugestão:_ Exibir badge "2 orçamentos já enviados" (sem revelar valores/prestadores concorrentes). Dado disponível via `COUNT(*) FROM orcamentos WHERE solicitacao_id = X AND deleted_at IS NULL`.

### Jornada 2.4 — Enviar orçamento

**Passos atuais:**
`OrcamentoFormPage.tsx` exibe: cabeçalho com número e título da solicitação + descrição (2 linhas), itens dinâmicos (descrição, quantidade, valor unitário), observações, prazo em dias, botões "Salvar Rascunho" e "Enviar Orçamento".

**Gaps identificados:**
- 🟡 **[NOVO — N-16]** OrcamentoFormPage mostra apenas título + descrição truncada da solicitação — não mostra categoria, equipamento, urgência e prazo desejado do cliente. Prestador precisa abrir outra aba para rever o problema antes de precificar. — _Evidência:_ `src/features/orcamento/OrcamentoFormPage.tsx:117–128` (renderiza `solicitacao.numero`, `solicitacao.titulo`, `solicitacao.descricao` com `line-clamp-2` — nenhum dos campos de contexto adicionais) — _Sugestão:_ Expandir a seção de contexto da solicitação no form para incluir categoria (chip), equipamento e urgência.
- ✅ **[JÁ NO BACKLOG]** F-07 — Grid responsivo (01-05-PLAN.md)
- ✅ **[JÁ NO BACKLOG]** F-08 — Total fixo mobile (01-05-PLAN.md)
- ✅ **[JÁ NO BACKLOG]** F-09 — Toast rascunho (01-05-PLAN.md)
- ✅ **[JÁ NO BACKLOG]** F-19 — Editar rascunho (01-05-PLAN.md)

### Jornada 2.5 — OS aprovada (contatar cliente e agendar)

**Passos atuais:**
`OrcamentoDetailPage.tsx` (prestador) exibe: número, status, prazo, observações, itens, total. Quando `status = 'aceito'`, há botão "Criar OS" no Dashboard (`ActionItem` com `ctaLabel="Criar OS"`). No detalhe do orçamento, não há link direto para "Criar OS" — a lógica está no Dashboard. `OrdemServicoDetailPage.tsx` exibe a contraparte (cliente) com nome e telefone clicável quando OS está criada.

**Gaps identificados:**
- 🔴 **[NOVO — N-17]** Prestador não tem acesso ao telefone do cliente na tela do orçamento aprovado — para agendar a visita, precisa navegar até a OS correspondente (que pode não ter sido criada ainda, ou estar em outro caminho). O `OrcamentoDetailPage` não exibe dados do cliente; o `OrcamentoReviewPage` (do lado do cliente) tem o prestador, mas o inverso não existe. — _Evidência:_ `src/features/orcamento/OrcamentoDetailPage.tsx` (sem query de `profiles` do `cliente_id`; o orçamento tem `solicitacao_id → cliente_id` mas não é resolvido) — _Sugestão:_ Ao `status = 'aceito'`, exibir bloco "Cliente" com nome e telefone na `OrcamentoDetailPage` do prestador. Dado disponível via join: `orcamentos.solicitacao_id → solicitacoes_orcamento.cliente_id → profiles`.
- 🟡 **[NOVO — N-18]** Sem botão "Criar OS" diretamente no `OrcamentoDetailPage` do prestador — apenas no Dashboard. Se o prestador navega direto pelo menu "Orçamentos", não há CTA para criar a OS a partir do orçamento aceito. — _Evidência:_ `src/features/orcamento/OrcamentoDetailPage.tsx:95–135` (CTAs condicionais: "Editar Rascunho" + "Enviar Orçamento" quando `rascunho`; sem CTA quando `aceito`) — _Sugestão:_ Adicionar botão "Criar Ordem de Serviço" condicionalmente quando `status = 'aceito'` na `OrcamentoDetailPage`.

### Jornada 2.6 — Executar serviço (atualizar status)

**Passos atuais:**
`OrdemServicoDetailPage.tsx`: Prestador vê StatusTimeline, InfoCards e botão "Iniciar Atendimento" ou "Marcar como Concluída" via `StickyActionBar` (Phase 3 plan confirma que este botão já foi adicionado). Campo `observacoes` existe no banco mas não aparece na UI.

**Gaps identificados:**
- 🔴 **[NOVO — N-04 — confirmado aqui também]** Campo `observacoes` da OS existe no banco mas nunca é exibido nem editável — Prestador não consegue registrar o diagnóstico, peças substituídas ou resultado do serviço. Esse dado é importante tanto para o relatório do cliente quanto para histórico do prestador. — _Evidência:_ `supabase/migrations/20260429000004_schema_complement.sql:22` (`ordens_servico.observacoes TEXT`); grep de `observacoes` em `OrdemServicoDetailPage.tsx` retorna zero resultados. — _Sugestão:_ Seção "Observações do atendimento" editável (textarea) no detalhe da OS, salva via `UPDATE ordens_servico SET observacoes = $1`. Exibida em modo leitura para o Cliente.
- 🟡 **[NOVO — N-19]** Status histórico da OS não captura quem fez a mudança de forma legível — `status_historico.usuario_id` existe mas a `StatusTimeline` exibe apenas "status_anterior → status_novo" sem o nome do agente. — _Evidência:_ `src/features/solicitacao/SolicitacaoDetailDialog.tsx` e `OrdemServicoDetailPage.tsx` (ambos usam `StatusTimeline` passando `historico`; sem resolução de `usuario_id` para nome) — _Sugestão:_ Join na query de histórico para buscar `profiles.nome` via `usuario_id`; exibir "Iniciado por [Nome do Prestador] em DD/MM" na timeline.

### Jornada 2.7 — Concluir e ver histórico

**Passos atuais:**
Prestador marca "Marcar como Concluída" via ConfirmDialog. OS muda para `concluida`. Sem campo para registrar resultado final além do status.

**Gaps identificados:**
- 🟠 **[JÁ IDENTIFICADO EM F-18, agravante NOVO]** Sem avaliação bidirecional — Prestador também não pode avaliar o Cliente (pagamento atrasado, acesso dificultado, informações incorretas). Sistemas de marketplace maduros têm avaliação em ambas as direções. — _Sugestão:_ Ao criar tabela `avaliacoes` (ver N-10), incluir `tipo_avaliador ENUM('cliente_avalia_prestador', 'prestador_avalia_cliente')`.

### Jornada 2.8 — Dashboard de operação

**Passos atuais:**
`DashboardPage.tsx` (PrestadorDashboard): 4 StatCards — "Solicitações Disponíveis", "Aguardando Resposta", "Aceitos este mês", "OS Ativas". Seção "Ação necessária" com: lista de orçamentos aprovados (CTA "Criar OS") + lista de novas oportunidades (CTA "Orçar"). Gráfico de métricas de orçamentos por mês (`OrcamentosMetricsChart`).

**Gaps identificados:**
- 🟠 **[NOVO — N-20]** StatCard "OS Ativas" é número sem drill-down imediato — não mostra quais OS estão ativas, quais estão atrasadas (sem previsão de conclusão), ou quais precisam de ação. O Prestador precisa clicar em "OS Ativas" para ir à lista e aí ver as OS sem ordem de prioridade. — _Evidência:_ `src/pages/DashboardPage.tsx:PrestadorDashboard` (`StatCard label="OS Ativas" to="/ordens-servico"` — apenas link) — _Sugestão:_ Adicionar ao "Ação necessária" um terceiro grupo "OS em andamento há mais de X dias" com CTA "Ver OS".
- 🟡 **[NOVO — N-21]** Receita total/mês não está no Dashboard — Prestador não tem visão de faturamento estimado (soma dos orçamentos aceitos). O gráfico mostra volume de orçamentos por status, não valor monetário. — _Evidência:_ `src/pages/DashboardPage.tsx` (StatCards e `OrcamentosMetricsChart` — sem soma de `itens_orcamento.valor_total`) — _Sugestão:_ Adicionar StatCard "Faturamento este mês" com soma de `itens_orcamento.valor_total` dos orçamentos `aceitos` do mês.
- ✅ **[JÁ NO BACKLOG]** F-21 — StatCard prestador (01-01-PLAN.md)

### Jornada 2.9 — Perfil profissional

**Passos atuais:**
`PerfilModal.tsx` / `PerfilPage.tsx`: Campos editáveis: nome, telefone, especialidade (texto livre, só se prestador). Campo `documento` existe no banco mas não aparece em nenhum form.

**Gaps identificados:**
- 🟠 **[NOVO — N-12 confirmado aqui]** Especialidade é texto livre sem orientação ou categorização — já descrito em N-12.
- 🟡 **[NOVO — N-22]** Campo `documento` (CPF/CNPJ) existe no banco mas nunca é coletado ou exibido — Prestadores que emitem nota fiscal precisam desse dado; clientes que precisam de comprovação de contratação também. — _Evidência:_ `supabase/migrations/20260429000004_schema_complement.sql:6` (`profiles.documento TEXT`); grep em todos os forms retorna zero resultados. — _Sugestão:_ Adicionar campo CPF/CNPJ no `PerfilPage` para prestadores, com máscara de formatação.

---

## Gaps cross-persona / sistema

### Chat/Mensagens in-app
- 🟠 **[NOVO — N-23]** Não existe canal de comunicação direta entre Cliente e Prestador dentro do app — toda negociação de detalhes, reagendamento ou dúvidas precisa acontecer fora da plataforma (WhatsApp, telefone). Isso gera perda de contexto e elimina a responsabilidade da plataforma sobre o atendimento. — _Sugestão:_ Canal de mensagens mínimo: tabela `mensagens (id, os_id, remetente_id, conteudo, created_at)` com listagem simples no detalhe da OS para ambas as partes. Greenfield, Onda B.

### Busca global
- 🟡 **[NOVO — N-24]** Não existe busca global no sistema — usuário com muitas solicitações/OS/orçamentos não consegue pesquisar por número de OS, nome de cliente, ou equipamento sem navegar menu a menu. — _Sugestão:_ Barra de busca global no TopBar que pesquisa simultaneamente em `solicitacoes_orcamento.numero`, `ordens_servico.numero`, `orcamentos.numero`.

### Exportação / Relatórios
- 🟡 **[NOVO — N-25]** Prestador não tem como exportar relatório de atividade (histórico de OS concluídas, faturamento) — útil para declaração de renda ou apresentação a clientes corporativos. — _Sugestão:_ Botão "Exportar CSV" no histórico de OS concluídas. Dado disponível via query existente.

### Realtime / Push
- 🟠 **[NOVO — N-26]** Notificações são apenas consultas periódicas (polling via `useQuery`) — sem Supabase Realtime habilitado para a tabela `notificacoes`, o usuário só recebe notificações ao reabrir o app. — _Evidência:_ `src/features/notificacoes/useNotificacoes.ts` (usa `useQuery` padrão sem `.on('postgres_changes', ...)`) — _Sugestão:_ Habilitar `supabase.channel('notificacoes').on('postgres_changes', ...)` no hook `useNotificacoesNaoLidas` para atualizar o badge em tempo real.

---

## Recomendação de roadmap

### Onda A — Críticos (1 sprint, ~5–8 dias)

| Gap | Effort estimado | Conexão com roadmap |
|-----|----------------|---------------------|
| N-04: Notificações clicáveis com `link_path` | M (migração + hook + UI) | Estende F-12 (01-02-PLAN.md) |
| N-17: Telefone do cliente no orçamento aceito (prestador) | S (join + InfoRow) | Estende F-06/F-17 (01-07-PLAN.md) |
| N-07: Redirecionar para OS após aprovação | XS (lógica pós-mutação) | Estende F-04 (01-06-PLAN.md) |
| N-04/N-08: Campo `observacoes` da OS na UI | S (exibir + textarea editável) | Phase 3 (03-01-PLAN.md) está em escopo; observacoes não está |

### Onda B — Altos (2–3 sprints)

| Gap | Effort estimado | Conexão com roadmap |
|-----|----------------|---------------------|
| N-10: Sistema de avaliação pós-OS (F-18) | L (nova tabela + UI + lógica) | Greenfield — candidato a Phase 4 |
| N-23: Chat/mensagens in-app na OS | L (nova tabela + UI) | Greenfield — candidato a Phase 5 |
| N-26: Realtime para notificações | M (Supabase channel + hook) | Estende Phase 2 (padronizar erros) |
| N-07b: Comparação de orçamentos | M (nova view agrupada) | Greenfield — candidato a Phase 2/3 |
| N-13: Campo de localidade em `profiles` | S (migração + form) | Greenfield — adicionar na Phase 3 |
| N-20: OS ativas com contexto no Dashboard prestador | S (nova query + DashboardSection) | Estende F-21 (01-01-PLAN.md) |
| N-18: Botão "Criar OS" no OrcamentoDetailPage | XS (CTA condicional) | Estende 01-07-PLAN.md |
| N-21: StatCard faturamento do mês | S (nova query + StatCard) | Estende F-21 (01-01-PLAN.md) |

### Onda C — Polish (backlog contínuo)

| Gap | Effort | Conexão |
|-----|--------|---------|
| N-01: Onboarding diferenciado por role | S | F-11 (01-10-PLAN.md) |
| N-02: `onboarding_done` no banco | XS (migration) | F-11 |
| N-03: Upload de foto na solicitação | M | Greenfield |
| N-05: Solicitações sem resposta há X dias no Dashboard | S | Greenfield |
| N-09b: Contagem de orçamentos na solicitação | S | Estende SolicitacaoDetailDialog |
| N-11: Exclusão de conta (LGPD) | M | Greenfield |
| N-12: Especialidade como MultiSelect | S | F-14/PerfilModal |
| N-14: Localidade na lista de solicitações | XS (depende de N-13) | Greenfield |
| N-15: Ordenação na lista de solicitações | S | Estende F-22 (01-03-PLAN.md) |
| N-16: Contexto completo da solicitação no form de orçamento | XS | Greenfield |
| N-19: Nome do agente na StatusTimeline | S | Greenfield |
| N-22: Campo CPF/CNPJ no perfil | S | Greenfield |
| N-24: Busca global | M | Greenfield |
| N-25: Exportar CSV de OS | S | Greenfield |

---

## Apêndice: o que está bem feito

1. **Separação de jornadas por role com dados corretos**: O `SolicitacaoCard` variant `prestador` já exibe `cliente_nome`, urgência e prazo; o `OrdemServicoDetailPage` já resolve a contraparte corretamente (`isPrestador ? data.cliente : data.prestador`) com telefone clicável — a estrutura de dados para o caso cross-contato na OS está certa.

2. **Sistema de Estados (Loading / Error / Empty) consistente em todas as listas**: Todas as páginas de lista usam `LoadingSkeleton`, `ErrorState` com retry e `EmptyState` com mensagem contextual. O padrão é sólido e bem padronizado.

3. **Dashboard com "Ação necessária" priorizando o trabalho do dia**: O PrestadorDashboard agrupa orçamentos aprovados (CTA "Criar OS") separados de novas oportunidades, e o ClienteDashboard destaca orçamentos pendentes com data de vencimento — boa tomada de decisão de hierarquia de informação.

4. **Supabase RLS + triggers de auditoria**: O schema base tem RLS em todas as tabelas, triggers automáticos de `status_historico` e `updated_at`, e numeração automática de documentos — fundação de segurança e rastreabilidade sólida para o ciclo de vida dos registros.

5. **Design System com tokens semânticos aplicados consistentemente**: `bg-card`, `border-border`, `text-muted-foreground`, `shadow-card` e `StatusBadge` são usados de forma coerente nos cards de lista. A hierarquia visual de número (mono pequeno) → título (semibold) → metadados (muted) funciona bem em todos os cards.
