import { type LucideIcon } from 'lucide-react'

interface InfoCardProps {
  label: string
  value: React.ReactNode
  icon?: LucideIcon
}

export function InfoCard({ label, value, icon: Icon }: InfoCardProps) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-neutral-400 shrink-0" />}
        <span className="text-xs text-neutral-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-neutral-800">{value}</div>
    </div>
  )
}
