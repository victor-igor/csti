-- Migration 10: Função administrativa para criar usuários (auth.users e profiles)

CREATE OR REPLACE FUNCTION public.admin_criar_usuario(
  p_email TEXT,
  p_senha TEXT,
  p_nome TEXT,
  p_role TEXT,
  p_telefone TEXT DEFAULT NULL,
  p_especialidade TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Garantir que apenas administradores podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem criar usuários.';
  END IF;

  -- 2. Garantir que o e-mail não esteja duplicado
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = p_email) THEN
    RAISE EXCEPTION 'Erro: Este e-mail já está cadastrado.';
  END IF;

  -- 3. Gerar ID para o novo usuário
  v_user_id := gen_random_uuid();

  -- 4. Inserir na tabela auth.users do Supabase
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    created_at,
    updated_at
  )
  VALUES (
    v_user_id,
    '00000000-0000-0000-0000-000000000000'::UUID,
    p_email,
    crypt(p_senha, gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('nome', p_nome, 'role', p_role),
    'authenticated',
    'authenticated',
    now(),
    now()
  );

  -- 5. O trigger trg_handle_new_user já terá inserido a linha na tabela public.profiles.
  --    Agora atualizamos os campos adicionais (telefone, especialidade) e definimos o status como 'aprovado'.
  UPDATE public.profiles
  SET 
    telefone = p_telefone,
    especialidade = p_especialidade,
    status_aprovacao = 'aprovado'
  WHERE id = v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão de execução para usuários autenticados (a função valida se o executor é admin)
GRANT EXECUTE ON FUNCTION public.admin_criar_usuario(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
