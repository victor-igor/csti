import { cn } from '@/lib/utils'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  isLoading?: boolean
  emptyMessage?: string
  children?: (row: T) => React.ReactNode
}

function getCellValue<T>(row: T, key: string): React.ReactNode {
  return String((row as Record<string, unknown>)[key] ?? '')
}

export function DataTable<T>({
  columns,
  data,
  isLoading,
  emptyMessage = 'Nenhum registro encontrado.',
  children,
}: DataTableProps<T>) {
  if (isLoading) {
    return <LoadingSkeleton rows={4} />
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card py-12 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <>
      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/40">
            <tr>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className="px-4 py-3 text-left font-medium text-muted-foreground"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.map((row, i) => (
              <tr key={i} className="bg-card hover:bg-muted/20 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3 text-foreground">
                    {col.render ? col.render(row) : getCellValue(row, String(col.key))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <div className={cn('flex flex-col gap-3 md:hidden')}>
        {data.map((row, i) =>
          children ? (
            <div key={i}>{children(row)}</div>
          ) : (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              {columns.map((col) => (
                <div key={String(col.key)} className="flex justify-between py-1 text-sm">
                  <span className="font-medium text-muted-foreground">{col.label}</span>
                  <span className="text-foreground">
                    {col.render ? col.render(row) : getCellValue(row, String(col.key))}
                  </span>
                </div>
              ))}
            </div>
          ),
        )}
      </div>
    </>
  )
}
