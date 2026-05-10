import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md'
  loading?: boolean
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:     'bg-primary text-white hover:bg-primary-dark shadow-button active:scale-[0.98]',
  secondary:   'bg-transparent text-primary border border-border hover:bg-neutral-25',
  ghost:       'bg-transparent text-primary hover:bg-neutral-25',
  destructive: 'bg-danger text-white hover:opacity-90 shadow-button active:scale-[0.98]',
}

const SIZE_CLASSES: Record<NonNullable<ButtonProps['size']>, string> = {
  md: 'px-4 py-2 text-sm',
  sm: 'px-3 py-1.5 text-xs',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...props}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />}
      {children}
    </button>
  )
}
