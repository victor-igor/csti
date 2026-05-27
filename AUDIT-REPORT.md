# Auditoria de RLS — Prestador Role

**Data:** 2026-05-27  
**Auditor:** Claude (análise estática de migrations + código frontend)  
**Escopo:** Policies RLS, funções SECURITY DEFINER, grants — foco no role `prestador`

---

## 1. Políticas por tabela (estado atual derivado das migrations aplicadas)

### `solicitacoes_orcamento`

| Policy | Operação | Quem | Condição |
|--------|----------|------|----------|
| `solicitacoes_select_cliente` | SELECT | cliente | `auth.uid() = cliente_id AND check_user_approved()` |
| `solicitacoes_select_prestador` | SELECT | prestador | Orçou na solicitação OU solicitação aberta na categoria do prestador |
| `solicitacoes_insert_cliente` | INSERT | cliente | `check_user_approved()` |
| `solicitacoes_update_cliente` | UPDATE | cliente | campos imutáveis via `check_solicitacao_fields_unchanged()` |
| `solicitacoes_admin_all` | ALL | admin/super_admin | role check |
| *(sem policy UPDATE para prestador)* | UPDATE | prestador | **NENHUMA** — atualização de status via `enviar_orcamento()` RPC |

### `orcamentos`

| Policy | Operação | Quem | Condição |
|--------|----------|------|----------|
| `orcamentos_select_prestador` | SELECT | prestador | `auth.uid() = prestador_id AND check_user_approved()` |
| `orcamentos_select_cliente` | SELECT | cliente | via `get_solicitacao_cliente_id()` |
| `orcamentos_insert_prestador` | INSERT | prestador | solicitação com status `aguardando_orcamento`, aprovado |
| `orcamentos_update_prestador` | UPDATE | prestador | FKs inalteradas + transição rascunho→enviado via funções SECURITY DEFINER |
| `orcamentos_update_cliente` | UPDATE | cliente | FKs inalteradas via `check_orcamento_fks_unchanged()` |
| `orcamentos_admin_all` | ALL | admin/super_admin | role check |

### `ordens_servico`

| Policy | Operação | Situação |
|--------|----------|----------|
| SELECT prestador | SELECT | **Não confirmado** — depende da migration base `20260429000002_rls.sql` |
| UPDATE prestador | UPDATE | **Não confirmado** — prestador avança status via `useUpdateStatusOS` direto |

### `mensagens_solicitacao`

| Policy | Operação | Quem | Condição |
|--------|----------|------|----------|
| `mensagens_select_participante` | SELECT | participante | Orçou OU categoria bate com solicitação aberta |
| `mensagens_insert_participante` | INSERT | participante | Mesmo critério do SELECT |
| `mensagens_admin_all` | ALL | admin/super_admin | role check |

---

## 2. Problemas encontrados

| # | Tabela | Operação | Problema | Severidade |
|---|--------|----------|----------|------------|
| P1 | `solicitacoes_orcamento` | UPDATE | `useRecusarOrcamento` tenta atualizar `status = 'aguardando_orcamento'`. A policy `solicitacoes_update_cliente` usa `check_solicitacao_fields_unchanged` que **exige que status não mude** → UPDATE bloqueado com erro 42501 | **CRÍTICO** |
| P2 | `orcamentos` | UPDATE | `useRecusarOrcamento` tenta atualizar `status = 'recusado'` em `orcamentos`. A policy `orcamentos_update_cliente` via `check_orcamento_fks_unchanged` não verifica status → qualquer valor de status é aceito (inclui `aprovado`, `rascunho`, etc.) | **ALTO** |
| P3 | `ordens_servico` | SELECT | Dashboard prestador consulta `ordens_servico` sem filtro de `prestador_id`. Se a policy SELECT restringe por `prestador_id = auth.uid()`, o card "OS Ativas" mostra apenas as OS do próprio prestador. Se policy não existe para prestador → sem acesso → 0 ou erro | **ALTO** |
| P4 | `ordens_servico` | UPDATE | `useUpdateStatusOS` faz UPDATE sem filtro de `prestador_id`. Confia 100% na RLS. Se policy não existir para prestador → erro. Se existir → prestador pode tentar update em OS de outros | **ALTO** |
| P5 | `enviar_orcamento` RPC | — | Função SECURITY DEFINER não verifica `profiles.ativo`. Um prestador desativado com token JWT ainda válido pode enviar orçamentos | **ALTO** |
| P6 | `orcamentos` | UPDATE | `orcamentos_update_cliente` não restringe quais valores de `status` o cliente pode colocar — apenas garante que FKs não mudam. Cliente pode fazer `status = 'rascunho'`, `status = 'aprovado'` etc. | **ALTO** |
| P7 | `itens_orcamento` | DELETE | `useUpdateOrcamento` faz DELETE direto em `itens_orcamento`. Existência de policy DELETE para prestador não confirmada nas migrations visíveis | **MÉDIO** |
| P8 | `status_historico` | SELECT | Dashboard prestador faz SELECT com `usuario_id = profile.id`. Policy para prestador não confirmada | **MÉDIO** |
| P9 | `solicitacoes_orcamento` | SELECT | `useDeleteOrcamento` consulta `orcamentos` para contar restantes e decide reverter status da solicitação via UPDATE. UPDATE em `solicitacoes_orcamento` por prestador não tem policy → vai falhar | **MÉDIO** |

