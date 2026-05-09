import type { SolicitacaoStatus } from '@/types/domain'

export const Z = {
  base:      0,
  card:      10,
  dropdown:  100,
  bottomNav: 200,
  backdrop:  290,
  drawer:    300,
  modal:     400,
  toast:     500,
} as const

export type StatusKey =
  | 'aguardando_orcamento'
  | 'orcamento_enviado'
  | 'aprovado'
  | 'recusado'
  | 'concluido'
  | 'rascunho'
  | 'enviado'
  | 'aberta'
  | 'em_andamento'

export const STATUS_LABELS: Record<StatusKey, { label: string; className: string }> = {
  aguardando_orcamento: { label: 'Aguardando Orçamento', className: 'bg-warning-light text-warning' },
  orcamento_enviado:    { label: 'Orçamento Enviado',    className: 'bg-primary-light text-primary' },
  aprovado:             { label: 'Aprovado',             className: 'bg-success-light text-success' },
  recusado:             { label: 'Recusado',             className: 'bg-danger-light text-danger' },
  concluido:            { label: 'Concluído',            className: 'bg-success-light text-success' },
  rascunho:             { label: 'Rascunho',             className: 'bg-neutral-100 text-neutral-600' },
  enviado:              { label: 'Enviado',              className: 'bg-primary-light text-primary' },
  aberta:               { label: 'Aberta',               className: 'bg-warning-light text-warning' },
  em_andamento:         { label: 'Em Andamento',         className: 'bg-blue-100 text-blue-700' },
}

export const STATUS_BORDER_CLASS: Record<SolicitacaoStatus, string> = {
  aberta:               'border-l-amber-400',
  aguardando_orcamento: 'border-l-amber-400',
  orcamento_enviado:    'border-l-blue-500',
  aprovado:             'border-l-green-500',
  cancelado:            'border-l-neutral-300',
}
