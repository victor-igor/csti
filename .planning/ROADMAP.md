# OrçaFácil — Roadmap

## Milestone 1: Produto Funcional

**Goal:** Plataforma de orçamentos e ordens de serviço de TI funcional, com UX polida para clientes e prestadores.

### Phases


### Phase 1: Melhorias de UI/UX — 24 findings do UI-REVIEW

**Goal:** Implementar as correções dos 23 findings (Wave 1 + Wave 2) identificados na auditoria UI/UX (UI-REVIEW.md), polindo o app em UX, microcopy, responsividade mobile e consistência visual. F-18 (avaliação pós-OS, Wave 3) está fora do escopo.
**Requirements**: [F-01, F-02, F-03, F-04, F-05, F-06, F-07, F-08, F-09, F-10, F-11, F-12, F-13, F-14, F-15, F-16, F-17, F-19, F-20, F-21, F-22, F-23, F-24]
**Depends on:** Phase 0
**Plans:** 11 plans

Plans:
- [ ] 01-01-PLAN.md — Quick wins XS: F-05 (label OS), F-10 (microcopy auth), F-13 (email read-only), F-21 (StatCard prestador), F-23 (rota duplicada)
- [ ] 01-02-PLAN.md — NotificacoesPage funcional (F-12) + utilitário formatPhone (F-14 base)
- [ ] 01-03-PLAN.md — Filtro por categoria na lista do prestador (F-22)
- [x] 01-04-PLAN.md — Bundle solicitação: equipamento (F-01), urgência+prazo (F-02), toast (F-03), tipagem limpa (F-16)
- [ ] 01-05-PLAN.md — Bundle orçamento: grid responsivo (F-07), total fixo mobile (F-08), toast rascunho (F-09), editar rascunho (F-19)
- [ ] 01-06-PLAN.md — Cliente cancelar solicitação (F-04)
- [ ] 01-07-PLAN.md — Contatos e links cruzados na OS (F-17 + F-06 partial)
- [ ] 01-08-PLAN.md — Motivo de recusa do orçamento (F-20)
- [ ] 01-09-PLAN.md — Troca de senha no perfil (F-15) + máscara de telefone no perfil (F-14)
- [ ] 01-10-PLAN.md — Termos de uso + onboarding (F-11) + máscara de telefone no cadastro (F-14)
- [ ] 01-11-PLAN.md — Unificar sistema de botões para shadcn (F-24)

### Phase 2: Padronizar mensagens de erro para o usuario

**Goal:** Substituir todas as mensagens de erro técnicas (Zod cru, error.message do Supabase, ErrorState genérico) por mensagens amigáveis em PT-BR. Inclui: centralização via parseApiError, schemas Zod com mensagens completas + fix do bug "Invalid input: expected number, received string" no orçamento, ErrorState contextual em 6 páginas.
**Requirements**: [D-01, D-02, D-03, D-04, D-05, D-06, D-07, D-08, D-09, D-10]
**Depends on:** Phase 1
**Plans:** 4 plans

Plans:
- [x] 02-01-PLAN.md — Criar src/lib/errorUtils.ts com parseApiError (D-04, D-05, D-06)
- [x] 02-02-PLAN.md — Schemas Zod com mensagens PT-BR + fix bug coerce.number (D-01, D-02, D-03)
- [x] 02-03-PLAN.md — Wire parseApiError em 5 hooks (useSolicitacao, useOrcamento, useOrdemServico, useAuth, PerfilModal)
- [x] 02-04-PLAN.md — ErrorState contextual em 6 páginas com isError (D-09, D-10)
