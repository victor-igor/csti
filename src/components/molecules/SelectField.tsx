import { type SelectHTMLAttributes } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface SelectFieldProps<T extends FieldValues> extends SelectHTMLAttributes<HTMLSelectElement> {
  name: Path<T>
  control: Control<T>
  label: string
  options: SelectOption[]
  placeholder?: string
}

export function SelectField<T extends FieldValues>({
  name, control, label, options, placeholder, className, ...rest
}: SelectFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor={name}>
            {label}
          </label>
          <select
            id={name}
            {...field}
            {...rest}
            className={cn(
              'rounded-md border border-neutral-300 px-3 py-2 text-sm bg-white outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              fieldState.error && 'border-danger focus:border-danger focus:ring-danger',
              className,
            )}
          >
            {placeholder && <option value="">{placeholder}</option>}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {fieldState.error && (
            <p className="text-xs text-danger">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}
