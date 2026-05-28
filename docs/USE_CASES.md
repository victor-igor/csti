<!-- generated-by: gsd-doc-writer -->
# Casos de Uso - CSTI

Este documento descreve os principais Casos de Uso (UC) do sistema CSTI, detalhando os fluxos, atores e regras de negócio associadas.

## Atores

| Ator | Descrição |
| :--- | :--- |
| **Cliente** | Usuário que solicita manutenções, aprova orçamentos e gerencia seu perfil. |
| **Prestador** | Usuário técnico que analisa solicitações, envia propostas comerciais (orçamentos) e gerencia suas especialidades. |
| **Admin** | Usuário com permissões para gerenciar usuários, visualizar métricas, gerenciar ordens de serviço e mediar conflitos. |
| **Super_Admin** | Usuário com controle total do sistema, incluindo configurações críticas e gestão de outros administradores. |

## Diagrama de Casos de Uso

```mermaid
useCaseDiagram
    actor Cliente
    actor Prestador
    actor Admin
    actor Super_Admin

    package "CSTI" {
        usecase UC01 as "Solicitar Orçamento"
        usecase UC02 as "Enviar Orçamento"
        usecase UC03 as "Aprovar Orçamento"
        usecase UC04 as "Gerenciar Ordem de Serviço"
        usecase UC05 as "Gestão de Usuários (Admin)"
        usecase UC06 as "Onboarding"
        usecase UC07 as "Recuperação de Senha"
        usecase UC08 as "Perfil e Configurações"
        usecase UC09 as "Notificações"
        usecase UC10 as "Visualizar Dashboard"
        usecase UC11 as "Recusar Orçamento"
    }

    Cliente --> UC01
    Cliente --> UC03
    Cliente --> UC06
    Cliente --> UC07
    Cliente --> UC08
    Cliente --> UC09
    Cliente --> UC10
    Cliente --> UC11

    Prestador --> UC02
    Prestador --> UC06
    Prestador --> UC07
    Prestador --> UC08
    Prestador --> UC09
    Prestador --> UC10

    Admin --> UC04
    Admin --> UC05
    Admin --> UC07
    Admin --> UC08
    Admin --> UC09
    Admin --> UC10

    Super_Admin --> UC05
    Super_Admin --> UC07
    Super_Admin --> UC08
    Super_Admin --> UC09
    Super_Admin --> UC10
```

---

## Fluxos Detalhados

### UC01: Solicitar Orçamento
**Ator Principal:** Cliente  
**Descrição:** O cliente registra uma necessidade de reparo ou manutenção no sistema.

*   **Fluxo Principal:**
    1.  O Cliente acessa a funcionalidade "Nova Solicitação".
    2.  O Cliente preenche o título, descrição do problema, equipamento, nível de urgência e prazo desejado.
    3.  O Sistema valida se os campos obrigatórios estão preenchidos.
    4.  O Sistema salva a solicitação com o status `aberta`.
    5.  O Sistema notifica os Prestadores/Admins sobre a nova solicitação.
*   **Regras de Negócio:**
    *   **RN01:** Título e Urgência são campos obrigatórios.
    *   **RN02:** O status inicial deve ser sempre `aberta`.

### UC02: Enviar Orçamento
**Ator Principal:** Prestador  
**Descrição:** O prestador envia uma proposta detalhada de custos e prazos para uma solicitação aberta.

*   **Fluxo Principal:**
    1.  O Prestador visualiza a lista de solicitações em aberto.
    2.  O Prestador seleciona uma solicitação e inicia a criação de um orçamento.
    3.  O Prestador insere os itens de serviço/peças (descrição, quantidade, valor unitário).
    4.  O Prestador define o prazo estimado de entrega e observações adicionais.
    5.  O Prestador clica em "Enviar Orçamento".
    6.  O Sistema altera o status do orçamento para `enviado` e o status da solicitação para `orcamento_enviado`.
*   **Regras de Negócio:**
    *   **RN03:** Um prestador só pode enviar orçamento para solicitações que não tenham sido aprovadas por outro prestador.
    *   **RN04:** O orçamento pode ser salvo como "Rascunho" antes de ser enviado definitivamente.

### UC03: Aprovar Orçamento
**Ator Principal:** Cliente  
**Descrição:** O cliente revisa as propostas e aceita o orçamento de um prestador.

*   **Fluxo Principal:**
    1.  O Cliente visualiza os detalhes de um orçamento recebido (status `enviado`).
    2.  O Cliente clica na ação "Aprovar Orçamento".
    3.  O Sistema executa uma transação atômica (RPC `aprovar_orcamento`).
    4.  O Sistema marca o orçamento como `aceito`.
    5.  O Sistema marca a solicitação vinculada como `aprovado`.
    6.  O Sistema executa o **UC04 (Gerar Ordem de Serviço)** automaticamente.
*   **Regras de Negócio:**
    *   **RN05:** Somente o cliente que criou a solicitação original (ou um Admin) pode aprovar o orçamento.

### UC04: Gerenciar Ordem de Serviço
**Ator Principal:** Admin / Sistema (Automático)  
**Descrição:** Formalização do trabalho a ser executado e acompanhamento de sua execução.

