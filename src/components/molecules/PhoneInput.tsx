import { ChevronDown, Check } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { COUNTRIES, formatPhoneByDial } from '@/lib/phoneUtils'

interface PhoneInputProps {
  dial: string
  number: string
  onDialChange: (dial: string) => void
  onNumberChange: (number: string) => void
  placeholder?: string
  disabled?: boolean
}

const inputCls =
  'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

export function PhoneInput({
  dial,
  number,
  onDialChange,
  onNumberChange,
  placeholder,
  disabled,
}: PhoneInputProps) {
  const selected = COUNTRIES.find((c) => c.dial === dial) ?? COUNTRIES[0]
  const resolvedPlaceholder = placeholder ?? (dial === '+55' ? '(11) 99999-9999' : 'Número')

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger
          disabled={disabled}
          className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-white px-2.5 py-2 text-sm hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors w-[90px] sm:w-[110px] shrink-0 justify-between disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>{selected.flag} {selected.dial}</span>
          <ChevronDown className="h-3.5 w-3.5 text-neutral-400 shrink-0" />
        </PopoverTrigger>
        <PopoverContent side="bottom" align="start" sideOffset={4} className="w-[180px] p-1 rounded-lg shadow-lg border border-neutral-100">
          {COUNTRIES.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => {
                onDialChange(c.dial)
                // Reformat existing digits with the new country's mask
                if (number) {
                  onNumberChange(formatPhoneByDial(number.replace(/\D/g, ''), c.dial))
                }
              }}
              className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-md text-sm hover:bg-neutral-50 transition-colors text-left"
            >
              <span className="text-base leading-none">{c.flag}</span>
              <span className="flex-1 text-neutral-700">{c.name}</span>
              <span className="text-neutral-400 text-xs">{c.dial}</span>
              {c.dial === dial && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
            </button>
          ))}
        </PopoverContent>
      </Popover>

      <input
        type="tel"
        inputMode="tel"
        placeholder={resolvedPlaceholder}
        value={number}
        disabled={disabled}
        onChange={(e) => onNumberChange(formatPhoneByDial(e.target.value, dial))}
        className={inputCls}
      />
    </div>
  )
}
