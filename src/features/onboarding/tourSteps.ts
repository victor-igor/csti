import type { Step } from 'react-joyride'

/** Step com metadados de navegação (não faz parte da API do Joyride) */
export interface TourStep extends Step {
  data?: {
    /** Rota para navegar ANTES de mostrar este step */
    navigate?: string
  }
}

// ─────────────────────────────────────────────────────────────
// CLIENTE — 9 steps
// ─────────────────────────────────────────────────────────────
export const clienteSteps: TourStep[] = [
  {
    target: 'body',
    placement: 'center',
    title: '🚀 Bem-vindo ao CSTI!',
    content:
      'Este tour mostra o caminho completo: do chamado técnico até a conclusão do serviço. Vamos abrir cada tela para você conhecer!',
  },
  {
    target: 'a[href="/solicitacoes"]',
    placement: 'right',
    title: '1️⃣ Chamados Técnicos',
    content:
      'Tudo começa aqui. Clique para abrir a tela de chamados e registrar um problema de TI.',
  },
  {
    target: '[data-tour="nova-solicitacao"]',
    placement: 'bottom',
    data: { navigate: '/solicitacoes' },
    title: 'Abrir Novo Chamado',
    content:
      'Clique aqui para descrever o problema: equipamento, defeito observado e urgência. Os técnicos recebem o chamado na hora.',
  },
  {
    target: '[data-tour="filtros-solicitacoes"]',
    placement: 'bottom',
    title: 'Filtrar por Status',
    content:
      'Localize chamados por status: Aberta, Aguardando orçamento, Aprovado, Cancelado.',
  },
  {
    target: '[data-tour="filtros-orcamentos"]',
    placement: 'bottom',
    data: { navigate: '/orcamentos' },
    title: '2️⃣ Orçamentos Recebidos',
    content:
      'Quando um técnico enviar uma proposta, ela aparece aqui. Filtre por Enviados, Aceitos ou Recusados. Ao aceitar, o serviço começa!',
  },
  {
    target: '[data-tour="filtros-os"]',
    placement: 'bottom',
    data: { navigate: '/ordens-servico' },
    title: '3️⃣ Ordens de Serviço',
    content:
      'Cada orçamento aceito vira uma OS. O técnico atualiza o progresso em tempo real.',
  },
  {
    target: '[aria-label="Abrir central de mensagens"]',
    placement: 'left',
    title: '💬 Chat de Negociação',
    content:
      'Converse diretamente com o técnico, envie fotos do problema e acerte o valor final aqui.',
  },
  {
    target: '[aria-label="Notificações"], button[title="Notificações"]',
    placement: 'bottom',
    title: '🔔 Alertas em Tempo Real',
    content:
      'Novo orçamento, mudança de status ou mensagem do técnico — você recebe um alerta imediatamente.',
  },
  {
    target: '#onboarding-help-button',
    placement: 'bottom',
    title: '❓ Sempre Disponível',
    content:
      'Quer rever o tour? Clique aqui a qualquer hora. Pronto — agora é só usar o CSTI!',
  },
]

// ─────────────────────────────────────────────────────────────
// PRESTADOR — 9 steps
// ─────────────────────────────────────────────────────────────
export const prestadorSteps: TourStep[] = [
  {
    target: 'body',
    placement: 'center',
    title: '🚀 Bem-vindo ao CSTI!',
    content:
      'Este tour mostra seu fluxo de trabalho: dos chamados disponíveis até a conclusão do serviço.',
  },
  {
    target: 'a[href="/solicitacoes"]',
    placement: 'right',
    title: '1️⃣ Chamados Disponíveis',
    content:
      'Aqui ficam os chamados abertos esperando orçamento. Escolha os que você pode atender.',
  },
  {
    target: '[data-tour="filtros-solicitacoes"]',
    placement: 'bottom',
    data: { navigate: '/solicitacoes' },
    title: 'Filtrar Chamados',
    content:
      'Filtre por status para encontrar chamados abertos, em andamento ou já concluídos.',
  },
  {
    target: '[data-tour="nova-solicitacao"]',
    placement: 'bottom',
    title: 'Enviar Orçamento',
    content:
      'Ao abrir um chamado, você verá o botão para enviar sua proposta de orçamento ao cliente.',
  },
  {
    target: '[data-tour="filtros-orcamentos"]',
    placement: 'bottom',
    data: { navigate: '/orcamentos' },
    title: '2️⃣ Seus Orçamentos Enviados',
    content:
      'Acompanhe o status dos seus orçamentos: Enviado, Aceito ou Recusado.',
  },
  {
    target: '[data-tour="filtros-os"]',
    placement: 'bottom',
    data: { navigate: '/ordens-servico' },
    title: '3️⃣ Serviços em Execução',
    content:
      'Cada orçamento aceito vira uma OS. Atualize o progresso conforme avança no serviço.',
  },
  {
    target: '[aria-label="Abrir central de mensagens"]',
    placement: 'left',
    title: '💬 Chat com o Cliente',
    content:
      'Combine detalhes, envie orçamento revisado e feche o serviço diretamente pelo chat.',
  },
  {
    target: '[aria-label="Notificações"], button[title="Notificações"]',
    placement: 'bottom',
    title: '🔔 Alertas em Tempo Real',
    content:
      'Novos chamados, aprovação de orçamento ou mensagem do cliente — você é avisado na hora.',
  },
  {
    target: '#onboarding-help-button',
    placement: 'bottom',
    title: '❓ Sempre Disponível',
    content:
      'Quer rever o tour? Clique aqui a qualquer hora. Bom trabalho!',
  },
]

// ─────────────────────────────────────────────────────────────
// ADMIN — 5 steps
// ─────────────────────────────────────────────────────────────
export const adminSteps: TourStep[] = [
  {
    target: 'body',
    placement: 'center',
    title: '🛡️ Painel Administrativo',
    content:
      'Bem-vindo ao CSTI! Como administrador, você gerencia usuários e monitora todo o sistema.',
  },
  {
    target: 'a[href="/admin/usuarios"]',
    placement: 'right',
    title: 'Gestão de Usuários',
    content:
      'Aqui você ativa e desativa contas de clientes e prestadores.',
  },
  {
    target: '[data-tour="tabela-usuarios"]',
    placement: 'top',
    data: { navigate: '/admin/usuarios' },
    title: 'Lista de Usuários',
    content:
      'Veja todos os usuários cadastrados. Clique em um usuário para ativar, desativar ou editar sua conta.',
  },
  {
    target: '[aria-label="Notificações"], button[title="Notificações"]',
    placement: 'bottom',
    title: '🔔 Alertas do Sistema',
    content:
      'Notificações importantes do sistema chegam aqui.',
  },
  {
    target: '#onboarding-help-button',
    placement: 'bottom',
    title: '❓ Sempre Disponível',
    content:
      'Rever o tour a qualquer momento. Bem-vindo à administração do CSTI!',
  },
]

// ─────────────────────────────────────────────────────────────
// Mapa de steps por role
// ─────────────────────────────────────────────────────────────
export const tourStepsByRole: Record<string, TourStep[]> = {
  cliente: clienteSteps,
  prestador: prestadorSteps,
  admin: adminSteps,
  super_admin: adminSteps,
}