---

## 3. Causa raiz dos erros no dashboard do prestador

### "Aguardando Resposta" e "Aceitos este mês"

Ambas as queries filtram explicitamente por `prestador_id = profile.id` no frontend. A policy `orcamentos_select_prestador` exige `check_user_approved(auth.uid())`.

**Causa mais provável:** o prestador não está com `status_aprovacao = 'aprovado'` OU `ativo = false`. A função `check_user_approved` retorna `false` e nenhum registro é retornado, sem mensagem de erro.

**Verificar:**
```sql
SELECT id, nome, role, status_aprovacao, ativo
FROM profiles
WHERE role = 'prestador';
```

### "OS Ativas" — causa mais provável de erro 42501

A query em `DashboardPage.tsx` linha 219-223:
```typescript
supabase.from('ordens_servico')
  .select('id', { count: 'exact', head: false })
  .neq('status', 'concluida')
  .neq('status', 'cancelada')
// Sem .eq('prestador_id', profile.id)
```

Se a policy SELECT de `ordens_servico` exige `prestador_id = auth.uid()`, esta query ainda funciona (RLS aplica o filtro). Se não existe policy para prestador, há erro de acesso.

### `useRecusarOrcamento` — quebrado (P1 — CRÍTICO)

```typescript
// useOrcamento.ts linha 65:
const { error: solErr } = await supabase
  .from('solicitacoes_orcamento')
  .update({ status: 'aguardando_orcamento' })  // ← BLOQUEADO pela policy
  .eq('id', solicitacaoId)
```

A policy `solicitacoes_update_cliente` (migration 20260527000010) usa:
```sql
WITH CHECK (
  auth.uid() = cliente_id
  AND check_solicitacao_fields_unchanged(id, cliente_id, status::text, deleted_at)
  -- check_solicitacao_fields_unchanged verifica que status NÃO mudou
  -- mas o código QUER mudar status → WITH CHECK falha → erro 42501
)
```

---

## 4. Fixes necessários

### Fix 1 — CRÍTICO: Criar `recusar_orcamento` RPC (resolve P1 + P2)

Migrar `useRecusarOrcamento` de updates diretos para RPC atômica, igual ao padrão de `enviar_orcamento`:

```sql
-- supabase/migrations/20260527000011_fix_recusar_orcamento_rpc.sql

CREATE OR REPLACE FUNCTION recusar_orcamento(
  p_orcamento_id uuid,
  p_motivo text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_solicitacao_id uuid;
  v_cliente_id uuid;
  v_orc_status text;
BEGIN
  SELECT o.solicitacao_id, s.cliente_id, o.status::text
  INTO v_solicitacao_id, v_cliente_id, v_orc_status
  FROM orcamentos o
  JOIN solicitacoes_orcamento s ON s.id = o.solicitacao_id
  WHERE o.id = p_orcamento_id;

  IF v_cliente_id IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado';
  END IF;
  IF v_cliente_id != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  IF v_orc_status NOT IN ('enviado') THEN
    RAISE EXCEPTION 'Orçamento não pode ser recusado (status: %)', v_orc_status;
  END IF;

  UPDATE orcamentos
  SET status = 'recusado',
      observacoes = CASE
        WHEN p_motivo IS NOT NULL AND trim(p_motivo) != ''
        THEN '[Motivo da recusa: ' || trim(p_motivo) || ']'
        ELSE observacoes
      END
  WHERE id = p_orcamento_id;

  UPDATE solicitacoes_orcamento
  SET status = 'aguardando_orcamento'
  WHERE id = v_solicitacao_id;
END;
$$;

GRANT EXECUTE ON FUNCTION recusar_orcamento(uuid, text) TO authenticated;
REVOKE EXECUTE ON FUNCTION recusar_orcamento(uuid, text) FROM anon;
```

**Frontend — atualizar `useRecusarOrcamento` em `useOrcamento.ts`:**
```typescript
mutationFn: async ({ orcamentoId, solicitacaoId: _s, motivo }) => {
  const { error } = await supabase.rpc('recusar_orcamento', {
    p_orcamento_id: orcamentoId,
    p_motivo: motivo ?? null,
  })
  if (error) throw error
},
```

