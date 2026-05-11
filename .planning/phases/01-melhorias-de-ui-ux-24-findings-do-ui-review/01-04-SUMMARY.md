---
phase: 01-melhorias-de-ui-ux-24-findings-do-ui-review
plan: "04"
subsystem: solicitacao
tags: [schema, types, form, toast, urgencia, equipamento, prazo]
dependency_graph:
  requires: []
  provides: [solicitacao-schema-v2, ISolicitacao-typed, solicitacao-form-expanded, detail-typed]
  affects: [SolicitacaoFormPage, SolicitacaoDetailPage, SolicitacaoCard, useSolicitacao]
tech_stack:
  added: []
  patterns: [zod-enum-no-default, react-hook-form-Controller, supabase-any-cast]
key_files:
  created: []
  modified:
    - src/features/solicitacao/solicitacaoSchemas.ts
    - src/types/domain.ts
    - src/features/solicitacao/SolicitacaoFormPage.tsx
    - src/features/solicitacao/useSolicitacao.ts
    - src/components/organisms/SolicitacaoCard.tsx
    - src/features/solicitacao/SolicitacaoDetailPage.tsx
decisions:
  - "urgencia usa z.enum(URGENCIAS) sem .default() para evitar incompatibilidade entre input/output types com zodResolver; default 'media' definido em defaultValues do useForm"
  - "urgencia/prazo_desejado não existem nos tipos gerados pelo Supabase — useSolicitacao usa cast (supabase.from as any).insert para contornar até regeneração dos tipos"
  - "SolicitacaoCard urgência badge adicionado na mesma linha de StatusBadge (antes)"
metrics:
  duration: "~35min"
  completed: "2026-05-11T15:15:49Z"
  tasks_completed: 3
  files_changed: 6
---

# Phase 1 Plan 04: Bundle Solicitação (F-01, F-02, F-03, F-16) Summary

Schema Zod e ISolicitacao estendidos com equipamento, urgência (enum) e prazo desejado; form expandido com radio de urgência e date picker; toast pós-submit adicionado; SolicitacaoDetailPage totalmente tipada sem cast any.

## Tasks Completed

| Task | Description | Commit |
|------|-------------|--------|
| 1 | F-01+F-02+F-16: Schema Zod + tipos de domínio | 81b2120 |
| 2 | F-01+F-02+F-03: Form expandido + toast + SolicitacaoCard | 457969d |
| 3 | F-16: SolicitacaoDetailPage sem cast any + InfoCards | fe77e62 |

## What Was Built

- `CreateSolicitacaoSchema` agora valida: equipamento (opcional, max 200), urgencia (enum baixa/media/urgente), prazo_desejado (opcional)
- `ISolicitacao` estende `Tables<'solicitacoes_orcamento'>` com equipamento?, urgencia?, prazo_desejado?, status_historico? tipados
- `SolicitacaoFormPage`: ordem titulo→categoria→equipamento→urgência(radio colorido)→prazo(date)→descrição
- `useCreateSolicitacao.onSuccess`: `toast.success('Solicitação enviada com sucesso!')` antes de `navigate`
- Mutation insere urgencia e prazo_desejado via cast `as any` (campos existem na DB, tipos não regenerados nesta fase)
- `SolicitacaoCard`: badge de urgência colorido (verde/amarelo/vermelho) exibido quando presente
- `SolicitacaoDetailPage`: zero casts `as any`; InfoCard Urgência + InfoCard Prazo Desejado na coluna lateral

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] z.enum().default() incompatível com zodResolver**
- **Found during:** Task 2
- **Issue:** `z.enum(URGENCIAS).default('media')` cria divergência entre input type (urgencia opcional) e output type (urgencia obrigatória), causando erro de tipo no `zodResolver` do react-hook-form
- **Fix:** Removido `.default('media')` do schema; default `'media'` definido via `defaultValues` no `useForm`. Exportado `CreateSolicitacaoInput` temporariamente, depois removido ao simplificar.
- **Files modified:** `solicitacaoSchemas.ts`, `SolicitacaoFormPage.tsx`
- **Commit:** 457969d

**2. [Rule 2 - Missing] urgencia/prazo_desejado ausentes nos tipos Supabase gerados**
- **Found during:** Task 2
- **Issue:** `supabase.ts` (gerado automaticamente) não contém `urgencia` nem `prazo_desejado` na tabela `solicitacoes_orcamento`, causando erro TS2769 no insert
- **Fix:** Cast `(supabase.from('solicitacoes_orcamento') as any).insert(...)` com comentário explicativo. Campos existem na DB — apenas os tipos gerados estão desatualizados.
- **Files modified:** `useSolicitacao.ts`
- **Commit:** 457969d

## Pre-existing Issues (Out of Scope)

- `MobileDrawer.tsx`: erro TS2307 (módulo navLinks não encontrado) — pré-existia antes deste plan
- `DashboardPage.tsx`: erro TS2322 (prop subtitle inexistente) — pré-existia antes deste plan
- Ambos bloqueiam `tsc -b` mas Vite build passa com sucesso

## Known Stubs

Nenhum stub identificado. Todos os campos são renderizados condicionalmente quando presentes.

## Threat Flags

| Flag | File | Description |
|------|------|-------------|
| threat_flag: input-validation | useSolicitacao.ts | urgencia inserida via cast any — validação Zod no client é única barreira; RLS no Supabase deve rejeitar valores inválidos se schema de DB tiver constraint enum |

## Self-Check: PASSED

- [x] `src/features/solicitacao/solicitacaoSchemas.ts` existe e contém URGENCIAS
- [x] `src/types/domain.ts` existe e contém urgencia?: Urgencia
- [x] `src/features/solicitacao/SolicitacaoFormPage.tsx` existe com name="urgencia" e name="equipamento"
- [x] `src/features/solicitacao/useSolicitacao.ts` contém toast.success e urgencia insert
- [x] `src/components/organisms/SolicitacaoCard.tsx` contém bg-red-100
- [x] `src/features/solicitacao/SolicitacaoDetailPage.tsx` sem (solicitacao as any), com Prazo Desejado
- [x] Commits 81b2120, 457969d, fe77e62 existem no log
