-- Migration 2: RLS Policies OrçaFácil

-- Enable RLS on all tables
ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE solicitacoes_orcamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE orcamentos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_orcamento       ENABLE ROW LEVEL SECURITY;
ALTER TABLE ordens_servico        ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_historico      ENABLE ROW LEVEL SECURITY;

-- profiles: user sees and edits own profile only
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- solicitacoes_orcamento: cliente full CRUD own; prestador SELECT where they have an orcamento
CREATE POLICY "solicitacoes_insert_cliente" ON solicitacoes_orcamento
  FOR INSERT WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "solicitacoes_select_cliente" ON solicitacoes_orcamento
  FOR SELECT USING (auth.uid() = cliente_id);

CREATE POLICY "solicitacoes_update_cliente" ON solicitacoes_orcamento
  FOR UPDATE USING (auth.uid() = cliente_id);

CREATE POLICY "solicitacoes_delete_cliente" ON solicitacoes_orcamento
  FOR DELETE USING (auth.uid() = cliente_id);

CREATE POLICY "solicitacoes_select_prestador" ON solicitacoes_orcamento
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.solicitacao_id = solicitacoes_orcamento.id
        AND o.prestador_id = auth.uid()
    )
  );

-- orcamentos: prestador full CRUD own; cliente SELECT via solicitacao ownership
CREATE POLICY "orcamentos_insert_prestador" ON orcamentos
  FOR INSERT WITH CHECK (auth.uid() = prestador_id);

CREATE POLICY "orcamentos_select_prestador" ON orcamentos
  FOR SELECT USING (auth.uid() = prestador_id);

CREATE POLICY "orcamentos_update_prestador" ON orcamentos
  FOR UPDATE USING (auth.uid() = prestador_id);

CREATE POLICY "orcamentos_delete_prestador" ON orcamentos
  FOR DELETE USING (auth.uid() = prestador_id);

CREATE POLICY "orcamentos_select_cliente" ON orcamentos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM solicitacoes_orcamento s
      WHERE s.id = orcamentos.solicitacao_id
        AND s.cliente_id = auth.uid()
    )
  );

-- itens_orcamento: inherited via orcamento_id
CREATE POLICY "itens_select_prestador" ON itens_orcamento
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

CREATE POLICY "itens_select_cliente" ON itens_orcamento
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orcamentos o
      JOIN solicitacoes_orcamento s ON s.id = o.solicitacao_id
      WHERE o.id = itens_orcamento.orcamento_id AND s.cliente_id = auth.uid()
    )
  );

CREATE POLICY "itens_insert_prestador" ON itens_orcamento
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

CREATE POLICY "itens_update_prestador" ON itens_orcamento
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

CREATE POLICY "itens_delete_prestador" ON itens_orcamento
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

-- ordens_servico: cliente and prestador SELECT own; INSERT only via SECURITY DEFINER (aprovar_orcamento)
CREATE POLICY "os_select_cliente" ON ordens_servico
  FOR SELECT USING (auth.uid() = cliente_id);

CREATE POLICY "os_select_prestador" ON ordens_servico
  FOR SELECT USING (auth.uid() = prestador_id);

-- status_historico: SELECT for records related to the user
CREATE POLICY "historico_select_usuario" ON status_historico
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM solicitacoes_orcamento s
      WHERE s.id = status_historico.registro_id AND s.cliente_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = status_historico.registro_id AND o.prestador_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM ordens_servico os
      WHERE os.id = status_historico.registro_id
        AND (os.cliente_id = auth.uid() OR os.prestador_id = auth.uid())
    )
  );
