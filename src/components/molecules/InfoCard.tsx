import { type LucideIcon } from 'lucide-react'

interface InfoCardProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
}

export function InfoCard({ label, value, icon: Icon }: InfoCardProps) {
  return (
    <div className="rounded-md border border-border bg-neutral-25 p-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  )
}
