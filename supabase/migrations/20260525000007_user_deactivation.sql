-- Migration 12: Desativação de Usuários (dois níveis: auth + profile)

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
