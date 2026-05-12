# UI-REVIEW — OrçaFácil
**Auditado em:** 2026-05-11
**Escopo:** Auditoria completa — todas as telas, dois tipos de usuário (cliente e prestador)
**Screenshots:** Não capturados (servidor de desenvolvimento não detectado — auditoria por análise de código)

---

## Sumário Executivo

O OrçaFácil possui uma base técnica sólida: design system com tokens Stripe-inspired, componentes atoms/molecules reutilizáveis, estados de loading/error/empty implementados de forma consistente nas listas principais e separação clara de rotas por papel (cliente/prestador via RoleGuard). A estrutura de navegação mobile-first com BottomNav + TopBar é bem pensada para o contexto de uso em campo.

Os problemas críticos, porém, são de fluxo e completude funcional — não apenas estéticos. O formulário de solicitação não coleta campos que já existem no banco (`equipamento`), o que força o código de detalhes a usar cast `any`. A única tela de notificações é um `<EmptyState>` estático com um hook `useNotificacoes` que existe mas nunca é chamado. O cliente fica completamente passivo na tela de OS — sem ação, sem contexto do prestador, sem avaliação. O OrcamentoFormPage quebra em mobile por conta de um grid de colunas absolutas que ultrapassa a viewport. Essas não são lacunas de polish: são bloqueadores de usabilidade real para os dois tipos de usuário.

Em suma: a infraestrutura está bem construída, mas várias telas estão funcionalmente incompletas para o fluxo de negócio end-to-end. O investimento para completar o core UX é estimado em 2–3 semanas de desenvolvimento focado.

---

## Scores por Pilar

| Pilar | Score | Verdict |
|-------|-------|---------|
| Hierarquia Visual | 3/4 | Cards, timeline e StatCards com boa hierarquia; padding duplo AppShell+pages estreita o layout |
| Fluxos de Usuário | 1/4 | Múltiplos fluxos críticos incompletos: notificações mortas, cliente sem cancelar, OS sem avaliação, form sem campos do banco |
| Empty States | 3/4 | Cobertura boa nas listas; NotificacoesPage é o único empty state que nunca se resolve |
| Responsividade | 2/4 | OrcamentoFormPage quebra em mobile; TopBar com left offset fixo; total do orçamento some em mobile |
| Microcopy | 2/4 | Status raw em ConfirmDialog, link de auth quebrado, sem máscara de telefone, especialidade sem orientação |
| Consistência de Componentes | 2/4 | Dois sistemas de botão, cast `any` expondo tipo incompleto, rota OS duplicada em App.tsx |

**Overall: 13/24**

---

## Análise por Tela

### PerfilPage (`/pages/PerfilPage.tsx`)
**OK:** Nome, telefone, especialidade (prestador), botão salvar, UserCard com nome e role.
**Faltando:** Email não exibido em lugar nenhum. Sem avatar/iniciais geradas. Sem troca de senha. Sem exclusão de conta. Telefone sem máscara. Especialidade como texto livre sem orientação. Role não alterável sem aviso explicando. Sem histórico do usuário.
**Findings:** F-13, F-14, F-15

### SolicitacaoFormPage (`/features/solicitacao/SolicitacaoFormPage.tsx`)
**OK:** titulo, descricao, categoria (select com enum correto), validação via zod.
**Faltando:** Campo `equipamento` existe no banco mas não é coletado. Sem urgência. Sem prazo desejado. Sem upload de evidência. Sem feedback pós-submit. Botão submit inline (`<button className="...bg-primary...">`), não usa `<Button>` do shadcn.
**Findings:** F-01, F-02, F-03

### SolicitacaoDetailPage (`/features/solicitacao/SolicitacaoDetailPage.tsx`)
**OK:** titulo, descricao, categoria, created_at, StatusTimeline, link para orçamento quando enviado, botão criar orçamento (prestador).
**Faltando:** Cliente não pode cancelar quando status é 'aberta'. `(solicitacao as any).equipamento` — cast any denuncia tipo incompleto. Prestador não vê quem criou a solicitação. Urgência não exibida. Sem empty state para histórico vazio.
**Findings:** F-04, F-16

