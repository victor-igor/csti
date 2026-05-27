-- Migration: Remover policies RLS duplicadas de mensagens_solicitacao
-- Contexto: 20260525000005 criou policies permissivas (qualquer prestador aprovado vê tudo)
--           20260527000001 criou policies corretas (prestador só vê se tem orçamento vinculado)
-- Com ambas ativas, PostgreSQL aplica OR e a mais permissiva vence.
-- Esta migration dropa as policies da 20260525000005, deixando apenas as corretas.

DROP POLICY IF EXISTS "mensagens_select_policy" ON public.mensagens_solicitacao;
DROP POLICY IF EXISTS "mensagens_insert_policy" ON public.mensagens_solicitacao;
