-- ============================================================
-- Fix P1 (CRÍTICO): recusar_orcamento — cliente tentava UPDATE direto
-- em solicitacoes_orcamento mas policy bloqueia mudança de status.
-- Fix P9 (MÉDIO): deletar_orcamento_prestador — prestador tentava UPDATE
-- direto em solicitacoes_orcamento sem policy.
-- Padrão: SECURITY DEFINER para operações cross-table.
-- ============================================================

-- RPC: recusar_orcamento (cliente recusa proposta do prestador)
CREATE OR REPLACE FUNCTION recusar_orcamento(
  p_orcamento_id uuid,
  p_motivo text DEFAULT NULL
)
RETURNS uuid
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

  RETURN v_solicitacao_id;
END;
$$;

-- RPC: deletar_orcamento_prestador (soft delete + revert status se necessário)
CREATE OR REPLACE FUNCTION deletar_orcamento_prestador(
  p_orcamento_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prestador_id uuid;
  v_solicitacao_id uuid;
  v_orc_status text;
  v_remaining_count int;
BEGIN
  SELECT prestador_id, solicitacao_id, status::text
  INTO v_prestador_id, v_solicitacao_id, v_orc_status
  FROM orcamentos
  WHERE id = p_orcamento_id AND deleted_at IS NULL;

  IF v_prestador_id IS NULL THEN
    RAISE EXCEPTION 'Orçamento não encontrado';
  END IF;
  IF v_prestador_id != auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;
  IF v_orc_status NOT IN ('rascunho', 'enviado') THEN
    RAISE EXCEPTION 'Orçamento não pode ser excluído (status: %)', v_orc_status;
  END IF;

  -- Soft delete do orçamento
  UPDATE orcamentos
  SET deleted_at = now()
  WHERE id = p_orcamento_id;

  -- Contar orçamentos ativos restantes
  SELECT count(*) INTO v_remaining_count
  FROM orcamentos
  WHERE solicitacao_id = v_solicitacao_id AND deleted_at IS NULL;

  -- Reverter solicitação se não restaram orçamentos
  IF v_remaining_count = 0 THEN
    UPDATE solicitacoes_orcamento
    SET status = 'aguardando_orcamento'
    WHERE id = v_solicitacao_id;
  END IF;
END;
$$;

-- Grants
GRANT EXECUTE ON FUNCTION recusar_orcamento(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION deletar_orcamento_prestador(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION recusar_orcamento(uuid, text) FROM anon;
REVOKE EXECUTE ON FUNCTION deletar_orcamento_prestador(uuid) FROM anon;