### OrdemServicoDetailPage (`/features/ordem-servico/OrdemServicoDetailPage.tsx`)
**OK:** numero, status, data_inicio, data_conclusao, StatusTimeline, botão Iniciar/Concluir (prestador).
**Faltando:** Sem link para solicitação original. Sem link para orçamento que gerou a OS. Sem info do prestador para o cliente. Sem info do cliente para o prestador. Sem observações de execução. ConfirmDialog exibe status raw. Cliente sem nenhuma ação. Sem avaliação pós-conclusão.
**Findings:** F-05, F-06, F-17, F-18

### OrcamentoFormPage (`/features/orcamento/OrcamentoFormPage.tsx`)
**OK:** solicitação readonly, prazo_dias, observacoes, itens dinâmicos, salvar rascunho + enviar.
**Faltando:** Grid `grid-cols-[2fr_1fr_1fr_auto]` quebra em mobile. Total some em mobile (apenas `lg:sticky`). Sem `validade_ate`. Sem validação mínima de 1 item. Após "Salvar Rascunho" sem toast de confirmação.
**Findings:** F-07, F-08, F-09

### OrcamentoDetailPage (`/features/orcamento/OrcamentoDetailPage.tsx`)
**OK:** status, prazo_estimado_dias, created_at, link para OS (se existir), observacoes, itens, total, PDF download, botão "Enviar ao Cliente".
**Faltando:** Sem botão "Editar" quando rascunho. Sem link para solicitação de origem. Sem `validade_ate`. Sem info do cliente para o prestador.
**Findings:** F-19

### OrcamentoReviewPage (`/features/orcamento/OrcamentoReviewPage.tsx`)
**OK:** itens, total destacado, prazo, observações, UserCard prestador, Aprovar/Recusar, PDF download.
**Faltando:** Sem validade exibida. Após recusar, sem motivo de recusa. Sem dados de contato do prestador além do nome.
**Findings:** F-20

### DashboardPage (`/pages/DashboardPage.tsx`)
**OK:** StatCards por role, "Precisa de Atenção" (solicitações abertas para prestador), fluxo vazio com CTA role-aware.
**Faltando:** StatCard "Meus Orçamentos" soma rascunhos + enviados — número enganoso. Cliente sem widget de OS ativa. Prestador sem OS em andamento em atraso.
**Findings:** F-21

### RegisterPage (`/features/auth/RegisterPage.tsx`)
**OK:** Campos de registro, separação cliente/prestador.
**Faltando:** Microcopy quebrado no link. Sem aceite de termos. Telefone sem máscara. Sem indicador de força de senha. Sem onboarding pós-registro.
**Findings:** F-10, F-11

### NotificacoesPage (`/pages/NotificacoesPage.tsx`)
**OK:** Estrutura de rota existe.
**Faltando:** Conteúdo inteiro é `<EmptyState>` estático. `useNotificacoes.ts` existe mas não é importado. Bell na TopBar tem `title="Notificações (em breve)"` — placeholder assumido.
**Findings:** F-12

### SolicitacaoListPrestadorPage (`/features/solicitacao/SolicitacaoListPrestadorPage.tsx`)
**OK:** Busca por título/número, grid de cards, estados de loading/error/empty.
**Faltando:** Sem filtro por categoria. Sem filtro por urgência. Urgência não exibida nos cards. Sem ordenação (mais recentes vs mais antigas).
**Findings:** F-22

### OrdemServicoListPage (`/features/ordem-servico/OrdemServicoListPage.tsx`)
**OK:** Filtro por status, busca por número, estados de loading/error/empty.
**Faltando:** Busca só por número — não por descrição ou nome do cliente. A rota `/ordens-servico` e `/ordens-servico/*` estão duplicadas em `App.tsx` (linhas 71 e 73), causando comportamento imprevisível de matching.
**Findings:** F-23

### OrcamentosPage (`/pages/OrcamentosPage.tsx`)
**OK:** Role-switch entre cliente e prestador, filtros por status diferenciados, busca por número.
**Faltando:** Cliente filtra apenas por status — sem filtro por valor ou data. Busca por número só, não por título da solicitação relacionada.
**Findings:** (coberto em F-19)

---

## Findings Detalhados

