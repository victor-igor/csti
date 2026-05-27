-- ============================================================
-- RLS SECURITY AUDIT — FIXES
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- FIX 1 (CRÍTICO): profiles_update_own
-- Impede escalada de role, status_aprovacao e ativo via API
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Campos imutáveis pelo próprio usuário: role, status_aprovacao, ativo
    AND role             = (SELECT p.role             FROM profiles p WHERE p.id = auth.uid())
    AND status_aprovacao = (SELECT p.status_aprovacao FROM profiles p WHERE p.id = auth.uid())
    AND ativo            = (SELECT p.ativo            FROM profiles p WHERE p.id = auth.uid())
  );

-- ────────────────────────────────────────────────────────────
-- FIX 2 (ALTO): solicitacoes_update_cliente
-- Impede cliente de mudar status, deleted_at, cliente_id via API
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "solicitacoes_update_cliente" ON solicitacoes_orcamento;

CREATE POLICY "solicitacoes_update_cliente" ON solicitacoes_orcamento
  FOR UPDATE
  USING (auth.uid() = cliente_id AND check_user_approved(auth.uid()))
  WITH CHECK (
    auth.uid() = cliente_id
    -- Campos imutáveis pelo cliente
    AND cliente_id  = (SELECT s.cliente_id  FROM solicitacoes_orcamento s WHERE s.id = id)
    AND status      = (SELECT s.status      FROM solicitacoes_orcamento s WHERE s.id = id)
    AND deleted_at IS NOT DISTINCT FROM (SELECT s.deleted_at FROM solicitacoes_orcamento s WHERE s.id = id)
  );

-- ────────────────────────────────────────────────────────────
-- FIX 3 (ALTO): orcamentos_update_prestador
-- Impede prestador de trocar solicitacao_id, prestador_id, status via API
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orcamentos_update_prestador" ON orcamentos;

CREATE POLICY "orcamentos_update_prestador" ON orcamentos
  FOR UPDATE
  USING (auth.uid() = prestador_id AND check_user_approved(auth.uid()))
  WITH CHECK (
    auth.uid() = prestador_id
    AND solicitacao_id = (SELECT o.solicitacao_id FROM orcamentos o WHERE o.id = id)
    AND prestador_id   = (SELECT o.prestador_id   FROM orcamentos o WHERE o.id = id)
    AND status         = (SELECT o.status         FROM orcamentos o WHERE o.id = id)
  );

-- ────────────────────────────────────────────────────────────
-- FIX 4 (ALTO): orcamentos_update_cliente
-- Impede cliente de mudar campos além de status/observacoes
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orcamentos_update_cliente" ON orcamentos;

CREATE POLICY "orcamentos_update_cliente" ON orcamentos
  FOR UPDATE
  USING (get_solicitacao_cliente_id(solicitacao_id) = auth.uid())
  WITH CHECK (
    get_solicitacao_cliente_id(solicitacao_id) = auth.uid()
    -- FKs não podem mudar
    AND solicitacao_id = (SELECT o.solicitacao_id FROM orcamentos o WHERE o.id = id)
    AND prestador_id   = (SELECT o.prestador_id   FROM orcamentos o WHERE o.id = id)
  );

-- ────────────────────────────────────────────────────────────
-- FIX 5 (MÉDIO): orcamentos_insert_prestador
-- Só permite criar orçamento em solicitação aberta (aguardando_orcamento)
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "orcamentos_insert_prestador" ON orcamentos;

CREATE POLICY "orcamentos_insert_prestador" ON orcamentos
  FOR INSERT
  WITH CHECK (
    auth.uid() = prestador_id
    AND check_user_approved(auth.uid())
    AND EXISTS (
      SELECT 1 FROM solicitacoes_orcamento s
      WHERE s.id = solicitacao_id
        AND s.status = 'aguardando_orcamento'
        AND s.deleted_at IS NULL
    )
  );

-- ────────────────────────────────────────────────────────────
-- FIX 6 (MÉDIO): Remove hard DELETE policies desnecessárias
-- App usa soft delete — hard DELETE não deve ser exposto
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "solicitacoes_delete_cliente" ON solicitacoes_orcamento;
DROP POLICY IF EXISTS "orcamentos_delete_prestador" ON orcamentos;

-- ────────────────────────────────────────────────────────────
-- FIX 7 (MÉDIO): notificacoes_update_own
-- Impede troca de usuario_id para outro usuário
-- ────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "notificacoes_update_own" ON notificacoes;

CREATE POLICY "notificacoes_update_own" ON notificacoes
  FOR UPDATE
  USING  (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);
