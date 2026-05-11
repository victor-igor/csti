---
phase: 02-padronizar-mensagens-de-erro-para-o-usuario
plan: "01"
subsystem: error-handling
tags: [error-handling, utility, supabase, tdd]
dependency_graph:
  requires: []
  provides: [parseApiError]
  affects: [src/lib/errorUtils.ts]
tech_stack:
  added: []
  patterns: [pure-named-export, unknown-input-guard, empty-string-fallback]
key_files:
  created:
    - src/lib/errorUtils.ts
    - src/lib/__tests__/errorUtils.test.ts
  modified: []
decisions:
  - "parseApiError returns empty string (not null/undefined) for unmapped errors — caller uses contextual fallback via || operator (D-06)"
  - "navigator.onLine checked before object inspection to handle offline-first scenario"
  - "message matching is case-insensitive (.toLowerCase()) for robustness"
metrics:
  duration: "~5 minutes"
  completed: "2026-05-11T23:53:45Z"
  tasks_completed: 1
  files_changed: 2
---

# Phase 02 Plan 01: Criar utilitário parseApiError Summary

**One-liner:** Pure PT-BR error mapper using Postgres code/message pattern matching with empty-string fallback for unmapped errors.

## Tasks Completed

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Add failing tests for parseApiError | df51bbe | src/lib/__tests__/errorUtils.test.ts |
| 1 (GREEN) | Implement parseApiError utility | b2a3a49 | src/lib/errorUtils.ts |

## What Was Built

`src/lib/errorUtils.ts` — A pure TypeScript utility exporting `parseApiError(error: unknown): string` that:

- Maps Postgres code `23505` → `'Este e-mail já está cadastrado'`
- Maps Postgres code `42501` → `'Você não tem permissão para realizar esta ação'`
- Maps message containing `permission denied` → `'Você não tem permissão para realizar esta ação'`
- Maps message containing `Failed to fetch` or `networkerror` → `'Verifique sua conexão e tente novamente'`
- Returns `''` for null, undefined, or any unmapped error (caller decides fallback)
- No framework imports (no React, Sonner, Supabase)
- Follows exact pattern of `src/lib/dateUtils.ts`

## TDD Gate Compliance

- RED commit: `df51bbe` — `test(02-01): add failing tests for parseApiError utility`
- GREEN commit: `b2a3a49` — `feat(02-01): implement parseApiError utility in src/lib/errorUtils.ts`
- All 8 tests pass

## Deviations from Plan

None — plan executed exactly as written.

## Threat Model Compliance

| Threat ID | Mitigation Applied |
|-----------|-------------------|
| T-02-01 | Function returns only fixed PT-BR strings for mapped codes — never includes error.message, error.details, or error.hint |
| T-02-02 | Returns empty string for unmapped codes — callers use static contextual fallback |
| T-02-03 | Function is pure (accept disposition) — input object properties only read, no side effects |

## Known Stubs

None.

## Self-Check: PASSED

- `src/lib/errorUtils.ts` exists: FOUND
- `src/lib/__tests__/errorUtils.test.ts` exists: FOUND
- Commit df51bbe exists: FOUND (test RED)
- Commit b2a3a49 exists: FOUND (feat GREEN)
- All 8 tests pass: CONFIRMED
- No framework imports in errorUtils.ts: CONFIRMED (0 import lines)
- TypeScript check: pre-existing deprecation warning in tsconfig only, not related to this file