### F-01 — SolicitacaoFormPage não coleta campo `equipamento` que existe no banco
- **Tela:** SolicitacaoFormPage (`src/features/solicitacao/SolicitacaoFormPage.tsx`)
- **Pilar:** Fluxos de Usuário
- **Severity:** CRITICAL
- **Effort:** S (2–4h)
- **Problema:** O schema `CreateSolicitacaoSchema` define apenas `titulo`, `descricao` e `categoria`. Contudo, `SolicitacaoDetailPage` acessa `(solicitacao as any).equipamento` com cast `any`, revelando que o campo existe no banco mas nunca é coletado. O tipo `ISolicitacao` não inclui `equipamento`, perpetuando o cast inseguro e impedindo que o prestador saiba qual equipamento está com problema.
- **Fix:** Adicionar ao schema e ao tipo:
  ```ts
  // solicitacaoSchemas.ts
  equipamento: z.string().max(200, 'Máximo 200 caracteres').optional(),
  // types/domain.ts — ISolicitacao
  equipamento?: string
  ```
  Adicionar campo de texto no form entre `categoria` e `descricao`. Remover cast `(solicitacao as any).equipamento` em SolicitacaoDetailPage.

---

### F-02 — Formulário de solicitação sem campos de urgência e prazo
- **Tela:** SolicitacaoFormPage
- **Pilar:** Fluxos de Usuário
- **Severity:** CRITICAL
- **Effort:** M (1–2d)
- **Problema:** O prestador recebe solicitações sem saber urgência nem prazo desejado, o que força orçamentos genéricos com folgas de prazo desnecessárias. A ausência de urgência também impede que o Dashboard do prestador priorize itens críticos.
- **Fix:**
  ```ts
  // solicitacaoSchemas.ts
  urgencia: z.enum(['baixa', 'media', 'urgente']).default('media'),
  prazo_desejado: z.string().optional(), // ISO date
  ```
  No form, adicionar grupo de radio com ícones coloridos para urgência (verde/amarelo/vermelho) e um date picker opcional para prazo. Exibir ambos em SolicitacaoDetailPage e nos cards da lista do prestador.

---

### F-03 — Submit do formulário de solicitação sem feedback pós-envio
- **Tela:** SolicitacaoFormPage
- **Pilar:** Fluxos de Usuário
- **Severity:** HIGH
- **Effort:** XS (<1h)
- **Problema:** Após submit bem-sucedido, o form redireciona silenciosamente para a lista de solicitações sem nenhum toast ou tela de confirmação. O `Toaster` já está configurado globalmente em `App.tsx` com `sonner`, mas não é chamado aqui.
- **Fix:**
  ```tsx
  import { toast } from 'sonner'
  // Na mutation onSuccess:
  toast.success('Solicitação enviada com sucesso!')
  navigate('/solicitacoes')
  ```

---

### F-04 — Cliente não pode cancelar solicitação quando status é 'aberta'
- **Tela:** SolicitacaoDetailPage
- **Pilar:** Fluxos de Usuário
- **Severity:** HIGH
- **Effort:** S (2–4h)
- **Problema:** A tela de detalhe da solicitação não oferece nenhuma ação ao cliente quando o status é `aberta` ou `aguardando_orcamento`. O cliente fica preso aguardando indefinidamente sem poder encerrar uma solicitação que se tornou desnecessária.
- **Fix:** Adicionar botão "Cancelar Solicitação" visível para o cliente quando `status === 'aberta' || status === 'aguardando_orcamento'`, protegido por um `ConfirmDialog`. Implementar mutation que atualiza status para `cancelado` e invalida a query.

---

### F-05 — ConfirmDialog de OS exibe string de status raw
- **Tela:** OrdemServicoDetailPage (`src/features/ordem-servico/OrdemServicoDetailPage.tsx`)
- **Pilar:** Microcopy
- **Severity:** HIGH
- **Effort:** XS (<1h)
- **Problema:** `description={\`Alterar status para "${proximoStatus}"?\`}` exibe o enum técnico diretamente: `em_andamento`, `concluida`, `cancelada`. O usuário lê "Alterar status para 'em_andamento'?" — texto técnico que não pertence a uma interface de produto.
- **Fix:**
  ```tsx
  const OS_STATUS_LABEL: Partial<Record<OSStatus, string>> = {
    em_andamento: 'Em Andamento',
    concluida: 'Concluída',
    cancelada: 'Cancelada',
  }
  description={`Alterar status para "${OS_STATUS_LABEL[proximoStatus] ?? proximoStatus}"?`}
  ```

---

