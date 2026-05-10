import type { SolicitacaoStatus } from '@/types/domain'
import {
  Clock, Hourglass, FileText, CheckCircle, XCircle,
  FilePen, Send, Wrench, CheckCircle2,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

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
  | 'aberta'
  | 'aguardando_orcamento'
  | 'orcamento_enviado'
  | 'aprovado'
  | 'cancelado'
  | 'recusado'
  | 'rascunho'
  | 'enviado'
  | 'aceito'
  | 'em_andamento'
  | 'concluida'
  | 'concluido'

export const STATUS_CONFIG: Record<string, {
  label: string
  icon: LucideIcon
  className: string
}> = {
  aberta:               { label: 'Aberta',               icon: Clock,         className: 'bg-warning-light text-warning' },
  aguardando_orcamento: { label: 'Aguardando Orçamento', icon: Hourglass,     className: 'bg-warning-light text-warning' },
  orcamento_enviado:    { label: 'Orçamento Enviado',    icon: FileText,      className: 'bg-primary-light text-primary' },
  aprovado:             { label: 'Aprovado',             icon: CheckCircle,   className: 'bg-success-light text-success' },
  cancelado:            { label: 'Cancelado',            icon: XCircle,       className: 'bg-danger-light text-danger' },
  recusado:             { label: 'Recusado',             icon: XCircle,       className: 'bg-danger-light text-danger' },
  rascunho:             { label: 'Rascunho',             icon: FilePen,       className: 'bg-neutral-25 text-neutral-500' },
  enviado:              { label: 'Enviado',              icon: Send,          className: 'bg-primary-light text-primary' },
  aceito:               { label: 'Aceito',               icon: CheckCircle,   className: 'bg-success-light text-success' },
  em_andamento:         { label: 'Em Andamento',         icon: Wrench,        className: 'bg-primary-light text-primary' },
  concluida:            { label: 'Concluída',            icon: CheckCircle2,  className: 'bg-success-light text-success' },
  concluido:            { label: 'Concluído',            icon: CheckCircle2,  className: 'bg-success-light text-success' },
}

export const STATUS_LABELS: Record<string, { label: string; className: string }> = Object.fromEntries(
  Object.entries(STATUS_CONFIG).map(([k, v]) => [k, { label: v.label, className: v.className }])
)

export const STATUS_BORDER_CLASS: Record<SolicitacaoStatus, string> = {
  aberta:               'border-l-warning',
  aguardando_orcamento: 'border-l-warning',
  orcamento_enviado:    'border-l-primary',
  aprovado:             'border-l-success',
  cancelado:            'border-l-neutral-200',
}
