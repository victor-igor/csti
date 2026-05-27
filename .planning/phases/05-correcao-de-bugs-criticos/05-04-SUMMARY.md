---
plan: "05-04"
phase: "05"
subsystem: "routing/guards"
tags: [bug-fix, ux, role-guard, 404, routing]
dependency_graph:
  requires: [05-01, 05-02, 05-03]
  provides: [role-guard-toast, not-found-page]
  affects: [src/App.tsx, src/components/guards/RoleGuard.tsx]
tech_stack:
  added: []
  patterns: [useEffect-navigate-pattern, lazy-route-import]
key_files:
  created:
    - src/pages/NotFoundPage.tsx
  modified:
    - src/components/guards/RoleGuard.tsx
    - src/App.tsx
decisions:
  - "RoleRedirect como componente auxiliar interno para poder usar useEffect + toast antes do navigate"
  - "NotFoundPage usa Link estilizado com Tailwind em vez de Button asChild (Button da base-ui não suporta asChild)"
metrics:
  duration: "~10min"
  completed_date: "2026-05-26"
  tasks_completed: 3
  files_changed: 3
---

# Phase 05 Plan 04: RoleGuard com toast de feedback + Página 404 Summary

**One-liner:** RoleGuard exibe toast.error antes de redirecionar e rota catch-all exibe NotFoundPage estilizada com link de volta ao dashboard.

## Tasks Completed

| Task | Description | Commit | Files |
|------|-------------|--------|-------|
| 1 | Adicionar toast ao RoleGuard | 7bc5df5 | src/components/guards/RoleGuard.tsx |
| 2 | Criar NotFoundPage | c1abc43 | src/pages/NotFoundPage.tsx |
| 3 | Registrar NotFoundPage no catch-all | a855655 | src/App.tsx, src/pages/NotFoundPage.tsx |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removido import Navigate não utilizado no RoleGuard**
- **Found during:** Task 1
- **Issue:** Após substituir `<Navigate>` por `<RoleRedirect>`, o import `Navigate` ficou sem uso, causando erro TS6133
- **Fix:** Removido `Navigate` do import de react-router-dom
- **Files modified:** src/components/guards/RoleGuard.tsx
- **Commit:** 7bc5df5

**2. [Rule 1 - Bug] Button asChild incompatível com base-ui**
- **Found during:** Task 2/3
- **Issue:** O componente Button usa @base-ui/react/button que não suporta a prop `asChild` — TypeScript erro TS2322
- **Fix:** Substituído `<Button asChild>` por `<Link>` estilizado com classes Tailwind equivalentes ao variant default
- **Files modified:** src/pages/NotFoundPage.tsx
- **Commit:** a855655

## Verification

- [x] RoleGuard exibe toast antes de redirecionar
- [x] NotFoundPage.tsx criada com FileQuestion e link ao dashboard
- [x] App.tsx usa NotFoundPage no catch-all
- [x] TypeScript sem erros em todos os arquivos modificados
- [x] ESLint sem erros nos arquivos modificados

## Self-Check: PASSED

- src/components/guards/RoleGuard.tsx — FOUND
- src/pages/NotFoundPage.tsx — FOUND
- src/App.tsx (atualizado) — FOUND
- Commits: 7bc5df5, c1abc43, a855655 — VERIFIED