### F-06 — OrdemServicoDetailPage completamente passiva para o cliente
- **Tela:** OrdemServicoDetailPage
- **Pilar:** Fluxos de Usuário
- **Severity:** HIGH
- **Effort:** M (1–2d)
- **Problema:** O cliente vê apenas informações estáticas de status, data e timeline na OS. Não há: nome/telefone do prestador, link para a solicitação de origem, link para o orçamento aprovado, campo de observações e — criticamente — nenhum fluxo de avaliação após `status === 'concluida'`. Para uma plataforma de serviços, a ausência de avaliação/rating é uma lacuna de negócio.
- **Fix:**
  - Adicionar `UserCard` do prestador para o cliente (e vice-versa).
  - Adicionar breadcrumb/link "Ver Solicitação" e "Ver Orçamento".
  - Quando `status === 'concluida'` e cliente ainda não avaliou: exibir card de avaliação com 1–5 estrelas e campo de comentário opcional.

---

### F-07 — Grid de itens do OrcamentoFormPage quebra em mobile
- **Tela:** OrcamentoFormPage (`src/features/orcamento/OrcamentoFormPage.tsx`)
- **Pilar:** Responsividade
- **Severity:** HIGH
- **Effort:** S (2–4h)
- **Problema:** O grid de itens usa `grid-cols-[2fr_1fr_1fr_auto]` sem breakpoint, causando overflow horizontal em viewports menores que ~480px. O prestador que preenche orçamentos no celular em campo não consegue usar o formulário.
- **Fix:**
  ```tsx
  // Substituir o grid por layout responsivo:
  // Mobile: cada item em card vertical (descricao em cima, qtd/valor em linha)
  // Desktop: manter grid-cols-[2fr_1fr_1fr_auto]
  <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_auto] gap-2">
  ```
  Ou: usar layout de card por item em mobile com descricao no topo e qtd/valor em linha `flex justify-between`.

---

### F-08 — Total do orçamento some em mobile durante preenchimento
- **Tela:** OrcamentoFormPage
- **Pilar:** Responsividade
- **Severity:** HIGH
- **Effort:** S (2–4h)
- **Problema:** O `TotalSummary` usa `lg:sticky lg:top-6` — em telas menores que `lg` (1024px), o total não é sticky e fica no final do formulário. O prestador adiciona itens sem ver o total acumulado, aumentando chance de erro de precificação.
- **Fix:** Adicionar um rodapé fixo em mobile com o total:
  ```tsx
  {/* Mobile total bar — só aparece em < lg */}
  <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t p-4 flex justify-between items-center">
    <span className="text-sm text-muted-foreground">Total</span>
    <CurrencyDisplay value={total} className="text-lg font-bold" />
  </div>
  ```

---

### F-09 — Salvar Rascunho sem feedback de sucesso
- **Tela:** OrcamentoFormPage
- **Pilar:** Microcopy / Fluxos de Usuário
- **Severity:** HIGH
- **Effort:** XS (<1h)
- **Problema:** Após clicar "Salvar Rascunho", se a mutation é bem-sucedida, o usuário permanece na mesma tela sem nenhum indicador visual (toast, badge "Salvo", mudança de estado no botão). O `Toaster` já está disponível globalmente.
- **Fix:**
  ```tsx
  // Na mutation onSuccess do rascunho:
  toast.success('Rascunho salvo')
  // Opcionalmente: atualizar o título da página para "Editar Orçamento #XXX"
  // e substituir "Salvar Rascunho" por "Atualizar Rascunho"
  ```

---

### F-10 — Microcopy de auth quebrado nos links entre Login e Cadastro
- **Tela:** LoginPage, RegisterPage
- **Pilar:** Microcopy
- **Severity:** MEDIUM
- **Effort:** XS (<1h)
- **Problema:** `"Já tenho conta →"` em RegisterPage (sem espaço antes da seta, lê como botão quebrado). `"Não tenho conta →"` em LoginPage com estrutura incompleta — sem pontuação nem complemento natural em PT-BR.
- **Fix:**
  ```tsx
  // LoginPage
  <p className="text-sm text-muted-foreground">
    Não tem conta ainda?{' '}
    <Link to="/cadastro" className="text-primary font-medium hover:underline">Cadastre-se</Link>
  </p>
  // RegisterPage
  <p className="text-sm text-muted-foreground">
    Já tem uma conta?{' '}
    <Link to="/login" className="text-primary font-medium hover:underline">Entrar</Link>
  </p>
  ```

---

