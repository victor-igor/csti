-- Migration 13: Segmentação de Itens de Orçamento (Serviço, Produto, Outros)

-- 1. CRIAR TIPO ENUM PARA OS ITENS
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_item_enum') THEN
    CREATE TYPE tipo_item_enum AS ENUM ('servico', 'produto', 'outros');
  END IF;
END
$$;

-- 2. ADICIONAR COLUNA TIPO À TABELA ITENS_ORCAMENTO
ALTER TABLE public.itens_orcamento
  ADD COLUMN IF NOT EXISTS tipo tipo_item_enum NOT NULL DEFAULT 'servico';

-- Índice para performance caso precise filtrar por tipo futuramente
CREATE INDEX IF NOT EXISTS idx_itens_orcamento_tipo ON public.itens_orcamento(tipo);
