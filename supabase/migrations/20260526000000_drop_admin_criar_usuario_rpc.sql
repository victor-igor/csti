-- Migration: Remove função admin_criar_usuario (substituída por Edge Function)
-- e limpa o usuário de teste quebrado

-- 1. Remover a função RPC antiga (agora gerida pela Edge Function admin-criar-usuario)
DROP FUNCTION IF EXISTS public.admin_criar_usuario(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT);

-- 2. Remover o usuário de teste criado com senha inválida (não autenticável)
--    Primeiro remove o profile (FK), depois o auth user
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'testeedu@hotmail.com';
  IF v_user_id IS NOT NULL THEN
    DELETE FROM public.profiles WHERE id = v_user_id;
    DELETE FROM auth.users WHERE id = v_user_id;
  END IF;
END;
$$;
