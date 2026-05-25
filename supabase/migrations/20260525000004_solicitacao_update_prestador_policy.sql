-- Migration 14: Permitir que Prestadores atualizem o status da solicitação associada a orçamentos

-- Criar política que permite ao prestador atualizar o status da solicitação de orçamento
-- para 'orcamento_enviado' ou de volta para 'aguardando_orcamento'
DROP POLICY IF EXISTS "solicitacoes_update_prestador" ON public.solicitacoes_orcamento;

CREATE POLICY "solicitacoes_update_prestador" ON public.solicitacoes_orcamento
  FOR UPDATE
  USING (
    -- O usuário precisa estar aprovado e ter perfil de prestador
    public.check_user_approved(auth.uid()) AND
    public.check_user_role(auth.uid(), 'prestador') AND
    -- Deve haver um orçamento desse prestador para esta solicitação
    EXISTS (
      SELECT 1 FROM public.orcamentos o
      WHERE o.solicitacao_id = public.solicitacoes_orcamento.id
        AND o.prestador_id = auth.uid()
    )
  )
  WITH CHECK (
    -- O novo status só pode ser alterado para os estados controlados pelo fluxo do prestador
    status IN ('orcamento_enviado', 'aguardando_orcamento')
  );
