import { Trash2 } from 'lucide-react'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'
import { Button } from '@/components/ui/button'
import type { IItemOrcamento } from '@/types/domain'

interface ItemOrcamentoRowProps {
  item: IItemOrcamento
  onRemove?: () => void
}

const TIPO_LABELS: Record<string, string> = {
  servico: 'Mão de Obra',
  produto: 'Peça / Produto',
  outros: 'Deslocamento / Outros',
}

const TIPO_BADGES: Record<string, string> = {
  servico: 'bg-blue-50 text-blue-700 border-blue-200',
  produto: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  outros: 'bg-neutral-50 text-neutral-600 border-neutral-200',
}

export function ItemOrcamentoRow({ item, onRemove }: ItemOrcamentoRowProps) {
  const total = (item.quantidade ?? 0) * (item.valor_unitario ?? 0)
  const tipoStr = (item as any).tipo || 'servico'

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">{item.descricao}</p>
          <span className={`inline-flex items-center rounded-full px-1.5 py-0.25 text-[10px] font-medium border ${TIPO_BADGES[tipoStr] || TIPO_BADGES.servico}`}>
            {TIPO_LABELS[tipoStr] || TIPO_LABELS.servico}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span>Qtd: {item.quantidade}</span>
          <span>
            Unit.: <CurrencyDisplay value={item.valor_unitario ?? 0} />
          </span>
        </div>
      </div>
      <CurrencyDisplay value={total} className="shrink-0 text-sm font-semibold text-foreground" />
      {onRemove && (
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onRemove}
          aria-label="Remover item"
          className="shrink-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      )}
    </div>
  )
}
