-- Migration 7: Fila de Aprovação de Cadastros, RLS Reforçado e Acesso de Administrador
-- Nota: Esta migração assume que a role 'admin' já foi adicionada ao tipo role_enum no passo anterior.

-- 1. ADICIONAR COLUNA DE APROVAÇÃO À TABELA PROFILES
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS status_aprovacao TEXT NOT NULL DEFAULT 'pendente' 
  CHECK (status_aprovacao IN ('pendente', 'aprovado', 'recusado'));

-- Atualizar usuários existentes para 'aprovado' para evitar lockout
UPDATE public.profiles SET status_aprovacao = 'aprovado' WHERE status_aprovacao = 'pendente';

-- 2. FUNÇÃO AUXILIAR SECURITY DEFINER PARA EVITAR RECURSÃO NO RLS DE PROFILES (VERIFICAR ROLE)
CREATE OR REPLACE FUNCTION public.check_user_role(p_user_id UUID, p_role role_enum)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. FUNÇÃO AUXILIAR SECURITY DEFINER PARA VERIFICAR SE USUÁRIO ESTÁ APROVADO
CREATE OR REPLACE FUNCTION public.check_user_approved(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Admins são sempre considerados aprovados
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'admin') THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND status_aprovacao = 'aprovado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. POLÍTICAS DE RLS DE SUPERUSUÁRIO PARA ADMIN (Acesso irrestrito)
DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (public.check_user_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "solicitacoes_admin_all" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_admin_all" ON solicitacoes_orcamento FOR ALL USING (public.check_user_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "orcamentos_admin_all" ON orcamentos;
CREATE POLICY "orcamentos_admin_all" ON orcamentos FOR ALL USING (public.check_user_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "itens_admin_all" ON itens_orcamento;
CREATE POLICY "itens_admin_all" ON itens_orcamento FOR ALL USING (public.check_user_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "os_admin_all" ON ordens_servico;
CREATE POLICY "os_admin_all" ON ordens_servico FOR ALL USING (public.check_user_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "historico_admin_all" ON status_historico;
CREATE POLICY "historico_admin_all" ON status_historico FOR ALL USING (public.check_user_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "notificacoes_admin_all" ON notificacoes;
CREATE POLICY "notificacoes_admin_all" ON notificacoes FOR ALL USING (public.check_user_role(auth.uid(), 'admin'));

-- 5. REFORÇO DE SEGURANÇA (RLS) PARA USUÁRIOS COMUNS (Exige status_aprovacao = 'aprovado')

-- profiles: Leitura de outros perfis (apenas por usuários aprovados)
DROP POLICY IF EXISTS "profiles_select_authenticated" ON profiles;
CREATE POLICY "profiles_select_authenticated" ON profiles
  FOR SELECT USING (auth.role() = 'authenticated' AND public.check_user_approved(auth.uid()));

-- solicitacoes_orcamento:
DROP POLICY IF EXISTS "solicitacoes_insert_cliente" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_insert_cliente" ON solicitacoes_orcamento
  FOR INSERT WITH CHECK (auth.uid() = cliente_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "solicitacoes_select_cliente" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_select_cliente" ON solicitacoes_orcamento
  FOR SELECT USING (auth.uid() = cliente_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "solicitacoes_update_cliente" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_update_cliente" ON solicitacoes_orcamento
  FOR UPDATE USING (auth.uid() = cliente_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "solicitacoes_delete_cliente" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_delete_cliente" ON solicitacoes_orcamento
  FOR DELETE USING (auth.uid() = cliente_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "solicitacoes_select_prestador" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_select_prestador" ON solicitacoes_orcamento
  FOR SELECT USING (
    public.check_user_approved(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.solicitacao_id = solicitacoes_orcamento.id
        AND o.prestador_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "solicitacoes_select_open_prestador" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_select_open_prestador" ON solicitacoes_orcamento
  FOR SELECT USING (
    status = 'aguardando_orcamento' AND
    public.check_user_approved(auth.uid()) AND
    public.check_user_role(auth.uid(), 'prestador')
  );

-- orcamentos:
DROP POLICY IF EXISTS "orcamentos_insert_prestador" ON orcamentos;
CREATE POLICY "orcamentos_insert_prestador" ON orcamentos
  FOR INSERT WITH CHECK (auth.uid() = prestador_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "orcamentos_select_prestador" ON orcamentos;
CREATE POLICY "orcamentos_select_prestador" ON orcamentos
  FOR SELECT USING (auth.uid() = prestador_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "orcamentos_update_prestador" ON orcamentos;
CREATE POLICY "orcamentos_update_prestador" ON orcamentos
  FOR UPDATE USING (auth.uid() = prestador_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "orcamentos_delete_prestador" ON orcamentos;
CREATE POLICY "orcamentos_delete_prestador" ON orcamentos
  FOR DELETE USING (auth.uid() = prestador_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "orcamentos_select_cliente" ON orcamentos;
CREATE POLICY "orcamentos_select_cliente" ON orcamentos
  FOR SELECT USING (
    public.check_user_approved(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM solicitacoes_orcamento s
      WHERE s.id = orcamentos.solicitacao_id
        AND s.cliente_id = auth.uid()
    )
  );

-- itens_orcamento:
DROP POLICY IF EXISTS "itens_select_prestador" ON itens_orcamento;
CREATE POLICY "itens_select_prestador" ON itens_orcamento
  FOR SELECT USING (
    public.check_user_approved(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "itens_select_cliente" ON itens_orcamento;
CREATE POLICY "itens_select_cliente" ON itens_orcamento
  FOR SELECT USING (
    public.check_user_approved(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM orcamentos o
      JOIN solicitacoes_orcamento s ON s.id = o.solicitacao_id
      WHERE o.id = itens_orcamento.orcamento_id AND s.cliente_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "itens_insert_prestador" ON itens_orcamento;
CREATE POLICY "itens_insert_prestador" ON itens_orcamento
  FOR INSERT WITH CHECK (
    public.check_user_approved(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "itens_update_prestador" ON itens_orcamento;
CREATE POLICY "itens_update_prestador" ON itens_orcamento
  FOR UPDATE USING (
    public.check_user_approved(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "itens_delete_prestador" ON itens_orcamento;
CREATE POLICY "itens_delete_prestador" ON itens_orcamento
  FOR DELETE USING (
    public.check_user_approved(auth.uid()) AND
    EXISTS (
      SELECT 1 FROM orcamentos o
      WHERE o.id = itens_orcamento.orcamento_id AND o.prestador_id = auth.uid()
    )
  );

-- ordens_servico:
DROP POLICY IF EXISTS "os_select_cliente" ON ordens_servico;
CREATE POLICY "os_select_cliente" ON ordens_servico
  FOR SELECT USING (auth.uid() = cliente_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "os_select_prestador" ON ordens_servico;
CREATE POLICY "os_select_prestador" ON ordens_servico
  FOR SELECT USING (auth.uid() = prestador_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "os_update_prestador" ON ordens_servico;
CREATE POLICY "os_update_prestador" ON ordens_servico
  FOR UPDATE USING (auth.uid() = prestador_id AND public.check_user_approved(auth.uid()));

DROP POLICY IF EXISTS "os_update_cliente" ON ordens_servico;
CREATE POLICY "os_update_cliente" ON ordens_servico
  FOR UPDATE USING (auth.uid() = cliente_id AND public.check_user_approved(auth.uid()));


-- 6. FUNÇÃO RPC PARA ADMIN EXCLUIR CONTAS (auth.users e profiles via cascade)
CREATE OR REPLACE FUNCTION public.admin_deletar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Garantir que apenas administradores podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários.';
  END IF;

  -- Evitar que o próprio admin se exclua
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'Acesso negado: você não pode excluir sua própria conta de administrador.';
  END IF;

  -- Deleta o usuário da tabela auth.users. 
  -- Como profiles tem FK com ON DELETE CASCADE, o perfil público será removido automaticamente.
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão de execução para usuários autenticados (a função valida se o executor é admin)
GRANT EXECUTE ON FUNCTION public.admin_deletar_usuario(UUID) TO authenticated;