### F-11 — Registro sem aceite de termos de uso e sem onboarding pós-cadastro
- **Tela:** RegisterPage
- **Pilar:** Fluxos de Usuário
- **Severity:** MEDIUM
- **Effort:** S (2–4h)
- **Problema:** O cadastro não inclui aceite de termos/política de privacidade (obrigatório legalmente para plataformas que intermediam serviços). Após registro, o usuário cai diretamente no Dashboard vazio sem nenhuma orientação sobre o próximo passo.
- **Fix:**
  - Adicionar checkbox `"Li e aceito os Termos de Uso e Política de Privacidade"` com link para documento, obrigatório para submit.
  - Após primeiro login (detectável por `created_at === updated_at` no profile), exibir modal de boas-vindas com 3 passos ilustrados: "1. Crie uma solicitação → 2. Receba orçamentos → 3. Acompanhe sua OS".

---

### F-12 — NotificacoesPage é placeholder estático — hook real existe mas não é usado
- **Tela:** NotificacoesPage (`src/pages/NotificacoesPage.tsx`)
- **Pilar:** Fluxos de Usuário
- **Severity:** CRITICAL
- **Effort:** S (2–4h)
- **Problema:** A página renderiza apenas `<EmptyState title="Nenhuma notificação por enquanto" />`. O hook `useNotificacoes.ts` existe na feature mas não é importado nessa página. O Bell na TopBar tem `title="Notificações (em breve)"` — o próprio código documenta que é incompleto.
- **Fix:**
  ```tsx
  // NotificacoesPage.tsx
  import { useNotificacoes } from '@/features/notificacoes/useNotificacoes'
  // Usar data do hook para renderizar lista de notificações com:
  // - Ícone por tipo (nova solicitação, orçamento enviado, OS criada)
  // - Timestamp relativo ("há 2 horas")
  // - Indicador visual de lida/não-lida
  // - Ação de "marcar todas como lidas"
  ```
  Alternativa: converter Bell em Sheet/Drawer em vez de navegação para página separada.

---

### F-13 — Email do usuário não é exibido em nenhuma tela
- **Tela:** PerfilPage (`src/pages/PerfilPage.tsx`)
- **Pilar:** Hierarquia Visual / Fluxos de Usuário
- **Severity:** MEDIUM
- **Effort:** XS (<1h)
- **Problema:** O perfil não mostra o email do usuário — nem em modo read-only. O usuário não consegue confirmar qual email está vinculado à conta sem sair do app.
- **Fix:** Adicionar campo email read-only no topo do formulário de perfil:
  ```tsx
  <FormField label="E-mail" htmlFor="email">
    <input
      id="email"
      value={session?.user?.email ?? ''}
      readOnly
      className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
    />
  </FormField>
  ```

---

### F-14 — Telefone sem máscara em todos os formulários
- **Tela:** PerfilPage, RegisterPage
- **Pilar:** Microcopy / Consistência de Componentes
- **Severity:** MEDIUM
- **Effort:** S (2–4h)
- **Problema:** O campo telefone aceita qualquer string sem formatação. O banco recebe valores como `11999998888`, `(11)99999-8888`, `11 9 9999-8888` sem consistência, dificultando exibição e validação futura.
- **Fix:** Instalar `react-imask` ou implementar máscara simples via `onChange`:
  ```tsx
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 10)
      return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
    return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  ```
  Adicionar `inputMode="tel"` e `placeholder="(11) 99999-9999"`.

---

### F-15 — Perfil sem opção de troca de senha
- **Tela:** PerfilPage
- **Pilar:** Fluxos de Usuário
- **Severity:** MEDIUM
- **Effort:** S (2–4h)
- **Problema:** Não há como trocar a senha pelo app. O usuário que quer alterar a senha precisa usar o fluxo de "Esqueci minha senha" no login — fluxo contraintuitivo para quem já está autenticado.
- **Fix:** Adicionar seção colapsável "Segurança" no perfil com botão "Alterar senha" que abre um dialog com campos `senha_atual`, `nova_senha`, `confirmar_senha`. Chamar `supabase.auth.updateUser({ password: novaSenha })`.

---

