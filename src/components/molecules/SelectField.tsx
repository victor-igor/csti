import { useState } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { Check, ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps<T extends FieldValues> {
  name: Path<T>
  control: Control<T>
  label: string
  options: SelectOption[]
  placeholder?: string
  className?: string
}

export function SelectField<T extends FieldValues>({
  name, control, label, options, placeholder, className,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false)

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected = options.find((o) => o.value === field.value)
        return (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">
              {label}
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                className={cn(
                  'flex items-center justify-between w-full rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary text-left',
                  !selected && 'text-neutral-400',
                  fieldState.error && 'border-danger focus:border-danger focus:ring-danger',
                  className,
                )}
              >
                <span>{selected ? selected.label : (placeholder ?? 'Selecione...')}</span>
                <ChevronDown className="h-4 w-4 text-neutral-400 shrink-0" />
              </PopoverTrigger>
              <PopoverContent align="start" sideOffset={4} className="p-1 rounded-lg shadow-lg border border-neutral-100" style={{ width: 'var(--radix-popover-trigger-width)' }}>
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => { field.onChange(opt.value); setOpen(false) }}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-md text-sm hover:bg-neutral-50 transition-colors text-left text-neutral-700"
                  >
                    {opt.label}
                    {field.value === opt.value && <Check className="h-4 w-4 text-primary shrink-0" />}
                  </button>
                ))}
              </PopoverContent>
            </Popover>
            {fieldState.error && (
              <p className="text-xs text-danger">{fieldState.error.message}</p>
            )}
          </div>
        )
      }}
    />
  )
}
