# ✅ Checklist de Testes — CSTI

> **Para quem vai testar:** obrigado por ajudar! 🙌 Este documento te guia por **todas as funcionalidades** do sistema. Você **não precisa saber programar** — é só seguir os passos, ver se acontece o que está descrito em **"O que deve acontecer"**, e marcar o resultado.

---

## 📌 Antes de começar (leia 1 minuto)

**O que é o OrçaFácil?** Um sistema onde **clientes** pedem orçamentos de serviços de TI, **prestadores** respondem com orçamentos, e ao aprovar gera-se uma **Ordem de Serviço (OS)**. Tem também um perfil **admin** que gerencia usuários.

**Como testar cada item:**
1. Faça o que está em **"Passos"**.
2. Compare com **"O que deve acontecer"**.
3. Marque uma caixa:
   - `[x] Funcionou` → deu certo, igual ao esperado.
   - `[x] Com problema` → algo diferente / erro / travou.
4. Se marcou **Com problema**, escreva em **"Observações"**:
   - O que você esperava vs. o que aconteceu
   - Mensagem de erro (se apareceu) — **tire um print!**
   - Em qual celular/computador e navegador você estava

**Dica:** se algo não carregar, recarregue a página (F5) uma vez antes de marcar como problema.

---

## 🔑 Acessos (PREENCHER antes de enviar)

