# Phase 2: Padronizar mensagens de erro para o usuario - Context

**Gathered:** 2026-05-11
**Status:** Ready for planning

<domain>
## Phase Boundary

Substituir todas as mensagens de erro técnicas que chegam ao usuário por mensagens amigáveis, claras e em português do Brasil. Isso inclui:
- Erros de validação de formulário (Zod cru vazando inline)
- Erros de API/banco expostos no toast via `error.message`
- Erros de carregamento de página (estados `isError`)

Esta fase NÃO adiciona novas funcionalidades — apenas padroniza e traduz erros existentes.

</domain>

<decisions>
## Implementation Decisions

### Mensagens de formulário (validação Zod)
- **D-01:** Centralizar mensagens nos próprios schemas Zod usando `invalid_type_error`, `required_error` e `.message()` em cada `.refine()`. Padrão de mercado com React Hook Form + Zod — mensagem fica próxima da definição do campo.
- **D-02:** Campos obrigatórios devem ter mensagem específica por campo. Ex: `required_error: 'Informe o título da solicitação'`, não o genérico "Required".
- **D-03:** Campos numéricos devem usar `z.coerce.number({ invalid_type_error: 'Digite apenas números' })` para aceitar string do input e converter, eliminando o erro "received string".

### Erros de API/banco (toast)
- **D-04:** Criar `src/lib/errorUtils.ts` com função `parseApiError(error): string` que mapeia erros do Supabase/Postgres para mensagens amigáveis. Todos os `onError` dos hooks usam essa função — nunca `error.message` direto.
- **D-05:** Mapear apenas os erros mais comuns:
  - Sem conexão / network: "Verifique sua conexão e tente novamente"
  - Email duplicado (code 23505): "Este e-mail já está cadastrado"
  - Sem permissão / RLS (code 42501 ou "permission denied"): "Você não tem permissão para realizar esta ação"
  - Demais erros: fallback genérico contextual definido em cada hook
- **D-06:** Remover o padrão `error.message || 'fallback'` de todos os hooks. Substituir por `parseApiError(error) || 'fallback amigável'`.

### Tom e idioma das mensagens
- **D-07:** Tom claro e direto — diz o que fazer, não o que errou. Ex: "Digite apenas números no valor", "Verifique sua conexão e tente novamente". Sem jargão técnico.
- **D-08:** 100% português do Brasil. Nenhuma mensagem em inglês deve chegar ao usuário final.

### Erros de carregamento de página
- **D-09:** Usar o componente `ErrorState` já existente (que tem `onRetry`) com texto contextual: "Não foi possível carregar [contexto]. Verifique sua conexão e tente novamente." + botão "Tentar novamente".
- **D-10:** Texto deve mencionar o que falhou. Ex: "Não foi possível carregar as solicitações", "Não foi possível carregar o orçamento" — não "Erro ao carregar dados".

### Claude's Discretion
- Mapeamento exato de todos os outros códigos de erro Postgres (além dos 3 mapeados acima) — Claude escolhe conforme aparecerem no código
- Ordem e estrutura interna do `parseApiError` — Claude decide a implementação
- Se valer criar um segundo utilitário `parseZodError` ou manter tudo no schema

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Componentes existentes
- `src/components/molecules/FormField.tsx` — exibe `error?.message` inline; padrão atual a ser mantido
- `src/components/organisms/ErrorState.tsx` — componente de erro de página com `onRetry`
- `src/components/molecules/TextareaField.tsx` — padrão de field com erro

### Schemas com mensagens parciais (referência de padrão existente)
- `src/features/solicitacao/solicitacaoSchemas.ts` — tem algumas mensagens Zod, incompleto

### Hooks com padrão problemático (todos precisam ser corrigidos)
- `src/features/solicitacao/useSolicitacao.ts`
- `src/features/orcamento/useOrcamento.ts`
- `src/features/ordem-servico/useOrdemServico.ts`
- `src/features/auth/useAuth.ts`
- `src/features/perfil/PerfilModal.tsx`

### Schemas que precisam de mensagens (todos)
- `src/features/orcamento/orcamentoSchemas.ts` — contém campo de valor numérico que causa o bug da screenshot

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ErrorState` component: já tem `message` prop e `onRetry` callback — reutilizar em todos os `isError`
- `FormField`: já renderiza `error?.message` — manter, apenas garantir que a mensagem vem correta do Zod
- Padrão `toast.error()` já estabelecido via `sonner` — manter, só mudar o conteúdo

### Established Patterns
- React Hook Form + Zod via `zodResolver` — todas as mensagens devem vir do schema, não do componente
- `onError: (error: Error)` em todos os hooks TanStack Query — ponto central para interceptar

### Integration Points
- `src/lib/errorUtils.ts` (novo) — será importado por todos os hooks
- Todos os `*Schemas.ts` recebem atualização de mensagens
- `useAuth.ts` tem tratamento de erro específico para auth que precisa ser revisado separadamente

</code_context>

<specifics>
## Specific Ideas

- Bug reportado: campo de valor do item de orçamento (`OrcamentoFormPage`) mostra "Invalid input: expected number, received string" — esse é o caso mais urgente a corrigir (usar `z.coerce.number()`)
- O `parseApiError` deve retornar `string` — o chamador decide se usa em `toast.error()` ou em state

</specifics>

<deferred>
## Deferred Ideas

- Avaliação pós-OS (F-18) — mencionada em sessões anteriores, requer tabela `avaliacoes`
- Internacionalização completa (i18n) — seria uma fase separada caso o sistema suporte múltiplos idiomas no futuro
- Logging de erros para monitoramento (Sentry, etc.) — fora do escopo desta fase

</deferred>

---

*Phase: 02-padronizar-mensagens-de-erro-para-o-usuario*
*Context gathered: 2026-05-11*
