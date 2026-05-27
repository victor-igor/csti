-- Migration: Criar policies RLS para mensagens_solicitacao
-- Corrige C1: tabela tinha RLS habilitado mas zero policies → chat completamente quebrado

-- Participantes podem ver mensagens da solicitação onde têm acesso
-- (cliente dono da solicitação OU prestador que tem orçamento na solicitação)
CREATE POLICY "mensagens_select_participante" ON mensagens_solicitacao
  FOR SELECT USING (
    check_user_approved(auth.uid()) AND (
      EXISTS (
        SELECT 1 FROM solicitacoes_orcamento s
        WHERE s.id = mensagens_solicitacao.solicitacao_id
          AND s.cliente_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM orcamentos o
        WHERE o.solicitacao_id = mensagens_solicitacao.solicitacao_id
          AND o.prestador_id = auth.uid()
      )
    )
  );

-- Participante aprovado pode inserir mensagem como ele mesmo
CREATE POLICY "mensagens_insert_participante" ON mensagens_solicitacao
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id
    AND check_user_approved(auth.uid())
    AND (
      EXISTS (
        SELECT 1 FROM solicitacoes_orcamento s
        WHERE s.id = mensagens_solicitacao.solicitacao_id
          AND s.cliente_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM orcamentos o
        WHERE o.solicitacao_id = mensagens_solicitacao.solicitacao_id
          AND o.prestador_id = auth.uid()
      )
    )
  );

-- Admin e super_admin têm acesso total
CREATE POLICY "mensagens_admin_all" ON mensagens_solicitacao
  FOR ALL USING (
    check_user_role(auth.uid(), 'admin'::role_enum) OR
    check_user_role(auth.uid(), 'super_admin'::role_enum)
  );
