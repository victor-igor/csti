-- Migration: Fixar search_path mutable em todas as funções públicas
-- Corrige M2: 17 funções sem SET search_path = public (risco de schema injection)
-- Nota: handle_new_user já foi corrigido na migration 20260526000003

ALTER FUNCTION public.admin_deletar_usuario(p_user_id uuid)
  SET search_path = public;

ALTER FUNCTION public.admin_desativar_usuario(p_user_id uuid)
  SET search_path = public;

ALTER FUNCTION public.admin_reativar_usuario(p_user_id uuid)
  SET search_path = public;

ALTER FUNCTION public.aprovar_orcamento(p_orcamento_id uuid)
  SET search_path = public;

ALTER FUNCTION public.check_cliente_owns_solicitacao(p_user_id uuid, p_solicitacao_id uuid)
  SET search_path = public;

ALTER FUNCTION public.check_prestador_has_orcamento(p_user_id uuid, p_solicitacao_id uuid)
  SET search_path = public;

ALTER FUNCTION public.check_user_approved(p_user_id uuid)
  SET search_path = public;

ALTER FUNCTION public.check_user_role(p_user_id uuid, p_role role_enum)
  SET search_path = public;

ALTER FUNCTION public.criar_notificacao_automatica()
  SET search_path = public;

ALTER FUNCTION public.gerar_numero_orcamento()
  SET search_path = public;

ALTER FUNCTION public.gerar_numero_os()
  SET search_path = public;

ALTER FUNCTION public.gerar_numero_solicitacao()
  SET search_path = public;

ALTER FUNCTION public.get_solicitacao_cliente_id(sol_id uuid)
  SET search_path = public;

ALTER FUNCTION public.handle_os_cancelada()
  SET search_path = public;

ALTER FUNCTION public.handle_solicitacao_soft_deleted()
  SET search_path = public;

ALTER FUNCTION public.protect_profile_role()
  SET search_path = public;

ALTER FUNCTION public.registrar_status_historico()
  SET search_path = public;

ALTER FUNCTION public.set_updated_at()
  SET search_path = public;
