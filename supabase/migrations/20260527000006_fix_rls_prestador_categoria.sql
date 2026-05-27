-- Corrige a policy de SELECT do prestador em solicitacoes_orcamento
-- Antes: só via solicitações onde já tinha orçado
-- Depois: vê solicitações abertas da sua categoria + as que já orçou

DROP POLICY IF EXISTS "solicitacoes_select_prestador" ON solicitacoes_orcamento;

CREATE POLICY "solicitacoes_select_prestador" ON solicitacoes_orcamento
  FOR SELECT USING (
    -- Já enviou orçamento para essa solicitação
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.solicitacao_id = solicitacoes_orcamento.id
        AND o.prestador_id = auth.uid()
        AND o.deleted_at IS NULL
    )
    OR
    -- Solicitação aberta e na categoria que o prestador atende
    (
      solicitacoes_orcamento.status = 'aguardando_orcamento'
      AND solicitacoes_orcamento.deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
          AND p.role = 'prestador'
          AND p.ativo = true
          AND (
            -- Sem especialidade definida: vê tudo (ainda configurando o perfil)
            p.especialidade IS NULL
            OR p.especialidade = '{}'
            -- Com especialidade: só da sua categoria
            OR solicitacoes_orcamento.categoria = ANY(p.especialidade)
          )
      )
    )
  );
