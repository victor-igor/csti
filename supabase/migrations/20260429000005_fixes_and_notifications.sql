-- Migration 5: Correções de RLS (Perfis, Solicitações e Ordens de Serviço) e Automação de Notificações via Triggers

-- 1. CORREÇÃO DE LEITURA DOS PERFIS (Profiles)
-- Permite que qualquer usuário autenticado leia as informações públicas de perfil (nome, especialidade, telefone, etc.)
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated');

-- 2. CORREÇÃO DE LEITURA DE SOLICITAÇÕES PARA PRESTADORES
-- Permite que prestadores leiam solicitações que estejam aguardando orçamento para que possam enviar propostas
DROP POLICY IF EXISTS "solicitacoes_select_open_prestador" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_select_open_prestador" ON solicitacoes_orcamento
  FOR SELECT USING (
    status = 'aguardando_orcamento' AND
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'prestador'
    )
  );

-- 3. CORREÇÃO DE ATUALIZAÇÃO DE ORDENS DE SERVIÇO
-- Permite que prestadores e clientes atualizem o status das ordens de serviço às quais estão vinculados
DROP POLICY IF EXISTS "os_update_prestador" ON ordens_servico;
CREATE POLICY "os_update_prestador" ON ordens_servico
  FOR UPDATE USING (auth.uid() = prestador_id);

DROP POLICY IF EXISTS "os_update_cliente" ON ordens_servico;
CREATE POLICY "os_update_cliente" ON ordens_servico
  FOR UPDATE USING (auth.uid() = cliente_id);

-- 4. AUTOMAÇÃO DE NOTIFICAÇÕES (Triggers do Banco)
CREATE OR REPLACE FUNCTION criar_notificacao_automatica()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_titulo_solicitacao TEXT;
BEGIN
  -- A. Notificar cliente quando orçamento for enviado
  IF TG_TABLE_NAME = 'orcamentos' AND NEW.status = 'enviado' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.id IS NULL) THEN
    -- Obter cliente_id e titulo da solicitação associada
    SELECT cliente_id, titulo
    INTO v_cliente_id, v_titulo_solicitacao
    FROM solicitacoes_orcamento
    WHERE id = NEW.solicitacao_id;

    IF FOUND THEN
      INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
      VALUES (
        v_cliente_id,
        'orcamento_recebido',
        'Novo orçamento recebido',
        'Você recebeu o orçamento ' || NEW.numero || ' para a solicitação: ' || v_titulo_solicitacao
      );
    END IF;
  END IF;

  -- B. Notificar prestador quando orçamento for aceito (e OS criada)
  IF TG_TABLE_NAME = 'orcamentos' AND NEW.status = 'aceito' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
    VALUES (
      NEW.prestador_id,
      'orcamento_aprovado',
      'Orçamento Aprovado!',
      'O cliente aceitou seu orçamento ' || NEW.numero || '. Uma Ordem de Serviço foi gerada.'
    );
  END IF;

  -- C. Notificar prestador quando orçamento for recusado
  IF TG_TABLE_NAME = 'orcamentos' AND NEW.status = 'recusado' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
    VALUES (
      NEW.prestador_id,
      'status_alterado',
      'Orçamento Recusado',
      'Seu orçamento ' || NEW.numero || ' foi recusado pelo cliente.'
    );
  END IF;

  -- D. Notificações sobre Ordens de Serviço (OS)
  IF TG_TABLE_NAME = 'ordens_servico' THEN
    IF TG_OP = 'INSERT' THEN
      -- OS criada
      INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
      VALUES 
        (NEW.cliente_id, 'os_criada', 'Ordem de Serviço Aberta', 'A OS ' || NEW.numero || ' foi gerada e está pronta para início.'),
        (NEW.prestador_id, 'os_criada', 'Nova OS Atribuída', 'Você tem uma nova OS ' || NEW.numero || ' atribuída para execução.');
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
      -- Status da OS alterado
      INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
      VALUES 
        (NEW.cliente_id, 'status_alterado', 'Status da OS ' || NEW.numero, 'A Ordem de Serviço mudou para o status: ' || NEW.status),
        (NEW.prestador_id, 'status_alterado', 'Status da OS ' || NEW.numero, 'A Ordem de Serviço mudou para o status: ' || NEW.status);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar Triggers para orcamentos
DROP TRIGGER IF EXISTS trg_notificacoes_orcamentos ON orcamentos;
CREATE TRIGGER trg_notificacoes_orcamentos
  AFTER INSERT OR UPDATE ON orcamentos
  FOR EACH ROW EXECUTE FUNCTION criar_notificacao_automatica();

-- Criar Triggers para ordens_servico
DROP TRIGGER IF EXISTS trg_notificacoes_os ON ordens_servico;
CREATE TRIGGER trg_notificacoes_os
  AFTER INSERT OR UPDATE ON ordens_servico
  FOR EACH ROW EXECUTE FUNCTION criar_notificacao_automatica();