| Item | Valor |
|------|-------|
| **Link do sistema** | `___________________________` _(ex: http://localhost:5173 ou a URL enviada)_ |
| **Login CLIENTE** | e-mail: `cliente@teste.com`  senha: `teste@123` |
| **Login PRESTADOR** | e-mail: `prestador@teste.com`  senha: `teste@123` |
| **Login ADMIN** | e-mail: `admin@teste.com`  senha: `teste@123` |
| **Login SUPER ADMIN** | e-mail: `superadmin@teste.com`  senha: `teste@123` |

> ⚠️ Use cada login na parte correspondente do checklist. Não dá pra fazer tudo com um só perfil.

---

# PARTE 1 — Acesso e Conta

### 1.1 — Entrar como Cliente
**Passos:** Abra o link → tela de login → digite e-mail/senha do **CLIENTE** → clique **Entrar**.
**O que deve acontecer:** Entra e vai para a tela inicial (Dashboard). Sem mensagens de erro vermelhas.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.2 — Entrar como Prestador
**Passos:** Saia (se estiver logado) → login com e-mail/senha do **PRESTADOR** → **Entrar**.
**O que deve acontecer:** Entra no Dashboard, sem erros.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.3 — Entrar como Admin
**Passos:** Login com e-mail/senha do **ADMIN** → **Entrar**.
**O que deve acontecer:** Entra no Dashboard. No menu lateral aparece a opção **"Usuários"** (exclusiva de admin).
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.4 — Login com senha errada
**Passos:** Na tela de login, digite um e-mail válido com **senha errada** → **Entrar**.
**O que deve acontecer:** Aparece uma mensagem amigável (ex: "E-mail ou senha incorretos"). **Não** entra no sistema.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.5 — Criar conta nova (Cliente)
**Passos:** Na tela de login, clique em **Cadastrar/Criar conta** → preencha nome, e-mail novo, senha, telefone → escolha perfil **Cliente** → aceite os termos → **Cadastrar**.
**O que deve acontecer:** Conta criada; entra no sistema (pode aparecer uma tela de boas-vindas/onboarding).
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.6 — Criar conta nova (Prestador)
**Passos:** Mesmos passos do 1.5, mas escolha perfil **Prestador**.
**O que deve acontecer:** Conta criada; entra no sistema como prestador.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.7 — Tela de boas-vindas (primeiro acesso)
**Passos:** No primeiro login de uma conta nova, observe se aparece uma saudação/onboarding.
**O que deve acontecer:** Mensagem de boas-vindas só no primeiro acesso; depois não aparece mais.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.8 — Esqueci minha senha
**Passos:** Na tela de login, clique em **"Esqueci minha senha"** → digite um e-mail → enviar.
**O que deve acontecer:** Mensagem de confirmação tipo "enviamos um link para seu e-mail".
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.9 — Redefinir senha (pelo link do e-mail)
**Passos:** Abra o link de redefinição recebido por e-mail → digite uma nova senha → confirmar.
**O que deve acontecer:** Senha alterada; consegue entrar com a **nova** senha.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 1.10 — Sair (Logout)
**Passos:** Estando logado, clique em **Sair/Logout**.
**O que deve acontecer:** Volta para a tela de login. Se tentar voltar para uma tela interna, é barrado e mandado pro login.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

---

# PARTE 2 — Perfil de CLIENTE
> Entre com o login **CLIENTE** (item 1.1) para esta parte.

### 2.1 — Dashboard do Cliente
**Passos:** Após entrar, observe a tela inicial.
**O que deve acontecer:** Mostra um resumo voltado ao cliente (ex: minhas solicitações, atalhos). Sem erros.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.2 — Criar uma Solicitação
**Passos:** Vá em **Solicitações** → **Nova Solicitação** → preencha título, descrição, categoria (ex: Hardware) → enviar.
**O que deve acontecer:** Solicitação criada e aparece na lista com status inicial (ex: "Aberta"/"Aguardando").
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.3 — Ver lista de Solicitações
**Passos:** Abra **Solicitações**. Use os filtros (Todos/Aberta/Cancelado…) e a busca por título/número.
**O que deve acontecer:** Lista carrega; filtros e busca funcionam; a tela **não trava nem fica recarregando sozinha**.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.4 — Ver detalhe de uma Solicitação
**Passos:** Clique em uma solicitação da lista.
**O que deve acontecer:** Abre o detalhe com as informações e o histórico de status.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.5 — Enviar mensagem na Solicitação
**Passos:** No detalhe da solicitação, escreva uma mensagem no campo de chat → enviar.
**O que deve acontecer:** A mensagem aparece na conversa logo abaixo.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.6 — Cancelar uma Solicitação
**Passos:** Na lista, no menu **(⋯)** de uma solicitação aberta, clique **Cancelar** → confirme.
**O que deve acontecer:** Status vira "Cancelado", aparece um aviso de sucesso, a lista atualiza.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.7 — Excluir uma Solicitação
**Passos:** No menu **(⋯)** de uma solicitação aberta, clique **Excluir** → confirme.
**O que deve acontecer:** A solicitação some da lista; aviso de sucesso. Não volta ao recarregar.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.8 — Ver Orçamentos recebidos
**Passos:** Vá em **Orçamentos**.
**O que deve acontecer:** Mostra os orçamentos que prestadores enviaram para suas solicitações.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.9 — Aprovar um Orçamento
**Passos:** Abra um orçamento recebido → **Revisar** → **Aprovar** → confirme.
**O que deve acontecer:** Orçamento aprovado; aviso de sucesso.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.10 — Aprovar gera Ordem de Serviço
**Passos:** Logo após aprovar (2.9), vá em **Ordens de Serviço**.
**O que deve acontecer:** Existe uma nova OS vinculada ao orçamento aprovado, com número gerado.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.11 — Recusar um Orçamento
**Passos:** Em outro orçamento, abra **Revisar** → **Recusar** → confirme.
**O que deve acontecer:** Orçamento marcado como recusado; aviso de sucesso; a solicitação atualiza o status.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.12 — Baixar/visualizar PDF do Orçamento
**Passos:** Em um orçamento, gere/baixe o **PDF**.
**O que deve acontecer:** PDF abre com cabeçalho **CSTI** e os itens/valores corretos.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.13 — Ordens de Serviço — Lista
**Passos:** Abra **Ordens de Serviço**.
**O que deve acontecer:** Lista as OS existentes com número e status.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.14 — Ordem de Serviço — Detalhe
**Passos:** Clique em uma OS.
**O que deve acontecer:** Abre detalhe com dados e itens da OS.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.15 — Cancelar Ordem de Serviço
**Passos:** No detalhe de uma OS, use a opção de **Cancelar** → confirme.
**O que deve acontecer:** OS muda para cancelada; aviso de sucesso.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 2.16 — Cliente NÃO acessa área de Prestador
**Passos:** Logado como cliente, tente abrir no navegador: `<link>/prestador/solicitacoes`.
**O que deve acontecer:** É bloqueado / redirecionado. O cliente não vê a área do prestador.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

---

# PARTE 3 — Perfil de PRESTADOR
> Saia e entre com o login **PRESTADOR** (item 1.2).

### 3.1 — Dashboard do Prestador
**Passos:** Observe a tela inicial.
**O que deve acontecer:** Resumo voltado ao prestador. Sem erros.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 3.2 — Ver Solicitações disponíveis
**Passos:** Abra **Solicitações** (do prestador).
**O que deve acontecer:** Lista solicitações aguardando orçamento. A tela **não trava nem recarrega sozinha** (mesmo se o prestador ainda não escolheu especialidade).
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 3.3 — Ver detalhe de uma Solicitação (prestador)
**Passos:** Clique em uma solicitação da lista.
**O que deve acontecer:** Abre o detalhe com as informações do pedido.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 3.4 — Criar Orçamento
**Passos:** A partir de uma solicitação, clique em **Criar/Enviar Orçamento** → adicione itens (descrição, valor) → enviar.
**O que deve acontecer:** Orçamento criado e enviado ao cliente; aviso de sucesso.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 3.5 — Ver detalhe do Orçamento
**Passos:** Abra um orçamento que você criou.
**O que deve acontecer:** Mostra itens, valores e status do orçamento.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 3.6 — Editar Orçamento
**Passos:** Em um orçamento ainda editável, clique **Editar** → altere um item/valor → salvar.
**O que deve acontecer:** Alterações salvas; aviso de sucesso.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

---

# PARTE 4 — Perfil de ADMIN
> Saia e entre com o login **ADMIN** (item 1.3).

### 4.1 — Dashboard do Admin
**Passos:** Observe a tela inicial.
**O que deve acontecer:** Resumo/visão de admin. Menu mostra **Usuários**.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 4.2 — Listar Usuários
**Passos:** Vá em **Usuários** (menu admin).
**O que deve acontecer:** Lista os usuários do sistema com nome, e-mail, perfil e status.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 4.3 — Criar Usuário
**Passos:** Em Usuários, clique em **Criar/Novo usuário** → preencha dados → salvar.
**O que deve acontecer:** Usuário criado e aparece na lista.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 4.4 — Ativar / Desativar Usuário
**Passos:** Em um usuário da lista, use a opção de **ativar/desativar**.
**O que deve acontecer:** Status do usuário muda; aviso de sucesso. (Usuário desativado não consegue mais entrar.)
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

---

# PARTE 5 — Perfil pessoal & Notificações
> Pode testar com **qualquer** login.

### 5.1 — Ver meus dados (Perfil)
**Passos:** Abra **Meu Perfil**.
**O que deve acontecer:** Mostra seus dados (nome, e-mail, telefone) de forma organizada.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 5.2 — Editar meus dados
**Passos:** No perfil, clique **Editar** → altere nome/telefone → **Salvar**.
**O que deve acontecer:** Dados atualizados; aviso de sucesso.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 5.3 — Trocar senha
**Passos:** No perfil, troque a senha (senha atual + nova senha válida) → salvar.
**O que deve acontecer:** Senha alterada; aviso de sucesso.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 5.4 — Senha curta é bloqueada
**Passos:** Tente trocar a senha usando uma senha com **menos de 8 caracteres**.
**O que deve acontecer:** Mostra erro de validação e **não** salva.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 5.5 — Senhas diferentes são bloqueadas
**Passos:** Na troca de senha, digite "nova senha" e "confirmar senha" **diferentes**.
**O que deve acontecer:** Mostra erro "as senhas não coincidem" e não salva.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 5.6 — Sino de Notificações
**Passos:** Clique no **🔔 sino** no topo.
**O que deve acontecer:** Abre uma lista de notificações (ou aviso de "sem notificações").
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 5.7 — Página de Notificações
**Passos:** Abra a página **Notificações**.
**O que deve acontecer:** Lista completa das notificações.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

---

# PARTE 6 — Segurança (permissões por perfil)

### 6.1 — Prestador não revisa orçamento de cliente
**Passos:** Logado como **prestador**, tente abrir `<link>/orcamentos/<algum-id>/revisar`.
**O que deve acontecer:** Bloqueado / redirecionado.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

### 6.2 — Não-admin não acessa Usuários
**Passos:** Logado como **cliente** ou **prestador**, tente abrir `<link>/admin/usuarios`.
**O que deve acontecer:** Bloqueado / redirecionado. Só admin acessa.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

---

# PARTE 7 — Celular (responsividade)

### 7.1 — Layout no celular
**Passos:** Abra o sistema **no celular** (ou aperte F12 → modo celular no computador).
**O que deve acontecer:** Menu lateral some e vira menu de topo / hambúrguer; ao tocar abre o menu; tudo cabe na tela sem cortar.
`[ ] Funcionou`  `[ ] Com problema`
**Observações:** _______________________________________________

---

## 📊 Resumo final (preencha ao terminar)

| | Quantidade |
|---|---|
| ✅ Funcionou | ____ |
| ❌ Com problema | ____ |
| ⏭️ Não consegui testar | ____ |
| **Total de itens** | **46** |

**Problemas mais importantes que encontrei (resumo):**
1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

**Seu nome / data do teste:** _______________________  __/__/____

> Ao terminar, devolva este arquivo preenchido (ou tire prints das partes marcadas) para quem te enviou. Obrigado! 🙏
