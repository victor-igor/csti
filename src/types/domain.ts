import type { Tables } from './supabase'

export type Role = 'cliente' | 'prestador'

export type SolicitacaoStatus =
  | 'aberta'
  | 'aguardando_orcamento'
  | 'orcamento_enviado'
  | 'aprovado'
  | 'cancelado'

export type OrcamentoStatus = 'rascunho' | 'enviado' | 'aceito' | 'recusado'

export type OSStatus = 'aberta' | 'em_andamento' | 'concluida' | 'cancelada'

export interface IProfile extends Tables<'profiles'> {}

export interface ISolicitacao extends Tables<'solicitacoes_orcamento'> {}

export interface IOrcamento extends Tables<'orcamentos'> {}

export interface IItemOrcamento extends Tables<'itens_orcamento'> {
  readonly valor_total: number | null
}

export interface IOrdemServico extends Tables<'ordens_servico'> {}

export interface INotificacao extends Tables<'notificacoes'> {}
