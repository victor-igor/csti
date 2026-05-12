interface InfoRowProps {
  label: string
  value?: React.ReactNode
  placeholder?: React.ReactNode
  action?: React.ReactNode
}

export function InfoRow({ label, value, placeholder, action }: InfoRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 sm:py-3.5 border-b border-neutral-100 last:border-0 gap-0.5 sm:gap-0">
      <span className="w-full sm:w-40 sm:shrink-0 text-xs sm:text-sm font-medium sm:font-normal text-neutral-400 sm:text-neutral-500">
        {label}
      </span>
      <span className="flex-1 text-sm text-neutral-900">
        {value || placeholder}
      </span>
      {action && <div className="shrink-0 mt-1 sm:mt-0 sm:ml-4">{action}</div>}
    </div>
  )
}
