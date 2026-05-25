-- Migration 15: Timeline de Mensagens da Solicitação (Chat entre Cliente e Prestador)

-- 1. CRIAR TABELA DE MENSAGENS
CREATE TABLE IF NOT EXISTS public.mensagens_solicitacao (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitacao_id UUID NOT NULL REFERENCES public.solicitacoes_orcamento(id) ON DELETE CASCADE,
  usuario_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  mensagem       TEXT NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.mensagens_solicitacao ENABLE ROW LEVEL SECURITY;

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_mensagens_solic_id ON public.mensagens_solicitacao(solicitacao_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_created_at ON public.mensagens_solicitacao(created_at);

-- 2. POLÍTICAS DE ROW LEVEL SECURITY (RLS)

-- SELECT: Permite ler se o usuário for admin, o cliente dono da solicitação,
-- ou um prestador aprovado com acesso à solicitação (aberta/orcada)
CREATE POLICY "mensagens_select_policy" ON public.mensagens_solicitacao
  FOR SELECT USING (
    -- Admins têm acesso irrestrito
    public.check_user_role(auth.uid(), 'admin') OR
    -- O cliente dono da solicitação vinculada
    EXISTS (
      SELECT 1 FROM public.solicitacoes_orcamento s
      WHERE s.id = mensagens_solicitacao.solicitacao_id AND s.cliente_id = auth.uid()
    ) OR
    -- Um prestador aprovado que tenha acesso à solicitação correspondente
    (
      public.check_user_approved(auth.uid()) AND
      public.check_user_role(auth.uid(), 'prestador') AND
      EXISTS (
        SELECT 1 FROM public.solicitacoes_orcamento s
        WHERE s.id = mensagens_solicitacao.solicitacao_id
      )
    )
  );

-- INSERT: Permite inserir se o usuário estiver aprovado e tiver acesso à solicitação vinculada
CREATE POLICY "mensagens_insert_policy" ON public.mensagens_solicitacao
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id AND
    public.check_user_approved(auth.uid()) AND
    (
      -- Admins podem inserir mensagens em qualquer solicitação
      public.check_user_role(auth.uid(), 'admin') OR
      -- Clientes e prestadores precisam ter acesso de leitura à solicitação correspondente
      EXISTS (
        SELECT 1 FROM public.solicitacoes_orcamento s
        WHERE s.id = mensagens_solicitacao.solicitacao_id
      )
    )
  );
