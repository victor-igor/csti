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

export type IProfile = Tables<'profiles'>

export type ISolicitacao = Tables<'solicitacoes_orcamento'>

export type IOrcamento = Tables<'orcamentos'>

export interface IItemOrcamento extends Tables<'itens_orcamento'> {
  readonly valor_total: number | null
}

export type IOrdemServico = Tables<'ordens_servico'>

export type INotificacao = Tables<'notificacoes'>
