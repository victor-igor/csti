<!-- generated-by: gsd-doc-writer -->
# Guia de Primeiros Passos — CSTI

Do clone até a tela inicial rodando localmente.

---

## 1. Pré-requisitos

Certifique-se de ter instalado:

| Ferramenta | Versão mínima | Verificar |
|------------|---------------|-----------|
| Node.js | `>= 20.0.0` | `node -v` |
| npm | `>= 10.0.0` | `npm -v` |
| Git | qualquer recente | `git --version` |
| Conta Supabase | — | [supabase.com](https://supabase.com) |

> O projeto usa `@types/node ^24` em dev. Recomenda-se Node.js 20 LTS ou superior para melhor compatibilidade.

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

1. Acesse [app.supabase.com](https://app.supabase.com) <!-- VERIFY: URL do dashboard Supabase --> e abra o seu projeto.
2. Vá em **Project Settings → API**.
3. Copie o valor de **Project URL** → `VITE_SUPABASE_URL`.
4. Copie o valor de **Project API Keys → anon / public** → `VITE_SUPABASE_ANON_KEY`.

---

## 5. Aplicar as migrations do banco de dados

O projeto utiliza migrações SQL localizadas em `supabase/migrations/`. Existem mais de 30 migrações que definem o esquema, segurança (RLS) e lógica de negócio (RPC).

### Usando Supabase CLI (Recomendado)

```bash
# Login no Supabase
npx supabase login

# Vincular ao seu projeto
npx supabase link --project-ref <seu-project-ref>

# Aplicar as migrações
npx supabase db push
```

> Para uma lista completa das migrações e sua finalidade, consulte [docs/CONFIGURATION.md](./CONFIGURATION.md).

---

## 6. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O Vite sobe na porta padrão **5173**. Acesse no navegador:
`http://localhost:5173`

---

## 7. Primeiro login e perfis

Ao criar uma conta, você deve escolher seu papel:
- **Cliente**: Abre solicitações de orçamento para seus equipamentos.
- **Prestador**: Visualiza solicitações e envia orçamentos técnicos.

---

## 8. Próximos passos

- **Desenvolvimento local:** leia [docs/DEVELOPMENT.md](./DEVELOPMENT.md) para convenções de código.
- **Testes:** leia [docs/TESTING.md](./TESTING.md) para executar a suíte de testes.
- **Arquitetura:** veja [docs/ARCHITECTURE.md](./ARCHITECTURE.md) para o mapa de componentes.
