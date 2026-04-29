import { Search } from 'lucide-react'

interface FilterBarProps {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  filters?: React.ReactNode
}

export function FilterBar({ search, onSearchChange, placeholder = 'Buscar...', filters }: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-neutral-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>
      {filters}
    </div>
  )
}