*   **Fluxo Principal:**
    1.  (Trigger) Gatilho disparado pela aprovação de um orçamento.
    2.  O Sistema gera um novo registro na tabela `ordens_servico` com status `aberta`.
    3.  O Admin ou Prestador pode atualizar o status da OS (ex: `em_andamento`, `concluida`).
    4.  O Sistema gera um número sequencial único para a OS.
*   **Regras de Negócio:**
    *   **RN06:** A OS deve obrigatoriamente referenciar um `orcamento_id`.

### UC05: Gestão de Usuários (Admin)
**Ator Principal:** Admin, Super_Admin  
**Descrição:** Listagem, ativação/desativação e edição de usuários pelo administrador.
**Interface:** `AdminUsuariosPage`

*   **Fluxo Principal:**
    1.  O Admin acessa a página de gerenciamento de usuários.
    2.  O Sistema lista todos os usuários cadastrados com seus respectivos status e papéis.
    3.  O Admin pode filtrar usuários por nome, email ou status (Ativo/Inativo).
    4.  O Admin pode ativar ou desativar uma conta de usuário.
    5.  O Admin pode editar as informações básicas e o papel (`role`) do usuário.
*   **Regras de Negócio:**
    *   **RN07:** Apenas Admin ou Super_Admin podem alterar o papel de um usuário.
    *   **RN08:** Usuários desativados perdem o acesso imediato ao sistema.

### UC06: Onboarding
**Ator Principal:** Cliente, Prestador  
**Descrição:** Fluxo de boas-vindas e configuração inicial após o primeiro login.
**Interface:** `OnboardingWelcome`

*   **Fluxo Principal:**
    1.  O Usuário realiza o primeiro login no sistema.
    2.  O Sistema identifica que o campo `onboarded` no perfil do usuário é `false`.
    3.  O Sistema apresenta o fluxo de boas-vindas e solicita informações adicionais (ex: telefone, especialidades para prestadores).
    4.  O Usuário completa as informações solicitadas.
    5.  O Sistema marca o onboarding como concluído (`onboarded = true`).
*   **Regras de Negócio:**
    *   **RN09:** O fluxo de onboarding é obrigatório e bloqueia o acesso às funcionalidades principais até ser concluído.

### UC07: Recuperação de Senha
**Ator Principal:** Qualquer Usuário  
**Descrição:** Fluxos de 'Esqueci minha senha' e 'Redefinir senha'.
**Interface:** `RecuperarSenhaPage`, `RedefinirSenhaPage`

*   **Fluxo Principal:**
    1.  O Usuário clica em "Esqueci minha senha" na tela de login.
    2.  O Usuário insere seu email cadastrado.
    3.  O Sistema envia um link de recuperação via email.
    4.  O Usuário acessa o link de redefinição.
    5.  O Usuário define uma nova senha.
*   **Regras de Negócio:**
    *   **RN10:** O link de recuperação possui validade limitada por tempo.

### UC08: Perfil e Configurações
**Ator Principal:** Qualquer Usuário  
**Descrição:** Gestão de dados pessoais e especialidades do prestador.
**Interface:** `PerfilPage`, `PerfilModal`

*   **Fluxo Principal:**
    1.  O Usuário acessa a seção "Perfil".
    2.  O Usuário visualiza e edita suas informações (nome, telefone, avatar).
    3.  Se o usuário for um Prestador, ele pode selecionar suas especialidades técnicas.
    4.  O Usuário salva as alterações.
*   **Regras de Negócio:**
    *   **RN11:** Email não pode ser alterado diretamente pelo perfil (requer fluxo de segurança).

### UC09: Notificações
**Ator Principal:** Qualquer Usuário  
**Descrição:** Central de alertas e marcação de leitura.
**Interface:** `NotificacoesPage`, `NotificacoesDrawer`

*   **Fluxo Principal:**
    1.  Eventos no sistema (ex: nova solicitação, orçamento aprovado) geram notificações para os atores envolvidos.
    2.  O Usuário visualiza um indicador de novas notificações.
    3.  O Usuário abre a central de notificações ou o drawer lateral.
    4.  O Usuário marca notificações individuais ou todas como lidas.
*   **Regras de Negócio:**
    *   **RN12:** Notificações não lidas são destacadas visualmente.

### UC10: Visualizar Dashboard
**Ator Principal:** Todos  
**Descrição:** Visualização de métricas e resumo de atividades conforme o papel do usuário.
**Interface:** `DashboardPage`

### UC11: Recusar Orçamento
**Ator Principal:** Cliente  
**Descrição:** O cliente rejeita a proposta de um prestador.
*   **Ação:** A solicitação volta ao status `aberta` para permitir novos orçamentos, e o orçamento específico é marcado como `recusado`.

---

## Matriz de Relação de Status

| Objeto | Fluxo de Status |
| :--- | :--- |
| **Solicitação** | `aberta` → `orcamento_enviado` → `aprovado` \| `cancelado` |
| **Orçamento** | `rascunho` → `enviado` → `aceito` \| `recusado` |
| **Ordem de Serviço** | `aberta` → `em_andamento` → `concluida` \| `cancelada` |
| **Usuário** | `Ativo` \| `Inativo` |
