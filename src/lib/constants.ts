import type { SolicitacaoStatus, OrcamentoStatus, OSStatus } from '@/types/domain'

export const Z = {
  base:      0,
  card:      10,
  dropdown:  20,
  bottomNav: 30,
  backdrop:  40,
  drawer:    50,
  modal:     60,
  toast:     70,
} as const

export const STATUS_LABELS: Record<SolicitacaoStatus | OrcamentoStatus | OSStatus, string> = {
  // SolicitacaoStatus
  aberta:              'Aberta',
  aguardando_orcamento: 'Aguardando Orçamento',
  orcamento_enviado:   'Orçamento Enviado',
  aprovado:            'Aprovado',
  cancelado:           'Cancelado',
  // OrcamentoStatus
  rascunho:            'Rascunho',
  enviado:             'Enviado',
  aceito:              'Aceito',
  recusado:            'Recusado',
  // OSStatus
  em_andamento:        'Em Andamento',
  concluida:           'Concluída',
  cancelada:           'Cancelada',
}
