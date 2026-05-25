-- Migration 9: Correção de Recursão Infinita no RLS (Stack Depth Limit Exceeded)

-- 1. FUNÇÃO SECURITY DEFINER PARA PRESTADOR VERIFICAR SE TEM ORÇAMENTO NA SOLICITAÇÃO (Evita RLS loop)
CREATE OR REPLACE FUNCTION public.check_prestador_has_orcamento(p_user_id UUID, p_solicitacao_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.orcamentos
    WHERE solicitacao_id = p_solicitacao_id AND prestador_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. FUNÇÃO SECURITY DEFINER PARA CLIENTE VERIFICAR SE É DONO DA SOLICITAÇÃO DO ORÇAMENTO (Evita RLS loop)
CREATE OR REPLACE FUNCTION public.check_cliente_owns_solicitacao(p_user_id UUID, p_solicitacao_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.solicitacoes_orcamento
    WHERE id = p_solicitacao_id AND cliente_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. ATUALIZAR POLÍTICA "solicitacoes_select_prestador" EM solicitacoes_orcamento
DROP POLICY IF EXISTS "solicitacoes_select_prestador" ON public.solicitacoes_orcamento;
CREATE POLICY "solicitacoes_select_prestador" ON public.solicitacoes_orcamento
  FOR SELECT USING (
    public.check_user_approved(auth.uid()) AND
    public.check_prestador_has_orcamento(auth.uid(), id)
  );

-- 4. ATUALIZAR POLÍTICA "orcamentos_select_cliente" EM orcamentos
DROP POLICY IF EXISTS "orcamentos_select_cliente" ON public.orcamentos;
CREATE POLICY "orcamentos_select_cliente" ON public.orcamentos
  FOR SELECT USING (
    public.check_user_approved(auth.uid()) AND
    public.check_cliente_owns_solicitacao(auth.uid(), solicitacao_id)
  );