### Fix 2 — ALTO: Restringir `status` em `orcamentos_update_cliente` (resolve P6)

```sql
-- supabase/migrations/20260527000012_fix_orcamentos_cliente_status.sql

DROP POLICY IF EXISTS "orcamentos_update_cliente" ON orcamentos;
CREATE POLICY "orcamentos_update_cliente" ON orcamentos
  FOR UPDATE
  USING (get_solicitacao_cliente_id(solicitacao_id) = auth.uid())
  WITH CHECK (
    get_solicitacao_cliente_id(solicitacao_id) = auth.uid()
    AND check_orcamento_fks_unchanged(id, solicitacao_id, prestador_id)
    AND status IN ('aceito', 'recusado')  -- único status permitido ao cliente
  );
```

> **Nota:** Se a migração para RPC de recusar for implementada (Fix 1), o update de `status = 'recusado'` passa a ser feito pela RPC e a policy pode restringir apenas `'aceito'`.

### Fix 3 — ALTO: `enviar_orcamento` — verificar `ativo` (resolve P5)

Adicionar verificação antes do UPDATE:
```sql
-- No corpo da função enviar_orcamento (substituir versão atual):
DECLARE
  v_ativo boolean;
BEGIN
  -- ... código existente ...
  
  SELECT ativo INTO v_ativo FROM profiles WHERE id = auth.uid();
  IF v_ativo IS NOT TRUE THEN
    RAISE EXCEPTION 'Conta de prestador desativada';
  END IF;
  
  -- ... resto do código ...
```

### Fix 4 — ALTO: `useUpdateStatusOS` — adicionar filtro defensivo (resolve P4)

```typescript
// useOrdemServico.ts — useUpdateStatusOS
mutationFn: async ({ id, status }: { id: string; status: OSStatus }) => {
  const today = new Date().toISOString().split('T')[0]
  const user = useAuthStore.getState().user  // pegar user do store
  const { error } = await supabase
    .from('ordens_servico')
    .update(status === 'concluida' ? { status, data_conclusao: today } : { status })
    .eq('id', id)
    .eq('prestador_id', user?.id ?? '')  // ← filtro adicional
  if (error) throw error
},
```

### Fix 5 — MÉDIO: `useDeleteOrcamento` — remover UPDATE de solicitação (resolve P9)

O prestador não tem policy UPDATE em `solicitacoes_orcamento`. O soft delete do orçamento pode reverter o status via trigger ou RPC:

```typescript
// Opção simples: remover o bloco de reversão do frontend
// e criar trigger no banco para reverter automaticamente quando
// todos os orçamentos ativos são deletados
```

Ou criar uma RPC `deletar_orcamento_prestador(p_orcamento_id uuid)` com SECURITY DEFINER.

---

## 5. Funções faltando grants

As migrations `20260527000002` e `20260527000010` cobrem as funções mais recentes, mas estas funções da migration base podem estar sem grant explícito para `authenticated`:

```sql
-- Verificar e garantir grants:
GRANT EXECUTE ON FUNCTION public.check_user_approved(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_solicitacao_cliente_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aprovar_orcamento(uuid) TO authenticated;

-- Revogar anon de helpers (se não feito):
REVOKE EXECUTE ON FUNCTION public.check_user_approved(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_user_role(uuid, role_enum) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_solicitacao_cliente_id(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_orcamento_current_status(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_orcamento_fks_unchanged(uuid, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_solicitacao_fields_unchanged(uuid, uuid, text, timestamptz) FROM anon;
```

---

## 6. Queries de diagnóstico (rodar no Supabase SQL Editor)

```sql
-- 1. Ver todas as policies de ordens_servico (crítico para confirmar P3/P4)
SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'ordens_servico'
ORDER BY cmd, policyname;

-- 2. Verificar status de prestadores
SELECT id, nome, role, status_aprovacao, ativo
FROM profiles
WHERE role = 'prestador';

-- 3. Verificar policies de itens_orcamento e status_historico
SELECT tablename, policyname, cmd, roles
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('itens_orcamento', 'status_historico')
ORDER BY tablename, cmd;

-- 4. Verificar grants em funções helper
SELECT grantee, routine_name, privilege_type
FROM information_schema.role_routine_grants
WHERE routine_schema = 'public'
  AND grantee IN ('authenticated', 'anon')
ORDER BY routine_name, grantee;
```

---

*Análise baseada nas migrations `20260527000001` a `20260527000010` e nos arquivos `DashboardPage.tsx`, `useOrcamento.ts`, `useOrdemServico.ts`. Queries SQL ao banco não foram executadas — recomenda-se confirmação com as queries de diagnóstico acima.*
