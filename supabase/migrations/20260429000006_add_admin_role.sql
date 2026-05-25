-- Migration 6: Adicionar perfil de Administrador (Admin) ao Enum de roles
-- Nota: PostgreSQL exige que a adição de um novo valor a um enum seja commitada 
-- antes que o novo valor possa ser referenciado em qualquer outra instrução (como RLS ou funções).
-- Por isso, este passo deve ser executado isoladamente.

ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'admin';
