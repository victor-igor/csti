import { Search } from 'lucide-react'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filters?: React.ReactNode
  resultCount?: number
  totalCount?: number
}

export function FilterBar({
  search,
  onSearchChange,
  placeholder = 'Buscar...',
  filters,
  resultCount,
  totalCount,
}: FilterBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-md border border-border bg-muted pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-0 transition-colors"
          />
        </div>
        {filters && <div className="flex flex-wrap gap-1">{filters}</div>}
      </div>

      {resultCount !== undefined && totalCount !== undefined && (
        <p className="text-right text-xs text-muted-foreground">
          Mostrando {resultCount} de {totalCount}
        </p>
      )}
    </div>
  )
}
