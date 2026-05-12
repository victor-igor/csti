interface StatusFilterChipsProps<T extends string> {
  filters: { label: string; value: T }[]
  active: T
  onSelect: (value: T) => void
}

export function StatusFilterChips<T extends string>({
  filters,
  active,
  onSelect,
}: StatusFilterChipsProps<T>) {
  return (
    <>
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onSelect(f.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
            active === f.value
              ? 'bg-primary text-white border-primary'
              : 'bg-neutral-25 border-border text-neutral-500 hover:text-foreground hover:border-neutral-300'
          }`}
        >
          {f.label}
        </button>
      ))}
    </>
  )
}
