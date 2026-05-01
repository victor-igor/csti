import { Trash2 } from 'lucide-react'
import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'
import { Button } from '@/components/ui/button'
import type { IItemOrcamento } from '@/types/domain'

interface ItemOrcamentoRowProps {
  item: IItemOrcamento
  onRemove?: () => void
}

export function ItemOrcamentoRow({ item, onRemove }: ItemOrcamentoRowProps) {
  const total = (item.quantidade ?? 0) * (item.valor_unitario ?? 0)

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{item.descricao}</p>
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
