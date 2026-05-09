import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

interface ActionItemProps {
  numero: string
  titulo: string
  subtexto?: string
  to: string
  ctaLabel?: string
}

export function ActionItem({ numero, titulo, subtexto, to, ctaLabel = 'Ver' }: ActionItemProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white px-4 py-3 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] text-neutral-400 uppercase tracking-wider">{numero}</p>
        <p className="text-sm font-medium text-neutral-800 truncate">{titulo}</p>
        {subtexto && (
          <p className="text-xs text-neutral-500 mt-0.5">{subtexto}</p>
        )}
      </div>
      <Link
        to={to}
        className="shrink-0 flex items-center gap-1 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
      >
        {ctaLabel}
        <ArrowRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
