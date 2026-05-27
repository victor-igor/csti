-- ============================================================
-- FIX FINAL: Evitar recursão infinita nas policies de RLS
--
-- Problema: subqueries dentro de WITH CHECK que leem a mesma tabela
-- com RLS habilitada causam recursão infinita.
--
-- Solução: SECURITY DEFINER functions que leem sem acionar RLS
-- + RPC enviar_orcamento que faz as duas atualizações atomicamente
-- ============================================================

-- Helper: status atual do orçamento (sem RLS)
CREATE OR REPLACE FUNCTION get_orcamento_current_status(p_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status::text FROM orcamentos WHERE id = p_id;
$$;

-- Helper: verifica se FKs do orçamento não mudaram (sem RLS)
CREATE OR REPLACE FUNCTION check_orcamento_fks_unchanged(
  p_id uuid,
  p_solicitacao_id uuid,
  p_prestador_id uuid
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM orcamentos
    WHERE id = p_id
      AND solicitacao_id = p_solicitacao_id
      AND prestador_id = p_prestador_id
  );
$$;

-- Helper: verifica campos imutáveis da solicitação (sem RLS)
CREATE OR REPLACE FUNCTION check_solicitacao_fields_unchanged(
  p_id uuid,
  p_cliente_id uuid,
  p_status text,
  p_deleted_at timestamptz
)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM solicitacoes_orcamento
    WHERE id = p_id
      AND cliente_id = p_cliente_id
      AND status::text = p_status
      AND deleted_at IS NOT DISTINCT FROM p_deleted_at
  );
$$;

-- RPC: enviar_orcamento - operação atômica + segura
-- Não requer UPDATE policy direto em solicitacoes_orcamento para prestadores
CREATE OR REPLACE FUNCTION enviar_orcamento(p_orcamento_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prestador_id uuid;
  v_solicitacao_id uuid;
  v_status text;
BEGIN
  SELECT prestador_id, solicitacao_id, status::text
  INTO v_prestador_id, v_solicitacao_id, v_status
  FROM orcamentos
  WHERE id = p_orcamento_id;

  IF v_prestador_id IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado';
  END IF;
  IF v_prestador_id != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  IF v_status != 'rascunho' THEN
    RAISE EXCEPTION 'Orçamento não está em rascunho (status: %)', v_status;
  END IF;

  UPDATE orcamentos
  SET status = 'enviado'
  WHERE id = p_orcamento_id;

  UPDATE solicitacoes_orcamento
  SET status = 'orcamento_enviado'
  WHERE id = v_solicitacao_id;
END;
$$;

GRANT EXECUTE ON FUNCTION enviar_orcamento(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_orcamento_current_status(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_orcamento_fks_unchanged(uuid, uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION check_solicitacao_fields_unchanged(uuid, uuid, text, timestamptz) TO authenticated;

-- Fix: solicitacoes_update_cliente (sem subquery recursiva)
DROP POLICY IF EXISTS "solicitacoes_update_cliente" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_update_cliente" ON solicitacoes_orcamento
  FOR UPDATE
  USING (auth.uid() = cliente_id AND check_user_approved(auth.uid()))
  WITH CHECK (
    auth.uid() = cliente_id
    AND check_solicitacao_fields_unchanged(id, cliente_id, status::text, deleted_at)
  );

-- Fix: orcamentos_update_prestador (sem subquery recursiva)
DROP POLICY IF EXISTS "orcamentos_update_prestador" ON orcamentos;
CREATE POLICY "orcamentos_update_prestador" ON orcamentos
  FOR UPDATE
  USING (auth.uid() = prestador_id AND check_user_approved(auth.uid()))
  WITH CHECK (
    auth.uid() = prestador_id
    AND check_orcamento_fks_unchanged(id, solicitacao_id, prestador_id)
    AND (
      get_orcamento_current_status(id) = status::text
      OR (get_orcamento_current_status(id) = 'rascunho' AND status::text = 'enviado')
    )
  );

-- Fix: orcamentos_update_cliente (sem subquery recursiva)
DROP POLICY IF EXISTS "orcamentos_update_cliente" ON orcamentos;
CREATE POLICY "orcamentos_update_cliente" ON orcamentos
  FOR UPDATE
  USING (get_solicitacao_cliente_id(solicitacao_id) = auth.uid())
  WITH CHECK (
    get_solicitacao_cliente_id(solicitacao_id) = auth.uid()
    AND check_orcamento_fks_unchanged(id, solicitacao_id, prestador_id)
  );
