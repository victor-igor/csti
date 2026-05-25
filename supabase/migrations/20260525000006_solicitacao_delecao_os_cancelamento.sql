-- Migration 16: Triggers para Sincronização de Cancelamento de OS e Soft Delete de Solicitações

-- 1. TRIGGER PARA TRATAR CANCELAMENTO DE OS
-- Quando uma Ordem de Serviço (OS) é cancelada, a solicitação de orçamento correspondente
-- deve voltar automaticamente para o status 'aguardando_orcamento' para permitir novas propostas.
CREATE OR REPLACE FUNCTION public.handle_os_cancelada()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelada' AND OLD.status IS DISTINCT FROM 'cancelada' THEN
    -- Reverter a solicitação vinculada de volta para 'aguardando_orcamento'
    UPDATE public.solicitacoes_orcamento
    SET status = 'aguardando_orcamento'
    WHERE id = NEW.solicitacao_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_os_cancelada ON public.ordens_servico;
CREATE TRIGGER trg_handle_os_cancelada
  AFTER UPDATE ON public.ordens_servico
  FOR EACH ROW EXECUTE FUNCTION public.handle_os_cancelada();


-- 2. TRIGGER PARA TRATAR SOFT DELETE DE SOLICITAÇÃO
-- Quando uma solicitação de orçamento é deletada logicamente (deleted_at marcado),
-- todos os orçamentos associados também são deletados logicamente de forma em cascata.
CREATE OR REPLACE FUNCTION public.handle_solicitacao_soft_deleted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
    -- Soft deletar todos os orçamentos associados
    UPDATE public.orcamentos
    SET deleted_at = NEW.deleted_at
    WHERE solicitacao_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_handle_solicitacao_soft_deleted ON public.solicitacoes_orcamento;
CREATE TRIGGER trg_handle_solicitacao_soft_deleted
  AFTER UPDATE ON public.solicitacoes_orcamento
  FOR EACH ROW EXECUTE FUNCTION public.handle_solicitacao_soft_deleted();