### F-16 — ISolicitacao com tipo incompleto (cast `any` em múltiplos campos)
- **Tela:** SolicitacaoDetailPage
- **Pilar:** Consistência de Componentes
- **Severity:** HIGH
- **Effort:** S (2–4h)
- **Problema:** `(solicitacao as any).equipamento` e `(solicitacao as any).status_historico` revelam que `ISolicitacao` em `types/domain.ts` está desatualizado em relação ao schema do banco. Casts `any` desativam checagem de tipo e podem causar crashes silenciosos em runtime.
- **Fix:** Atualizar `ISolicitacao`:
  ```ts
  export interface ISolicitacao {
    // ...campos existentes
    equipamento?: string
    urgencia?: 'baixa' | 'media' | 'urgente'
    prazo_desejado?: string
    status_historico?: IStatusHistorico[]
  }
  ```
  Remover todos os casts `any` após atualização do tipo.

---

### F-17 — OrdemServicoDetailPage sem informações de contato entre as partes
- **Tela:** OrdemServicoDetailPage
- **Pilar:** Fluxos de Usuário
- **Severity:** HIGH
- **Effort:** M (1–2d)
- **Problema:** O cliente vê a OS sem saber nome, telefone ou especialidade do prestador. O prestador vê a OS sem saber o nome ou telefone do cliente. Em uma plataforma de serviços, o contato entre as partes é essencial para execução do trabalho (agendamento, acesso ao local, esclarecimentos).
- **Fix:** Fazer join na query de OS para trazer o profile do prestador e do cliente. Exibir `<UserCard>` (componente já existente) com nome, telefone e especialidade para cada papel. Para o cliente: exibir dados do prestador. Para o prestador: exibir dados do cliente.

---

### F-18 — Sem fluxo de avaliação após conclusão da OS
- **Tela:** OrdemServicoDetailPage
- **Pilar:** Fluxos de Usuário
- **Severity:** HIGH
- **Effort:** L (3–5d)
- **Problema:** Quando `status === 'concluida'`, o cliente não tem nenhuma ação. Plataformas de serviço dependem de avaliações para: (1) construir reputação do prestador, (2) dar feedback para melhoria, (3) aumentar confiança de futuros clientes. A ausência desse fluxo é uma lacuna crítica de negócio.
- **Fix:**
  - Criar tabela `avaliacoes` no banco: `os_id`, `cliente_id`, `prestador_id`, `nota` (1–5), `comentario`, `created_at`.
  - Quando `status === 'concluida'` e nenhuma avaliação existe para essa OS: exibir card de avaliação com estrelas interativas e campo de texto opcional.
  - Exibir nota média do prestador no UserCard e na lista de solicitações disponíveis.

---

### F-19 — OrcamentoDetailPage sem botão "Editar" quando status é rascunho
- **Tela:** OrcamentoDetailPage (`src/features/orcamento/OrcamentoDetailPage.tsx`)
- **Pilar:** Fluxos de Usuário
- **Severity:** HIGH
- **Effort:** XS (<1h)
- **Problema:** Quando `status === 'rascunho'`, o prestador só pode enviar o orçamento ou ver os detalhes — mas não pode editar. O fluxo correto seria: criar rascunho → editar → enviar. Sem o botão "Editar", o prestador precisa cancelar e recriar para corrigir um item.
- **Fix:**
  ```tsx
  {orcamento.status === 'rascunho' && (
    <Button
      variant="outline"
      onClick={() => navigate(`/prestador/orcamentos/${orcamento.id}/editar`)}
    >
      Editar Rascunho
    </Button>
  )}
  ```
  Adicionar rota `/prestador/orcamentos/:id/editar` que carrega `OrcamentoFormPage` em modo de edição com os dados pré-preenchidos.

---

### F-20 — OrcamentoReviewPage sem campo de motivo ao recusar
- **Tela:** OrcamentoReviewPage (`src/features/orcamento/OrcamentoReviewPage.tsx`)
- **Pilar:** Fluxos de Usuário
- **Severity:** MEDIUM
- **Effort:** S (2–4h)
- **Problema:** Ao recusar um orçamento, o cliente clica em "Recusar" e é redirecionado para a lista sem nenhuma justificativa enviada ao prestador. O prestador não sabe se o cliente recusou por preço, prazo, escopo ou outro motivo, impedindo negociação ou melhoria do orçamento.
- **Fix:** Ao clicar "Recusar", abrir um `Dialog` com campo de texto opcional `motivo_recusa` antes de confirmar. Salvar o motivo junto à mutação de status. Exibir o motivo em `OrcamentoDetailPage` quando `status === 'recusado'`.

