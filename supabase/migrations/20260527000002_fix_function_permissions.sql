-- Migration: Corrigir permissões de EXECUTE nas funções públicas
-- Corrige C2: funções admin acessíveis por anon via /rest/v1/rpc/
-- Corrige B2: funções de trigger interno expostas desnecessariamente

-- =============================================================================
-- C2: Funções admin — revogar anon, manter authenticated (auth interna protege)
-- =============================================================================
REVOKE EXECUTE ON FUNCTION public.admin_deletar_usuario(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_desativar_usuario(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.admin_reativar_usuario(uuid) FROM anon;
REVOKE EXECUTE ON FUNCTION public.aprovar_orcamento(uuid) FROM anon;

-- Garantir que authenticated ainda tem acesso (verificação interna de role garante segurança)
GRANT EXECUTE ON FUNCTION public.admin_deletar_usuario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_desativar_usuario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_reativar_usuario(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aprovar_orcamento(uuid) TO authenticated;

-- =============================================================================
-- B2: Funções de trigger — só devem ser chamadas via trigger, não via REST API
-- Triggers no PostgreSQL bypassam verificação de EXECUTE (chamados pelo mecanismo de trigger)
-- por isso é seguro revogar de anon e authenticated sem quebrar os triggers
-- =============================================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.criar_notificacao_automatica() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_os_cancelada() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_solicitacao_soft_deleted() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.protect_profile_role() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.registrar_status_historico() FROM anon, authenticated;
