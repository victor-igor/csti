-- Migration 3: Função RPC atômica aprovar_orcamento

CREATE OR REPLACE FUNCTION aprovar_orcamento(p_orcamento_id UUID)
RETURNS UUID AS $$
DECLARE
  v_os_id         UUID;
  v_solicitacao_id UUID;
  v_cliente_id    UUID;
  v_prestador_id  UUID;
BEGIN
  -- Validate orcamento exists and is in 'enviado' status; lock row
  SELECT o.solicitacao_id, o.prestador_id
  INTO v_solicitacao_id, v_prestador_id
  FROM orcamentos o
  WHERE o.id = p_orcamento_id AND o.status = 'enviado'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orçamento % não encontrado ou não está em status enviado', p_orcamento_id;
  END IF;

  -- Get cliente_id from solicitacao
  SELECT s.cliente_id
  INTO v_cliente_id
  FROM solicitacoes_orcamento s
  WHERE s.id = v_solicitacao_id;

  -- Atomically: update orcamento → aceito
  UPDATE orcamentos
  SET status = 'aceito', updated_at = NOW()
  WHERE id = p_orcamento_id;

  -- Atomically: update solicitacao → aprovado
  UPDATE solicitacoes_orcamento
  SET status = 'aprovado', updated_at = NOW()
  WHERE id = v_solicitacao_id;

  -- Atomically: create ordem de servico
  INSERT INTO ordens_servico (orcamento_id, solicitacao_id, cliente_id, prestador_id)
  VALUES (p_orcamento_id, v_solicitacao_id, v_cliente_id, v_prestador_id)
  RETURNING id INTO v_os_id;

  RETURN v_os_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION aprovar_orcamento(UUID) TO authenticated;
