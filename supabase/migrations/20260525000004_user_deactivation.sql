-- Migration 14: Desativação de Usuários e Segurança de Perfis (Roles)

-- 1. ADICIONAR COLUNAS DE DESATIVAÇÃO NA TABELA PROFILES
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS desativado_em TIMESTAMPTZ;

-- Índice para filtrar usuários ativos com eficiência
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON public.profiles(ativo);

-- 2. FUNÇÃO RPC: admin_desativar_usuario
-- Bane o usuário no Supabase Auth (invalida tokens existentes) E marca o perfil como inativo
CREATE OR REPLACE FUNCTION public.admin_desativar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Garantir que apenas administradores podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem desativar usuários.';
  END IF;

  -- Impedir que o admin desative a si mesmo
  IF auth.uid() = p_user_id THEN
    RAISE EXCEPTION 'Você não pode desativar sua própria conta de administrador.';
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

GRANT EXECUTE ON FUNCTION public.admin_desativar_usuario(UUID) TO authenticated;

-- 3. FUNÇÃO RPC: admin_reativar_usuario
-- Remove o ban no Auth E reativa o perfil
CREATE OR REPLACE FUNCTION public.admin_reativar_usuario(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Garantir que apenas administradores podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem reativar usuários.';
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

GRANT EXECUTE ON FUNCTION public.admin_reativar_usuario(UUID) TO authenticated;

-- 4. ATUALIZAR TRIGGER handle_new_user PARA PROTEGER CADASTRO PÚBLICO
-- Força que cadastros públicos sejam unicamente da role 'cliente'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role role_enum;
BEGIN
  -- Se for criado por um administrador autenticado, aceita a role enviada
  IF auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'cliente');
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

-- 5. FUNÇÃO E TRIGGER PARA IMPEDIR ALTERAÇÃO DE ROLE, ATIVO E STATUS POR NÃO-ADMINS
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a role estiver sendo alterada e o usuário atual não for um admin
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    -- Forçar a manter a role antiga
    NEW.role := OLD.role;
  END IF;

  -- Se o status_aprovacao estiver sendo alterado e o usuário atual não for um admin
  IF NEW.status_aprovacao IS DISTINCT FROM OLD.status_aprovacao AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    -- Forçar a manter o status antigo
    NEW.status_aprovacao := OLD.status_aprovacao;
  END IF;

  -- Se a coluna ativo estiver sendo alterada e o usuário atual não for um admin
  IF NEW.ativo IS DISTINCT FROM OLD.ativo AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    -- Forçar a manter o status ativo antigo
    NEW.ativo := OLD.ativo;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();
