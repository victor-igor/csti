import { type ReactNode } from 'react'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'

interface ListPageShellProps {
  title: string
  subtitle?: string
  actions?: ReactNode
  filters?: ReactNode
  search: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  resultCount: number
  totalCount: number
  children: ReactNode
  columns?: 1 | 2
}

export function ListPageShell({
  title,
  subtitle,
  actions,
  filters,
  search,
  onSearchChange,
  searchPlaceholder,
  resultCount,
  totalCount,
  children,
  columns = 2,
}: ListPageShellProps) {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      <PageHeader title={title} subtitle={subtitle} actions={actions} />
      <FilterBar
        search={search}
        onSearchChange={onSearchChange}
        placeholder={searchPlaceholder}
        filters={filters}
        resultCount={resultCount}
        totalCount={totalCount}
      />
      <div className={`grid gap-3 ${columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {children}
      </div>
    </div>
  )
}
