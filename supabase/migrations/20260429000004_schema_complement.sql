-- Migration 4: Schema complement — campos de ciclo de vida, auditoria e notificações

-- profiles: campos do prestador
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS especialidade TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS documento    TEXT; -- CPF ou CNPJ

-- solicitacoes_orcamento: categoria e equipamento
ALTER TABLE solicitacoes_orcamento ADD COLUMN IF NOT EXISTS categoria   TEXT;
ALTER TABLE solicitacoes_orcamento ADD COLUMN IF NOT EXISTS equipamento TEXT;

-- orcamentos: validade e prazo estimado
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS prazo_estimado_dias INT;
ALTER TABLE orcamentos ADD COLUMN IF NOT EXISTS validade_ate        DATE;

-- ordens_servico: ciclo de vida completo
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS data_inicio    TIMESTAMPTZ;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS data_conclusao TIMESTAMPTZ;
ALTER TABLE ordens_servico ADD COLUMN IF NOT EXISTS observacoes    TEXT;

-- status_historico: contexto da mudança
ALTER TABLE status_historico ADD COLUMN IF NOT EXISTS observacao TEXT;

-- Trigger automático de updated_at (evita dependência de código de aplicação)
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_solicitacoes
  BEFORE UPDATE ON solicitacoes_orcamento
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_orcamentos
  BEFORE UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_updated_at_os
  BEFORE UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Tabela: notificacoes (RQ_08)
CREATE TABLE IF NOT EXISTS notificacoes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tipo       TEXT NOT NULL,  -- 'orcamento_recebido' | 'os_criada' | 'status_alterado' | 'orcamento_aprovado'
  titulo     TEXT NOT NULL,
  mensagem   TEXT,
  lida       BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida       ON notificacoes(lida);

-- RLS para notificacoes
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notificacoes_select_own" ON notificacoes
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "notificacoes_update_own" ON notificacoes
  FOR UPDATE USING (auth.uid() = usuario_id);
