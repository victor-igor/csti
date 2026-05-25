-- Migration 11: Alterar valor padrão de status_aprovacao para 'aprovado' e aprovar usuários pendentes

-- 1. Alterar o valor padrão para novos cadastros
ALTER TABLE public.profiles 
  ALTER COLUMN status_aprovacao SET DEFAULT 'aprovado';

-- 2. Atualizar quaisquer usuários que estejam com status pendente ou recusado para aprovado
UPDATE public.profiles 
  SET status_aprovacao = 'aprovado' 
  WHERE status_aprovacao IN ('pendente', 'recusado');
