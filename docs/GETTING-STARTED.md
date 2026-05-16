<!-- generated-by: gsd-doc-writer -->
# Guia de Primeiros Passos — OrçaFácil

Do clone até a tela inicial rodando localmente.

---

## 1. Pré-requisitos

Certifique-se de ter instalado:

| Ferramenta | Versão mínima | Verificar |
|------------|---------------|-----------|
| Node.js | `>= 18.0.0` | `node -v` |
| npm | `>= 9.0.0` | `npm -v` |
| Git | qualquer recente | `git --version` |
| Conta Supabase | — | [supabase.com](https://supabase.com) |

> O projeto usa `@types/node ^24` em dev. Recomenda-se Node.js 20 LTS ou 22 LTS para melhor compatibilidade.

---

## 2. Clonar e entrar no diretório

```bash
git clone <URL-DO-REPOSITÓRIO> orcafacil
cd orcafacil
```

---

## 3. Instalar dependências

```bash
npm install
```

---

## 4. Configurar variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Supabase:

```bash
cp .env.example .env.local
```

Abra `.env.local` e preencha:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

**Como obter esses valores:**

1. Acesse [app.supabase.com](https://app.supabase.com) e abra o seu projeto.
2. Vá em **Project Settings → API**.
3. Copie o valor de **Project URL** → `VITE_SUPABASE_URL`.
4. Copie o valor de **Project API Keys → anon / public** → `VITE_SUPABASE_ANON_KEY`.

> Para detalhes sobre todas as variáveis de ambiente disponíveis, consulte [docs/CONFIGURATION.md](./CONFIGURATION.md).

---

## 5. Aplicar as migrations do banco de dados

O projeto contém as seguintes migrations em `supabase/migrations/`:

| Arquivo | Descrição |
|---------|-----------|
| `20260429000001_schema.sql` | Schema principal (tabelas base) |
| `20260429000002_rls.sql` | Políticas RLS (Row Level Security) |
| `20260429000003_aprovar_orcamento_fn.sql` | Função de aprovação de orçamento |
| `20260429000004_schema_complement.sql` | Complemento do schema |

### Opção A — Supabase CLI (recomendado para dev local)

```bash
# Instale a CLI se ainda não tiver
npm install -g supabase

# Faça login
supabase login

# Vincule ao seu projeto remoto
supabase link --project-ref <seu-project-ref>

# Aplique todas as migrations pendentes
supabase db push
```

### Opção B — SQL Editor no dashboard

1. Acesse [app.supabase.com](https://app.supabase.com) → seu projeto → **SQL Editor**.
2. Abra e execute cada arquivo de migration **em ordem**, do mais antigo ao mais recente.

---

## 6. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O Vite sobe na porta padrão **5173**. Acesse no navegador:

```
http://localhost:5173
```

---

## 7. Primeiro login — criar uma conta de teste

Na tela inicial, clique em **Criar conta** e preencha o cadastro.

Durante o registro, você escolhe o **tipo de perfil**:

- **Cliente** — visualiza orçamentos recebidos, aprova ou rejeita, acompanha ordens de serviço.
- **Prestador de serviço** — cria orçamentos, gera ordens de serviço, gerencia clientes.

Crie ao menos uma conta de cada tipo para explorar o fluxo completo da aplicação.

---

## 8. O que você vai encontrar

Após o login, você verá o dashboard correspondente ao seu perfil. A aplicação é organizada em módulos de orçamentos e ordens de serviço para manutenção de TI.

Para entender a arquitetura de componentes, rotas e camadas de dados, consulte [docs/ARCHITECTURE.md](./ARCHITECTURE.md).

---

## 9. Solução de problemas comuns

### Variáveis de ambiente não carregando

- Confirme que o arquivo se chama `.env.local` (e não apenas `.env`).
- O Vite carrega apenas arquivos `.env`, `.env.local`, `.env.development` e `.env.development.local` no modo dev.
- Reinicie o servidor (`Ctrl+C` e `npm run dev`) após alterar o `.env.local`.
- Todas as variáveis expostas ao browser **devem** começar com `VITE_`.

### Erro de RLS / "row-level security policy" no Supabase

- Verifique se a migration `20260429000002_rls.sql` foi aplicada.
- Confirme que o usuário autenticado tem o perfil correto na tabela de perfis.
- No dashboard Supabase, vá em **Authentication → Users** para verificar se o usuário foi criado.
- Em **Table Editor**, confirme que o registro de perfil existe para o usuário logado.

### Porta 5173 já em uso

```bash
# Identifique o processo usando a porta
lsof -i :5173

# Encerre o processo
kill -9 <PID>
```

Ou suba o dev server em outra porta:

```bash
npm run dev -- --port 3000
```

### App travado ou tela de login não carrega

Se o servidor de desenvolvimento parece travado ou a tela de login não responde mesmo após reiniciar, pode haver processos Vite zumbis de sessões anteriores ocupando a porta ou mantendo estado corrompido. Verifique e encerre todos os processos Vite antes de reiniciar:

```bash
# Listar processos Vite em execução
ps aux | grep vite

# Encerrar todos de uma vez
pkill -f vite
```

Em seguida, reinicie com `npm run dev`.

---

## 10. Próximos passos

- **Desenvolvimento local:** leia [docs/DEVELOPMENT.md](./DEVELOPMENT.md) para convenções de código, scripts disponíveis e fluxo de trabalho.
- **Testes:** leia [docs/TESTING.md](./TESTING.md) para executar a suíte de testes unitários e end-to-end.
- **Configuração avançada:** veja [docs/CONFIGURATION.md](./CONFIGURATION.md) para todas as variáveis de ambiente.
- **Arquitetura:** veja [docs/ARCHITECTURE.md](./ARCHITECTURE.md) para o mapa de componentes e decisões técnicas.
