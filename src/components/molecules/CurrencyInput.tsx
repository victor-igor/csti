import { type InputHTMLAttributes } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface CurrencyInputProps<T extends FieldValues> extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: Path<T>
  control: Control<T>
  label: string
}

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)
}

function parseBRL(raw: string): number {
  const digits = raw.replace(/\D/g, '')
  return Number(digits) / 100
}

export function CurrencyInput<T extends FieldValues>({ name, control, label, className, ...rest }: CurrencyInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor={name}>
            {label}
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-500">R$</span>
            <input
              id={name}
              {...rest}
              value={field.value != null ? formatBRL(field.value as number) : ''}
              onChange={(e) => field.onChange(parseBRL(e.target.value))}
              inputMode="numeric"
              className={cn(
                'w-full rounded-md border border-neutral-300 pl-9 pr-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary',
                fieldState.error && 'border-danger focus:border-danger focus:ring-danger',
                className,
              )}
            />
          </div>
          {fieldState.error && (
            <p className="text-xs text-danger">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}
