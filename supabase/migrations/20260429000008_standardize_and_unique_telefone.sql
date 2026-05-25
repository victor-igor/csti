-- Migration 8: Padronização de Telefones e Restrição Única (Sem duplicados)

-- 1. LIMPAR CARACTERES ESPECIAIS DE TELEFONES EXISTENTES (Garante prefixo '+' de acordo com padrão E.164)
UPDATE public.profiles 
SET telefone = '+' || regexp_replace(telefone, '\D', '', 'g') 
WHERE telefone IS NOT NULL AND telefone <> '';

-- 2. DEDUPILCAR TELEFONES EXISTENTES (Define como NULL os registros duplicados mais novos, mantendo o mais antigo)
UPDATE public.profiles p
SET telefone = NULL
WHERE p.id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER(PARTITION BY telefone ORDER BY created_at ASC) as rn
    FROM public.profiles
    WHERE telefone IS NOT NULL AND telefone <> ''
  ) t WHERE t.rn > 1
);

-- 3. REMOVER E ADICIONAR A RESTRIÇÃO UNIQUE NA COLUNA TELEFONE
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_telefone_unique;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_telefone_unique UNIQUE (telefone);
