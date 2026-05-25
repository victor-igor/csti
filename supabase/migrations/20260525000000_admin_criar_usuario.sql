-- Migration 10: Função RPC para Administrador cadastrar novos usuários (Clientes, Prestadores ou Administradores)

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
  v_encrypted_password TEXT;
BEGIN
  -- 1. Garantir que apenas administradores podem executar esta função
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem criar usuários.';
  END IF;

  -- 2. Criptografar a senha usando crypt do pgcrypto
  v_encrypted_password := crypt(p_senha, gen_salt('bf'));

  -- 3. Inserir na tabela auth.users do Supabase
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    p_email,
    v_encrypted_password,
    now(), -- Confirma o email automaticamente
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('nome', p_nome, 'role', p_role),
    false,
    now(),
    now()
  )
  RETURNING id INTO v_user_id;

  -- 4. O trigger trg_handle_new_user já insere um profile básico com id, nome, email, e role.
  -- Atualizamos as colunas adicionais e definimos status_aprovacao = 'aprovado' para usuários criados pelo admin.
  UPDATE public.profiles
  SET
    telefone = p_telefone,
    especialidade = p_especialidade,
    status_aprovacao = 'aprovado',
    updated_at = now()
  WHERE id = v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permissão de execução para usuários autenticados (a própria função valida se o executor é admin)
GRANT EXECUTE ON FUNCTION public.admin_criar_usuario(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
