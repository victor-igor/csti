interface CurrencyDisplayProps {
  value: number
  className?: string
}

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function CurrencyDisplay({ value, className }: CurrencyDisplayProps) {
  return <span className={className}>{formatter.format(value)}</span>
}
