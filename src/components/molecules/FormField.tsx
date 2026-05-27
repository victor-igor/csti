import { type InputHTMLAttributes, useState } from 'react'
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FormFieldProps<T extends FieldValues> extends InputHTMLAttributes<HTMLInputElement> {
  name: Path<T>
  control: Control<T>
  label: string
}

export function FormField<T extends FieldValues>({ name, control, label, className, type, ...rest }: FormFieldProps<T>) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

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
            <input
              id={name}
              type={inputType}
              {...field}
              {...rest}
              className={cn(
                'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary',
                isPassword && 'pr-10',
                fieldState.error && 'border-danger focus:border-danger focus:ring-danger',
                className,
              )}
            />
            {isPassword && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                tabIndex={-1}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-neutral-400 hover:text-neutral-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
          {fieldState.error && (
            <p className="text-xs text-danger">{fieldState.error.message}</p>
          )}
        </div>
      )}
    />
  )
}
