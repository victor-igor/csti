---
phase: 02-padronizar-mensagens-de-erro-para-o-usuario
plan: "02"
subsystem: validation-schemas
tags: [zod, validation, schemas, bug-fix, pt-br, coerce]
dependency_graph:
  requires: []
  provides:
    - "solicitacaoSchemas: mensagens PT-BR completas (titulo, descricao, urgencia)"
    - "orcamentoSchemas: z.coerce.number + mensagens PT-BR (bug do valor corrigido)"
  affects:
    - "SolicitacaoFormPage (via zodResolver)"
    - "OrcamentoFormPage (via zodResolver)"
tech_stack:
  added: ["z.coerce.number (primeiro uso no codebase)"]
  patterns:
    - "z.string().min(1, 'msg PT-BR') antes do min(N) para campos obrigatórios"
    - "z.coerce.number({ invalid_type_error: '...' }) para campos numéricos de formulário HTML"
    - "z.enum(CONST, { error: 'msg PT-BR' }) para enums"
key_files:
  modified:
    - src/features/solicitacao/solicitacaoSchemas.ts
    - src/features/orcamento/orcamentoSchemas.ts
decisions:
  - "z.coerce.number aplicado a todos os campos numéricos (quantidade, valor_unitario, prazo_dias) para aceitar strings de inputs HTML"
  - "Mensagens de min(1) adicionadas ANTES das mensagens de min(N) para capturar campo vazio com mensagem específica"
  - "prazo_dias no CreateOrcamentoSchema também convertido para z.coerce.number por consistência"
metrics:
  duration: "~10 minutes"
  completed: "2026-05-11"
  tasks_completed: 2
  tasks_total: 2
  files_modified: 2
---

# Phase 02 Plan 02: Schemas Zod — Mensagens PT-BR e Fix Bug do Valor

**One-liner:** Mensagens Zod em PT-BR para solicitacao/orcamento schemas com z.coerce.number corrigindo bug "expected number, received string" nos campos de valor.

## What Was Done

### Task 1: solicitacaoSchemas.ts — Mensagens PT-BR completas (commit c176b89)

Adicionadas mensagens PT-BR específicas no `CreateSolicitacaoSchema`:

- `titulo`: `min(1, 'Informe o título da solicitação')` antes do `min(3, 'Mínimo 3 caracteres')`
- `descricao`: `min(1, 'Descreva o problema')` antes do `min(10, 'Descreva o problema com pelo menos 10 caracteres')`
- `urgencia`: `z.enum(URGENCIAS, { error: 'Selecione a urgência' })` — removida ausência de mensagem

### Task 2: orcamentoSchemas.ts — Bug fix + mensagens PT-BR (commit 9ad5144)

Bug crítico corrigido e mensagens padronizadas no `ItemOrcamentoSchema` e `CreateOrcamentoSchema`:

- `descricao`: mensagem atualizada para `'Informe a descrição do item'`
- `quantidade`: `z.number().int().positive()` → `z.coerce.number({ invalid_type_error: 'Digite apenas números' }).int('Deve ser um número inteiro').positive('Deve ser maior que zero')`
- `valor_unitario`: `z.number().positive()` → `z.coerce.number({ invalid_type_error: 'Digite apenas números' }).positive('Deve ser maior que zero')`
- `prazo_dias`: `z.number().int().positive().max()` → `z.coerce.number({ invalid_type_error: 'Digite apenas números' }).int(...).positive(...).max(...)`

Todos os `z.number()` sem coerce removidos do arquivo.

## Deviations from Plan

None — plan executed exactly as written.

## Verification Results

- `grep -c "Informe o título da solicitação" solicitacaoSchemas.ts` → 1 ✓
- `grep -c "Descreva o problema" solicitacaoSchemas.ts` → 2 ✓
- `grep -c "Selecione a urgência" solicitacaoSchemas.ts` → 1 ✓
- `grep -c "coerce" orcamentoSchemas.ts` → 3 ✓
- `grep -c "Digite apenas números" orcamentoSchemas.ts` → 3 ✓
- `grep -c "Deve ser maior que zero" orcamentoSchemas.ts` → 3 ✓
- `grep -E "z\.number\(\)" orcamentoSchemas.ts` → 0 linhas ✓
- `npx tsc --noEmit` → sem erros novos (apenas aviso pre-existente TS5101) ✓

## Threat Flags

None — todas as mitigações do threat model aplicadas:
- T-02-04: Mensagens PT-BR estáticas substituem defaults do Zod
- T-02-05: z.coerce.number com .positive() rejeita NaN e negativos
- T-02-06: .positive(), .int(), .max() validam range mesmo após coerção

## Self-Check: PASSED

- `/Users/victorigor/eep-projeto/eep-projeto/orcafacil/.claude/worktrees/agent-ae503a43276aa179c/src/features/solicitacao/solicitacaoSchemas.ts` — FOUND
- `/Users/victorigor/eep-projeto/eep-projeto/orcafacil/.claude/worktrees/agent-ae503a43276aa179c/src/features/orcamento/orcamentoSchemas.ts` — FOUND
- Commit c176b89 — feat(02-02): solicitacaoSchemas PT-BR
- Commit 9ad5144 — fix(02-02): orcamentoSchemas coerce + PT-BR
