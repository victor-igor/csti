-- Migration: Atualizar RLS e funções RPC para suportar o novo role 'super_admin' e restringir 'admin'

-- 1. ATUALIZAR FUNÇÃO AUXILIAR PARA VERIFICAR SE USUÁRIO ESTÁ APROVADO
-- Admins e Super Admins são sempre considerados aprovados
CREATE OR REPLACE FUNCTION public.check_user_approved(p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND role IN ('admin', 'super_admin')
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = p_user_id AND status_aprovacao = 'aprovado'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. RECRIAR POLÍTICAS RLS DE ADMINISTRADOR/SUPER_ADMIN (Acesso irrestrito)
-- Removemos as políticas antigas e criamos as novas que cobrem admin e super_admin

DROP POLICY IF EXISTS "profiles_admin_all" ON profiles;
CREATE POLICY "profiles_admin_all" ON profiles FOR ALL USING (
  public.check_user_role(auth.uid(), 'admin') OR public.check_user_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "solicitacoes_admin_all" ON solicitacoes_orcamento;
CREATE POLICY "solicitacoes_admin_all" ON solicitacoes_orcamento FOR ALL USING (
  public.check_user_role(auth.uid(), 'admin') OR public.check_user_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "orcamentos_admin_all" ON orcamentos;
CREATE POLICY "orcamentos_admin_all" ON orcamentos FOR ALL USING (
  public.check_user_role(auth.uid(), 'admin') OR public.check_user_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "itens_admin_all" ON itens_orcamento;
CREATE POLICY "itens_admin_all" ON itens_orcamento FOR ALL USING (
  public.check_user_role(auth.uid(), 'admin') OR public.check_user_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "os_admin_all" ON ordens_servico;
CREATE POLICY "os_admin_all" ON ordens_servico FOR ALL USING (
  public.check_user_role(auth.uid(), 'admin') OR public.check_user_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "historico_admin_all" ON status_historico;
CREATE POLICY "historico_admin_all" ON status_historico FOR ALL USING (
  public.check_user_role(auth.uid(), 'admin') OR public.check_user_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "notificacoes_admin_all" ON notificacoes;
CREATE POLICY "notificacoes_admin_all" ON notificacoes FOR ALL USING (
  public.check_user_role(auth.uid(), 'admin') OR public.check_user_role(auth.uid(), 'super_admin')
);


-- 3. ATUALIZAR FUNÇÃO RPC: admin_desativar_usuario
-- Permite que super_admin ou admin desativem usuários. Admin não pode desativar super_admin.
CREATE OR REPLACE FUNCTION public.admin_desativar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Garantir que apenas administradores ou super_admins podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores e super_admins podem desativar usuários.';
  END IF;

  -- Impedir que o executor desative a si mesmo
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'Você não pode desativar sua própria conta.';
  END IF;

  -- Se o chamador for admin, ele não pode desativar um super_admin
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: administradores não podem desativar super_admins.';
  END IF;

  -- Nível 1: Banir no Auth (invalida tokens JWT imediatamente)
  UPDATE auth.users
    SET banned_until = 'infinity'
  WHERE id = p_user_id;

  -- Nível 2: Marcar no perfil como inativo
  UPDATE public.profiles
    SET ativo = false,
        desativado_em = now(),
        updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. ATUALIZAR FUNÇÃO RPC: admin_reativar_usuario
-- Permite que super_admin ou admin reativem usuários. Admin não pode reativar super_admin.
CREATE OR REPLACE FUNCTION public.admin_reativar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Garantir que apenas administradores ou super_admins podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores e super_admins podem reativar usuários.';
  END IF;

  -- Se o chamador for admin, ele não pode reativar um super_admin
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: administradores não podem reativar super_admins.';
  END IF;

  -- Nível 1: Remover ban no Auth
  UPDATE auth.users
    SET banned_until = NULL
  WHERE id = p_user_id;

  -- Nível 2: Reativar no perfil
  UPDATE public.profiles
    SET ativo = true,
        desativado_em = NULL,
        updated_at = now()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 5. ATUALIZAR FUNÇÃO RPC: admin_deletar_usuario
-- Permite que super_admin ou admin excluam usuários. Admin não pode excluir super_admin.
CREATE OR REPLACE FUNCTION public.admin_deletar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Garantir que apenas administradores ou super_admins podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores e super_admins podem excluir usuários.';
  END IF;

  -- Evitar que o próprio usuário se exclua
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'Acesso negado: você não pode excluir sua própria conta.';
  END IF;

  -- Se o chamador for admin, ele não pode excluir um super_admin
  IF EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = p_user_id AND role = 'super_admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: administradores não podem excluir super_admins.';
  END IF;

  -- Deleta o usuário da tabela auth.users. 
  -- Como profiles tem FK com ON DELETE CASCADE, o perfil público será removido automaticamente.
  DELETE FROM auth.users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 6. ATUALIZAR TRIGGER handle_new_user PARA SUPORTAR 'super_admin'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role role_enum;
BEGIN
  -- Se for criado por um administrador/super_admin autenticado, aceita a role enviada
  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'cliente');
    -- Admins não podem criar super_admins
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') AND v_role = 'super_admin' THEN
      v_role := 'cliente';
    END IF;
  ELSE
    -- Cadastros públicos só podem ser 'cliente'
    v_role := 'cliente';
  END IF;

  INSERT INTO public.profiles (id, nome, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', split_part(NEW.email, '@', 1)),
    NEW.email,
    v_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. ATUALIZAR FUNÇÃO PARA PROTEGER ATRIBUTOS SENSÍVEIS NO PERFIL
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a role estiver sendo alterada e o usuário atual não for admin/super_admin
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    -- Forçar a manter a role antiga
    NEW.role := OLD.role;
  END IF;

  -- Se um admin tentar alterar a role de um super_admin, ou tentar promover alguém a super_admin
  IF NEW.role IS DISTINCT FROM OLD.role AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    -- Não pode mudar o role de/para 'super_admin'
    IF OLD.role = 'super_admin' OR NEW.role = 'super_admin' THEN
      NEW.role := OLD.role;
    END IF;
  END IF;

  -- Se o status_aprovacao estiver sendo alterado
  IF NEW.status_aprovacao IS DISTINCT FROM OLD.status_aprovacao AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    -- Forçar a manter o status antigo
    NEW.status_aprovacao := OLD.status_aprovacao;
  END IF;

  -- Admin não pode alterar o status de aprovação de um super_admin
  IF NEW.status_aprovacao IS DISTINCT FROM OLD.status_aprovacao AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) AND OLD.role = 'super_admin' THEN
    NEW.status_aprovacao := OLD.status_aprovacao;
  END IF;

  -- Se a coluna ativo estiver sendo alterada
  IF NEW.ativo IS DISTINCT FROM OLD.ativo AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    -- Forçar a manter o status ativo antigo
    NEW.ativo := OLD.ativo;
  END IF;

  -- Admin não pode alterar a ativação de um super_admin
  IF NEW.ativo IS DISTINCT FROM OLD.ativo AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) AND OLD.role = 'super_admin' THEN
    NEW.ativo := OLD.ativo;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
