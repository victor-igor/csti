-- Converte especialidade de TEXT para TEXT[] para uso com checkboxes de categoria
ALTER TABLE profiles
  ALTER COLUMN especialidade TYPE TEXT[]
  USING CASE
    WHEN especialidade IS NULL OR especialidade = '' THEN ARRAY[]::TEXT[]
    ELSE ARRAY[especialidade]
  END;
