import { type InputHTMLAttributes } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface FormFieldProps<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  control: Control<T>
  label: string
}

export function FormField<T extends FieldValues>({ name, control, label, className, ...rest }: FormFieldProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-neutral-700" htmlFor={name}>
            {label}
          </label>
          <input
            id={name}
            {...field}
            {...rest}
            className={cn(
              'rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary',
              fieldState.error && 'border-danger focus:border-danger focus:ring-danger',
              className,
            )}
          />
          {fieldState.error && (
            <p className="text-xs text-danger">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}