---

### F-21 — DashboardPage com StatCard de orçamentos enganoso para prestador
- **Tela:** DashboardPage (`src/pages/DashboardPage.tsx`)
- **Pilar:** Hierarquia Visual / Microcopy
- **Severity:** MEDIUM
- **Effort:** XS (<1h)
- **Problema:** O StatCard "Meus Orçamentos" exibe o count total sem distinguir rascunhos de enviados. Um prestador com 8 rascunhos e 2 enviados vê "10 orçamentos" — número inflado que não reflete o estado real do trabalho.
- **Fix:** Separar em dois StatCards: "Enviados" (status enviado+aceito+recusado) e "Rascunhos" (status rascunho). Ou adicionar sub-label: `"10 total · 2 enviados"`. A query já tem os dados — basta filtrar.

---

### F-22 — SolicitacaoListPrestadorPage sem filtro por categoria ou urgência
- **Tela:** SolicitacaoListPrestadorPage
- **Pilar:** Fluxos de Usuário
- **Severity:** MEDIUM
- **Effort:** S (2–4h)
- **Problema:** O prestador especializado em "rede" ou "segurança" vê todas as categorias misturadas sem poder filtrar. Com volume crescente de solicitações, isso cria atrito desnecessário no processo de prospecção de trabalho. A lista do cliente (`SolicitacoesPage`) já tem `StatusFilterChips` — o componente existe e pode ser reutilizado.
- **Fix:**
  ```tsx
  const CATEGORIA_FILTERS = [
    { label: 'Todos', value: '' },
    ...CATEGORIAS.map(c => ({ label: c.charAt(0).toUpperCase() + c.slice(1), value: c }))
  ]
  // Adicionar StatusFilterChips com activeCategoria state
  // Filtrar no client: data.filter(s => !activeCategoria || s.categoria === activeCategoria)
  ```

---

### F-23 — Rota `/ordens-servico/*` duplicada em App.tsx causando conflito
- **Tela:** App.tsx (`src/App.tsx`)
- **Pilar:** Consistência de Componentes
- **Severity:** MEDIUM
- **Effort:** XS (<1h)
- **Problema:** Em `App.tsx`, as linhas 71 e 73 definem:
  ```tsx
  <Route path="ordens-servico" element={<OrdemServicoListPage />} />   // linha 71
  <Route path="ordens-servico/*" element={<OrdensServicoPage />} />    // linha 73
  ```
  `OrdensServicoPage` é um re-export direto de `OrdemServicoListPage` (`export { default } from ...`). Há duas rotas apontando para o mesmo componente via caminhos diferentes, e `/ordens-servico` sem trailing slash pode não fazer match com o wildcard `/*`. Isso é confuso e pode causar comportamento inesperado em navegações programáticas.
- **Fix:** Remover a linha duplicada. Manter apenas:
  ```tsx
  <Route path="ordens-servico" element={<OrdemServicoListPage />} />
  <Route path="ordens-servico/:id" element={<OrdemServicoDetailPage />} />
  ```
  Deletar `src/pages/OrdensServicoPage.tsx` (arquivo de re-export desnecessário).

---

### F-24 — Dois sistemas de botão coexistindo com border-radius inconsistente
- **Tela:** Múltiplas páginas
- **Pilar:** Consistência de Componentes
- **Severity:** HIGH
- **Effort:** M (1–2d)
- **Problema:** `atoms/Button.tsx` usa `rounded-sm` (4px). `components/ui/button` (shadcn) usa `--radius: 0.625rem` (~10px). Inline `<button>` espalhados nas páginas usam `rounded-md` (6px) ou `rounded-lg` (12px). Três valores de border-radius diferentes para o mesmo elemento visual. Exemplos:
  - `SolicitacoesPage.tsx:49` — inline com `rounded-md bg-primary`
  - `SolicitacaoFormPage` — inline com `rounded-lg bg-primary`
  - `PerfilPage` — usa `atoms/Button`
- **Fix:** Eleger `components/ui/button` (shadcn) como canônico. Migrar todos os inline buttons e usos de `atoms/Button`. Deletar `src/components/atoms/Button.tsx` após migração completa. Verificar que o token `--radius` em `index.css` está consistente com o design do produto.

---

## Roadmap de Implementação

