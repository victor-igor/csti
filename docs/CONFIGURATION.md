<!-- generated-by: gsd-doc-writer -->
# Configuração — CSTI

Guia completo de configuração de ambiente e banco de dados para o projeto CSTI.

---

## Variáveis de Ambiente

O projeto utiliza o Vite para gerenciar variáveis de ambiente. Você deve criar um arquivo `.env.local` na raiz do projeto (baseado no `.env.example`).

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_SUPABASE_URL` | Sim | URL do seu projeto Supabase. |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave anônima pública (Anon Key) do Supabase. |

**Nota:** Variáveis prefixadas com `VITE_` são expostas ao código do cliente. Nunca coloque chaves secretas (Service Role) nestas variáveis.

### Como obter os valores

1. Acesse o painel do Supabase <!-- VERIFY: URL do dashboard Supabase -->.
2. Navegue para **Project Settings → API**.
3. Copie **Project URL** para `VITE_SUPABASE_URL` e **anon / public key** para `VITE_SUPABASE_ANON_KEY`.

---

## Banco de Dados (Supabase)

O esquema do banco de dados, políticas de segurança (RLS) e funções (RPC) são gerenciados via migrações SQL.

### Lista de Migrações (`supabase/migrations/`)

As migrações devem ser aplicadas na ordem cronológica:

1. `20260429000001_schema.sql`: Definição das tabelas base.
2. `20260429000002_rls.sql`: Políticas de Row Level Security.
3. `20260429000003_aprovar_orcamento_fn.sql`: Função RPC para aprovação atômica.
4. `20260429000004_schema_complement.sql`: Ajustes adicionais no esquema.
5. `20260429000005_fixes_and_notifications.sql`: Correções e triggers de notificação.
6. `20260429000006_add_admin_role.sql`: Adição do papel de administrador.
7. `20260429000007_admin_policies_and_functions.sql`: Políticas para admins.
8. `20260429000008_standardize_and_unique_telefone.sql`: Padronização de telefones.
9. `20260429000009_fix_rls_recursion.sql`: Correção de recursividade em políticas.
10. `20260429000010_add_admin_criar_usuario.sql`: Função para criação de usuários via admin.
11. `20260525000000_admin_criar_usuario.sql`: Refinamento da criação de usuários.
12. `20260525000001_remover_aprovacao_default.sql`: Ajustes de status.
13. `20260525000002_fix_aprovar_orcamento.sql`: Correção na lógica de aprovação.
14. `20260525000003_tipo_item_orcamento.sql`: Adição de tipos de itens.
15. `20260525000004_solicitacao_update_prestador_policy.sql`: Políticas de visualização.
16. `20260525000005_solicitacao_mensagens_chat.sql`: Suporte a mensagens/chat.
17. `20260525000006_solicitacao_delecao_os_cancelamento.sql`: Integridade em cancelamentos.
18. `20260525000007_user_deactivation.sql`: Desativação de usuários.
19. `20260525000008_user_deactivation.sql`: Ajustes finos na desativação.
20. `20260526000000_drop_admin_criar_usuario_rpc.sql`: Limpeza de funções obsoletas.
21. `20260526000001_add_owner_role.sql`: Adição do papel 'owner'.
22. `20260526000002_update_rls_and_rpc.sql`: Atualização massiva de segurança.
23. `20260526000003_fix_service_role_triggers.sql`: Correção de permissões em triggers.
24. `20260527000001_fix_mensagens_rls.sql`: Correção de RLS no chat.
25. `20260527000002_fix_function_permissions.sql`: Permissões de execução.
26. `20260527000003_fix_search_path.sql`: Segurança de funções (search_path).
27. `20260527000004_fix_mensagens_rls_dedup.sql`: Deduplicação de políticas.
28. `20260527000005_especialidade_array.sql`: Transformação de especialidades em array.
29. `20260527000006_fix_rls_prestador_categoria.sql`: Filtro de solicitações por categoria.
30. `20260527000007_fix_mensagens_insert_prestador.sql`: Permissão de envio de mensagens.
31. `20260527000008_rls_security_audit_fixes.sql`: Auditoria e reforço de RLS.
32. `20260527000009_fix_orcamentos_update_enviar.sql`: Validação de envio de orçamento.
33. `20260527000010_fix_rls_security_definer_functions.sql`: Segurança em funções definidoras.
34. `20260527000011_fix_recusar_deletar_orcamento_rpc.sql`: Lógica de recusa e deleção.
35. `20260527000012_fix_grants_and_cliente_status.sql`: Ajustes finais de permissões.

---

## Configuração do Build (Vite)

Configurado em `vite.config.ts`.
- **Alias**: `@/` mapeia para `./src/`.
- **Plugins**: `@vitejs/plugin-react` e `@tailwindcss/vite`.
- **Target**: `es2023`.

---

## Tailwind CSS v4

O projeto utiliza a versão 4 do Tailwind CSS. 
- A configuração de tema é feita via variáveis CSS em `src/index.css`.
- O arquivo `tailwind.config.ts` é utilizado apenas para definir o **safelist** de classes dinâmicas.

---

## ESLint (Flat Config)

O arquivo `eslint.config.js` utiliza a nova API Flat Config do ESLint v10. 
As regras são aplicadas automaticamente ao executar `npm run lint`.
