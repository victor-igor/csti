-- Migration: Adicionar perfil de Super Admin ao Enum de roles
-- PostgreSQL exige que a adição de um novo valor a um enum seja commitada
-- antes que o novo valor possa ser referenciado em qualquer outra instrução (como RLS ou funções).
-- Por isso, este passo deve ser executado isoladamente.

ALTER TYPE role_enum ADD VALUE IF NOT EXISTS 'super_admin';
