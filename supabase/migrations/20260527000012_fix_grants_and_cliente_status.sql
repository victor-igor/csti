-- ============================================================
-- Fix grants para funções helper (algumas podem estar sem grant)
-- Fix P6: orcamentos_update_cliente não restringia status escrevível
-- ============================================================

-- Garantir grants em todas as funções helper
GRANT EXECUTE ON FUNCTION public.check_user_approved(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_user_role(uuid, role_enum) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_solicitacao_cliente_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aprovar_orcamento(uuid) TO authenticated;

-- Revogar anon de helpers de segurança
REVOKE EXECUTE ON FUNCTION public.get_orcamento_current_status(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_orcamento_fks_unchanged(uuid, uuid, uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.check_solicitacao_fields_unchanged(uuid, uuid, text, timestamptz) FROM anon;

-- Fix P6: orcamentos_update_cliente — restringir status a apenas 'aceito'
-- (recusar vai via RPC, aprovar vai via aprovar_orcamento RPC)
DROP POLICY IF EXISTS "orcamentos_update_cliente" ON orcamentos;
CREATE POLICY "orcamentos_update_cliente" ON orcamentos
  FOR UPDATE
  USING (get_solicitacao_cliente_id(solicitacao_id) = auth.uid())
  WITH CHECK (
    get_solicitacao_cliente_id(solicitacao_id) = auth.uid()
    AND check_orcamento_fks_unchanged(id, solicitacao_id, prestador_id)
    -- Cliente só pode marcar como aceito via policy direta
    -- Recusa vai via RPC recusar_orcamento (SECURITY DEFINER)
    AND status = 'aceito'
  );

-- Fix P5: enviar_orcamento — verificar prestador ativo
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
  v_ativo boolean;
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

  -- Verificar se prestador está ativo
  SELECT ativo INTO v_ativo FROM profiles WHERE id = auth.uid();
  IF v_ativo IS NOT TRUE THEN
    RAISE EXCEPTION 'Conta de prestador desativada';
  END IF;

  IF v_status != 'rascunho' THEN
    RAISE EXCEPTION 'Orçamento não está em rascunho (status: %)', v_status;
  END IF;

  UPDATE orcamentos SET status = 'enviado' WHERE id = p_orcamento_id;
  UPDATE solicitacoes_orcamento SET status = 'orcamento_enviado' WHERE id = v_solicitacao_id;
END;
$$;

GRANT EXECUTE ON FUNCTION enviar_orcamento(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION enviar_orcamento(uuid) FROM anon;
