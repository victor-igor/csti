import { CurrencyDisplay } from '@/components/atoms/CurrencyDisplay'

interface TotalSummaryProps {
  subtotal: number
  taxes?: number
  total: number
}

export function TotalSummary({ subtotal, taxes, total }: TotalSummaryProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 space-y-2">
      <div className="flex justify-between text-sm text-neutral-600">
        <span>Subtotal</span>
        <CurrencyDisplay value={subtotal} />
      </div>
      {taxes != null && (
        <div className="flex justify-between text-sm text-neutral-600">
          <span>Impostos</span>
          <CurrencyDisplay value={taxes} />
        </div>
      )}
      <div className="border-t border-neutral-200 pt-2 flex justify-between text-sm font-semibold text-neutral-800">
        <span>Total</span>
        <CurrencyDisplay value={total} />
      </div>
    </div>
  )
}
