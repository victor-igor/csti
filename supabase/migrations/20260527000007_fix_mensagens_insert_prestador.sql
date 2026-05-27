-- Atualiza policy de INSERT em mensagens_solicitacao
-- Antes: prestador só podia mensagem se já tinha orçamento
-- Depois: prestador pode mensagem se é participante (orçou) OU se a solicitação está aberta na sua categoria

DROP POLICY IF EXISTS "mensagens_insert_participante" ON mensagens_solicitacao;

CREATE POLICY "mensagens_insert_participante" ON mensagens_solicitacao
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id
    AND check_user_approved(auth.uid())
    AND (
      -- Cliente dono da solicitação
      EXISTS (
        SELECT 1 FROM solicitacoes_orcamento s
        WHERE s.id = mensagens_solicitacao.solicitacao_id
          AND s.cliente_id = auth.uid()
      )
      OR
      -- Prestador que já enviou orçamento
      EXISTS (
        SELECT 1 FROM orcamentos o
        WHERE o.solicitacao_id = mensagens_solicitacao.solicitacao_id
          AND o.prestador_id = auth.uid()
          AND o.deleted_at IS NULL
      )
      OR
      -- Prestador ativo cuja categoria bate com a solicitação aberta
      EXISTS (
        SELECT 1
        FROM solicitacoes_orcamento s
        JOIN profiles p ON p.id = auth.uid()
        WHERE s.id = mensagens_solicitacao.solicitacao_id
          AND s.status = 'aguardando_orcamento'
          AND s.deleted_at IS NULL
          AND p.role = 'prestador'
          AND p.ativo = true
          AND (
            p.especialidade IS NULL
            OR p.especialidade = '{}'
            OR s.categoria = ANY(p.especialidade)
          )
      )
    )
  );

-- Atualiza policy de SELECT para ficar consistente com INSERT

DROP POLICY IF EXISTS "mensagens_select_participante" ON mensagens_solicitacao;

CREATE POLICY "mensagens_select_participante" ON mensagens_solicitacao
  FOR SELECT USING (
    check_user_approved(auth.uid())
    AND (
      -- Cliente dono da solicitação
      EXISTS (
        SELECT 1 FROM solicitacoes_orcamento s
        WHERE s.id = mensagens_solicitacao.solicitacao_id
          AND s.cliente_id = auth.uid()
      )
      OR
      -- Prestador que já enviou orçamento
      EXISTS (
        SELECT 1 FROM orcamentos o
        WHERE o.solicitacao_id = mensagens_solicitacao.solicitacao_id
          AND o.prestador_id = auth.uid()
          AND o.deleted_at IS NULL
      )
      OR
      -- Prestador ativo cuja categoria bate com a solicitação aberta
      EXISTS (
        SELECT 1
        FROM solicitacoes_orcamento s
        JOIN profiles p ON p.id = auth.uid()
        WHERE s.id = mensagens_solicitacao.solicitacao_id
          AND s.status = 'aguardando_orcamento'
          AND s.deleted_at IS NULL
          AND p.role = 'prestador'
          AND p.ativo = true
          AND (
            p.especialidade IS NULL
            OR p.especialidade = '{}'
            OR s.categoria = ANY(p.especialidade)
          )
      )
    )
  );
