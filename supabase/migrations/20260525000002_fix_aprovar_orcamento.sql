-- Migration: Fix aprovar_orcamento function and criar_notificacao_automatica trigger
-- Problema: "invalid input value for enum os_status_enum: enviado"
-- Causa: o trigger criar_notificacao_automatica usa a mesma função para orcamentos e ordens_servico.
-- Quando a função roda no contexto de ordens_servico (INSERT), o PostgreSQL tenta converter
-- o literal 'enviado' para os_status_enum (o tipo do campo status em ordens_servico), causando erro.
-- Solução: usar NEW.status::TEXT para fazer comparações genéricas de status.

-- 1. Recriar aprovar_orcamento com casts de enum explícitos
CREATE OR REPLACE FUNCTION aprovar_orcamento(p_orcamento_id UUID)
RETURNS UUID AS $$
DECLARE
  v_os_id         UUID;
  v_solicitacao_id UUID;
  v_cliente_id    UUID;
  v_prestador_id  UUID;
BEGIN
  SELECT o.solicitacao_id, o.prestador_id
  INTO v_solicitacao_id, v_prestador_id
  FROM orcamentos o
  WHERE o.id = p_orcamento_id AND o.status = 'enviado'::orcamento_status_enum
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Orçamento % não encontrado ou não está em status enviado', p_orcamento_id;
  END IF;

  SELECT s.cliente_id
  INTO v_cliente_id
  FROM solicitacoes_orcamento s
  WHERE s.id = v_solicitacao_id;

  UPDATE orcamentos
  SET status = 'aceito'::orcamento_status_enum, updated_at = NOW()
  WHERE id = p_orcamento_id;

  UPDATE solicitacoes_orcamento
  SET status = 'aprovado'::solicitacao_status_enum, updated_at = NOW()
  WHERE id = v_solicitacao_id;

  INSERT INTO ordens_servico (orcamento_id, solicitacao_id, cliente_id, prestador_id, status)
  VALUES (p_orcamento_id, v_solicitacao_id, v_cliente_id, v_prestador_id, 'aberta'::os_status_enum)
  RETURNING id INTO v_os_id;

  RETURN v_os_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION aprovar_orcamento(UUID) TO authenticated;

-- 2. Recriar criar_notificacao_automatica usando NEW.status::TEXT para evitar erro de enum
CREATE OR REPLACE FUNCTION public.criar_notificacao_automatica()
RETURNS TRIGGER AS $$
DECLARE
  v_cliente_id UUID;
  v_titulo_solicitacao TEXT;
BEGIN
  -- A. Notificar cliente quando orcamento for enviado
  IF TG_TABLE_NAME = 'orcamentos' AND NEW.status::TEXT = 'enviado' AND (OLD.status IS DISTINCT FROM NEW.status OR OLD.id IS NULL) THEN
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

  -- B. Notificar prestador quando orcamento for aceito (e OS criada)
  IF TG_TABLE_NAME = 'orcamentos' AND NEW.status::TEXT = 'aceito' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
    VALUES (
      NEW.prestador_id,
      'orcamento_aprovado',
      'Orçamento Aprovado!',
      'O cliente aceitou seu orçamento ' || NEW.numero || '. Uma Ordem de Serviço foi gerada.'
    );
  END IF;

  -- C. Notificar prestador quando orcamento for recusado
  IF TG_TABLE_NAME = 'orcamentos' AND NEW.status::TEXT = 'recusado' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
    VALUES (
      NEW.prestador_id,
      'status_alterado',
      'Orçamento Recusado',
      'Seu orçamento ' || NEW.numero || ' foi recusado pelo cliente.'
    );
  END IF;

  -- D. Notificacoes sobre Ordens de Servico (OS)
  IF TG_TABLE_NAME = 'ordens_servico' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
      VALUES 
        (NEW.cliente_id, 'os_criada', 'Ordem de Serviço Aberta', 'A OS ' || NEW.numero || ' foi gerada e está pronta para início.'),
        (NEW.prestador_id, 'os_criada', 'Nova OS Atribuída', 'Você tem uma nova OS ' || NEW.numero || ' atribuída para execução.');
    ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
      INSERT INTO notificacoes (usuario_id, tipo, titulo, mensagem)
      VALUES 
        (NEW.cliente_id, 'status_alterado', 'Status da OS ' || NEW.numero, 'A Ordem de Serviço mudou para o status: ' || NEW.status::TEXT),
        (NEW.prestador_id, 'status_alterado', 'Status da OS ' || NEW.numero, 'A Ordem de Serviço mudou para o status: ' || NEW.status::TEXT);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
