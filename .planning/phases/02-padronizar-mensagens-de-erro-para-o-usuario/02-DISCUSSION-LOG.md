# Phase 2: Padronizar mensagens de erro para o usuario - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-11
**Phase:** 02-padronizar-mensagens-de-erro-para-o-usuario
**Areas discussed:** Mensagens de formulário (Zod), Erros de API/banco (toast), Tom das mensagens, Erros de carregamento de página

---

## Mensagens de formulário (Zod)

| Option | Description | Selected |
|--------|-------------|----------|
| Nos schemas Zod | invalid_type_error/required_error por campo | ✓ |
| No FormField | Intercepta e traduz qualquer mensagem | |
| Arquivo global | src/lib/errorMessages.ts com mapa | |

**User's choice:** Padrão de mercado / arquitetura correta — schemas Zod
**Notes:** Usuário quer a arquitetura correta seguindo padrão de mercado. Industria usa mensagens no próprio schema Zod.

| Option | Description | Selected |
|--------|-------------|----------|
| Campo específico | "Informe o título da solicitação" | ✓ |
| Genérico | "Este campo é obrigatório" | |

**User's choice:** Campo específico (Recomendado)

---

## Erros de API/banco (toast)

| Option | Description | Selected |
|--------|-------------|----------|
| Função utilitária central | parseApiError() em src/lib/errorUtils.ts | ✓ |
| Mensagem fixa em cada hook | Nunca expor error.message | |

**User's choice:** Padrão de mercado / arquitetura correta — função utilitária central
**Notes:** Usuário confia no padrão correto de mercado.

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas os mais comuns | network, 23505, 42501 | ✓ |
| Mapeamento completo | Todos os códigos Postgres + Supabase | |

**User's choice:** Apenas os mais comuns (Recomendado)

---

## Tom das mensagens

| Option | Description | Selected |
|--------|-------------|----------|
| Claro e direto | Diz o que fazer, não o que errou | ✓ |
| Empático com exemplo | Mais explicativo com exemplos | |
| Você decide | Claude escolhe por contexto | |

**User's choice:** Claro e direto (Recomendado)

| Option | Description | Selected |
|--------|-------------|----------|
| 100% português BR | Todas as mensagens em PT-BR | ✓ |
| Misto | Técnicas em inglês, usuário em PT-BR | |

**User's choice:** 100% português BR

---

## Erros de carregamento de página

| Option | Description | Selected |
|--------|-------------|----------|
| Mensagem + botão Tentar novamente | ErrorState com onRetry | ✓ |
| Apenas mensagem genérica | Sem retry | |

**User's choice:** Mensagem + botão Tentar novamente (Recomendado)

| Option | Description | Selected |
|--------|-------------|----------|
| Sim, contextual | "Não foi possível carregar as solicitações" | ✓ |
| Genérico | "Erro ao carregar dados" | |

**User's choice:** Sim, contextual (Recomendado)

---

## Claude's Discretion

- Implementação interna do `parseApiError`
- Mapeamento de códigos além dos 3 principais
- Se criar `parseZodError` separado ou manter tudo no schema

## Deferred Ideas

- Internacionalização completa (i18n) — fase separada
- Error monitoring (Sentry) — fora do escopo