### Wave 1 — Quick Wins (esta semana)
Findings XS e S de severity CRITICAL e HIGH:

| Finding | Tela | Effort | Impacto |
|---------|------|--------|---------|
| F-03 — Toast pós-submit da solicitação | SolicitacaoFormPage | XS | Elimina silêncio pós-ação |
| F-05 — Status raw no ConfirmDialog | OrdemServicoDetailPage | XS | Microcopy profissional |
| F-09 — Toast após salvar rascunho | OrcamentoFormPage | XS | Elimina silêncio pós-ação |
| F-10 — Microcopy de auth corrigido | LoginPage, RegisterPage | XS | Gramática e clareza |
| F-13 — Email read-only no perfil | PerfilPage | XS | Informação básica ausente |
| F-19 — Botão editar rascunho de orçamento | OrcamentoDetailPage | XS | Desbloqueio de fluxo |
| F-21 — StatCard de orçamentos correto | DashboardPage | XS | Dado preciso |
| F-23 — Remover rota duplicada de OS | App.tsx | XS | Limpeza estrutural |
| F-12 — Conectar useNotificacoes à página | NotificacoesPage | S | Feature crítica funcionando |
| F-01 — Coletar `equipamento` no form | SolicitacaoFormPage | S | Dado de negócio essencial |
| F-04 — Ação de cancelar solicitação | SolicitacaoDetailPage | S | Autonomia do cliente |
| F-14 — Máscara de telefone | PerfilPage, RegisterPage | S | Consistência de dados |
| F-22 — Filtro por categoria para prestador | SolicitacaoListPrestadorPage | S | Discoverability |

### Wave 2 — Core UX (próximas 2 semanas)
Findings M de severity HIGH:

| Finding | Tela | Effort | Impacto |
|---------|------|--------|---------|
| F-02 — Campos urgência e prazo na solicitação | SolicitacaoFormPage | M | Contexto para orçamento preciso |
| F-07 — Grid de itens responsivo | OrcamentoFormPage | M | Usabilidade mobile do prestador |
| F-08 — Total fixo em mobile | OrcamentoFormPage | M | UX de precificação |
| F-16 — Corrigir ISolicitacao e remover casts `any` | types/domain.ts | M | Segurança de tipos |
| F-17 — Informações de contato na OS | OrdemServicoDetailPage | M | Fluxo operacional real |
| F-20 — Motivo de recusa no orçamento | OrcamentoReviewPage | M | Feedback para prestador |
| F-24 — Unificar sistema de botões | Múltiplas páginas | M | Consistência visual |
| F-06 — Cliente ativo na tela de OS | OrdemServicoDetailPage | M | Paridade de papéis |
| F-11 — Termos e onboarding pós-cadastro | RegisterPage | S–M | Compliance e retenção |
| F-15 — Troca de senha no perfil | PerfilPage | S | Segurança da conta |

### Wave 3 — Polish e Features (backlog)
Findings L ou LOW:

| Finding | Tela | Effort | Impacto |
|---------|------|--------|---------|
| F-18 — Fluxo de avaliação pós-OS | OrdemServicoDetailPage | L | Diferencial de negócio |

---

## Arquivos Auditados

**Layout e Shell**
- `src/App.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/TopBar.tsx`
- `src/components/layout/BottomNav.tsx`

**Pages**
- `src/pages/DashboardPage.tsx`
- `src/pages/NotificacoesPage.tsx`
- `src/pages/SolicitacoesPage.tsx`
- `src/pages/OrcamentosPage.tsx`
- `src/pages/OrdensServicoPage.tsx`
- `src/pages/PerfilPage.tsx`

**Features**
- `src/features/auth/LoginPage.tsx`
- `src/features/auth/RegisterPage.tsx`
- `src/features/solicitacao/SolicitacaoFormPage.tsx`
- `src/features/solicitacao/SolicitacaoDetailPage.tsx`
- `src/features/solicitacao/SolicitacaoListPrestadorPage.tsx`
- `src/features/solicitacao/solicitacaoSchemas.ts`
- `src/features/orcamento/OrcamentoFormPage.tsx`
- `src/features/orcamento/OrcamentoDetailPage.tsx`
- `src/features/orcamento/OrcamentoReviewPage.tsx`
- `src/features/ordem-servico/OrdemServicoListPage.tsx`
- `src/features/ordem-servico/OrdemServicoDetailPage.tsx`
