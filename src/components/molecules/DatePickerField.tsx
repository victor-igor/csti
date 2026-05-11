import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { format, parseISO, isValid } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

type Props<T extends FieldValues> = {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  disabled?: boolean
  optional?: boolean
}

function toDate(value: unknown): Date | undefined {
  if (!value) return undefined
  if (value instanceof Date) return isValid(value) ? value : undefined
  if (typeof value === 'string') {
    const d = parseISO(value)
    return isValid(d) ? d : undefined
  }
  return undefined
}

export function DatePickerField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = 'Selecione uma data',
  disabled,
  optional,
}: Props<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected = toDate(field.value)
        return (
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-neutral-700">
              {label}
              {optional && (
                <span className="ml-1 text-xs text-muted-foreground font-normal">(opcional)</span>
              )}
            </label>
            <Popover>
              <PopoverTrigger
                type="button"
                disabled={disabled}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm text-left outline-none transition-colors',
                  'border-neutral-200 focus:border-primary/50 focus:ring-2 focus:ring-primary/30',
                  !selected && 'text-muted-foreground',
                  fieldState.error && 'border-danger focus:border-danger focus:ring-danger',
                  disabled && 'opacity-60 cursor-not-allowed',
                )}
              >
                <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                {selected ? format(selected, 'dd/MM/yyyy', { locale: ptBR }) : placeholder}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selected}
                  onSelect={(date) =>
                    field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                  }
                  locale={ptBR}
                />
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
