-- Migration: Permitir que o service_role defina e atualize roles nas tabelas de profiles
-- Isso é necessário para que a Edge Function (que roda sob service_role) possa criar usuários com roles específicas.

-- 1. ATUALIZAR TRIGGER handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role role_enum;
BEGIN
  -- Se for criado via service_role ou por um administrador/super_admin autenticado, aceita a role enviada
  IF (auth.role() = 'service_role') OR (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  )) THEN
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::role_enum, 'cliente');
    -- Admins autenticados comuns não podem criar super_admins
    IF auth.role() <> 'service_role' AND EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin') AND v_role = 'super_admin' THEN
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


-- 2. ATUALIZAR TRIGGER protect_profile_role
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a alteração for feita via service_role, permite sem restrições
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  -- Se a role estiver sendo alterada e o usuário atual não for admin/super_admin
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin')
  ) THEN
    -- Forçar a manter a role antiga
    NEW.role := OLD.role;
  END IF;

  -- Se um admin autenticado tentar alterar a role de um super_admin, ou tentar promover alguém a super_admin
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
