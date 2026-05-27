-- ============================================================
-- FIX: subqueries ambíguas em RLS WITH CHECK causam 500
-- "more than one row returned by a subquery used as an expression"
--
-- Bug: `WHERE o.id = id` → `id` resolve para `o.id` no escopo interno
--       tornando-se `o.id = o.id` → retorna TODAS as linhas da tabela
-- Fix: usar `orcamentos.id` / `solicitacoes_orcamento.id` (outer row)
--
-- Também corrige: rascunho → enviado bloqueado pelo FIX 3 do audit
-- ============================================================

-- FIX: solicitacoes_update_cliente
DROP POLICY IF EXISTS "solicitacoes_update_cliente" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_update_cliente" ON solicitacoes_orcamento
  FOR UPDATE
  USING (auth.uid() = cliente_id AND check_user_approved(auth.uid()))
  WITH CHECK (
    auth.uid() = cliente_id
    AND cliente_id = (SELECT s.cliente_id  FROM solicitacoes_orcamento s WHERE s.id = solicitacoes_orcamento.id)
    AND status     = (SELECT s.status      FROM solicitacoes_orcamento s WHERE s.id = solicitacoes_orcamento.id)
    AND deleted_at IS NOT DISTINCT FROM
                   (SELECT s.deleted_at    FROM solicitacoes_orcamento s WHERE s.id = solicitacoes_orcamento.id)
  );

-- FIX: orcamentos_update_prestador (inclui permissão rascunho → enviado)
DROP POLICY IF EXISTS "orcamentos_update_prestador" ON orcamentos;
CREATE POLICY "orcamentos_update_prestador" ON orcamentos
  FOR UPDATE
  USING (auth.uid() = prestador_id AND check_user_approved(auth.uid()))
  WITH CHECK (
    auth.uid() = prestador_id
    AND solicitacao_id = (SELECT o.solicitacao_id FROM orcamentos o WHERE o.id = orcamentos.id)
    AND prestador_id   = (SELECT o.prestador_id   FROM orcamentos o WHERE o.id = orcamentos.id)
    AND (
      -- Sem mudança de status (editar rascunho)
      status = (SELECT o.status FROM orcamentos o WHERE o.id = orcamentos.id)
      OR
      -- Única transição permitida: rascunho → enviado
      (
        (SELECT o.status FROM orcamentos o WHERE o.id = orcamentos.id) = 'rascunho'
        AND status = 'enviado'
      )
    )
  );

-- FIX: orcamentos_update_cliente
DROP POLICY IF EXISTS "orcamentos_update_cliente" ON orcamentos;
CREATE POLICY "orcamentos_update_cliente" ON orcamentos
  FOR UPDATE
  USING (get_solicitacao_cliente_id(solicitacao_id) = auth.uid())
  WITH CHECK (
    get_solicitacao_cliente_id(solicitacao_id) = auth.uid()
    AND solicitacao_id = (SELECT o.solicitacao_id FROM orcamentos o WHERE o.id = orcamentos.id)
    AND prestador_id   = (SELECT o.prestador_id   FROM orcamentos o WHERE o.id = orcamentos.id)
  );
