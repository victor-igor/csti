-- Migration 1: Schema principal OrçaFácil

-- Enums
CREATE TYPE role_enum AS ENUM ('cliente', 'prestador');
CREATE TYPE solicitacao_status_enum AS ENUM ('aberta', 'aguardando_orcamento', 'orcamento_enviado', 'aprovado', 'cancelado');
CREATE TYPE orcamento_status_enum AS ENUM ('rascunho', 'enviado', 'aceito', 'recusado');
CREATE TYPE os_status_enum AS ENUM ('aberta', 'em_andamento', 'concluida', 'cancelada');

-- Sequences
CREATE SEQUENCE IF NOT EXISTS seq_solicitacao START 1;
CREATE SEQUENCE IF NOT EXISTS seq_orcamento START 1;
CREATE SEQUENCE IF NOT EXISTS seq_os START 1;

-- Formatted number generator functions
CREATE OR REPLACE FUNCTION gerar_numero_solicitacao()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SOL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('seq_solicitacao')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION gerar_numero_orcamento()
RETURNS TEXT AS $$
BEGIN
  RETURN 'ORC-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('seq_orcamento')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION gerar_numero_os()
RETURNS TEXT AS $$
BEGIN
  RETURN 'OS-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(nextval('seq_os')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Table: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id        UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome      TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  role      role_enum NOT NULL,
  telefone  TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: solicitacoes_orcamento
CREATE TABLE IF NOT EXISTS solicitacoes_orcamento (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero      TEXT NOT NULL UNIQUE DEFAULT gerar_numero_solicitacao(),
  cliente_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  titulo      TEXT NOT NULL,
  descricao   TEXT NOT NULL,
  status      solicitacao_status_enum NOT NULL DEFAULT 'aberta',
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: orcamentos
CREATE TABLE IF NOT EXISTS orcamentos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero         TEXT NOT NULL UNIQUE DEFAULT gerar_numero_orcamento(),
  solicitacao_id UUID NOT NULL REFERENCES solicitacoes_orcamento(id) ON DELETE RESTRICT,
  prestador_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status         orcamento_status_enum NOT NULL DEFAULT 'rascunho',
  observacoes    TEXT,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: itens_orcamento
CREATE TABLE IF NOT EXISTS itens_orcamento (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id    UUID NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
  descricao       TEXT NOT NULL,
  quantidade      NUMERIC(10,2) NOT NULL CHECK (quantidade > 0),
  valor_unitario  NUMERIC(10,2) NOT NULL CHECK (valor_unitario >= 0),
  valor_total     NUMERIC(10,2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: ordens_servico
CREATE TABLE IF NOT EXISTS ordens_servico (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero         TEXT NOT NULL UNIQUE DEFAULT gerar_numero_os(),
  orcamento_id   UUID NOT NULL REFERENCES orcamentos(id) ON DELETE RESTRICT,
  solicitacao_id UUID NOT NULL REFERENCES solicitacoes_orcamento(id) ON DELETE RESTRICT,
  cliente_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  prestador_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status         os_status_enum NOT NULL DEFAULT 'aberta',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: status_historico
CREATE TABLE IF NOT EXISTS status_historico (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabela_nome     TEXT NOT NULL,
  registro_id     UUID NOT NULL,
  status_anterior TEXT,
  status_novo     TEXT NOT NULL,
  usuario_id      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Function: registrar_status_historico (trigger)
CREATE OR REPLACE FUNCTION registrar_status_historico()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO status_historico (tabela_nome, registro_id, status_anterior, status_novo, usuario_id)
    VALUES (TG_TABLE_NAME, NEW.id, OLD.status::TEXT, NEW.status::TEXT, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_status_historico_solicitacoes
  AFTER UPDATE ON solicitacoes_orcamento
  FOR EACH ROW EXECUTE FUNCTION registrar_status_historico();

CREATE TRIGGER trg_status_historico_orcamentos
  AFTER UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION registrar_status_historico();

CREATE TRIGGER trg_status_historico_os
  AFTER UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION registrar_status_historico();

-- Function: handle_new_user (trigger on auth.users)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'cliente')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_handle_new_user
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_solicitacoes_cliente_id  ON solicitacoes_orcamento(cliente_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_status      ON solicitacoes_orcamento(status);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_deleted_at  ON solicitacoes_orcamento(deleted_at);

CREATE INDEX IF NOT EXISTS idx_orcamentos_solicitacao_id ON orcamentos(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_prestador_id   ON orcamentos(prestador_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status         ON orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamentos_deleted_at     ON orcamentos(deleted_at);

CREATE INDEX IF NOT EXISTS idx_itens_orcamento_id ON itens_orcamento(orcamento_id);

CREATE INDEX IF NOT EXISTS idx_os_orcamento_id   ON ordens_servico(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_os_solicitacao_id ON ordens_servico(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_os_cliente_id     ON ordens_servico(cliente_id);
CREATE INDEX IF NOT EXISTS idx_os_prestador_id   ON ordens_servico(prestador_id);
CREATE INDEX IF NOT EXISTS idx_os_status         ON ordens_servico(status);

CREATE INDEX IF NOT EXISTS idx_historico_registro_id ON status_historico(registro_id);
CREATE INDEX IF NOT EXISTS idx_historico_tabela      ON status_historico(tabela_nome);
