export const COUNTRIES = [
  { code: 'BR', dial: '+55',  flag: '🇧🇷', name: 'Brasil' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'EUA' },
  { code: 'PT', dial: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: 'AR', dial: '+54',  flag: '🇦🇷', name: 'Argentina' },
  { code: 'CL', dial: '+56',  flag: '🇨🇱', name: 'Chile' },
  { code: 'MX', dial: '+52',  flag: '🇲🇽', name: 'México' },
  { code: 'CO', dial: '+57',  flag: '🇨🇴', name: 'Colômbia' },
  { code: 'PY', dial: '+595', flag: '🇵🇾', name: 'Paraguai' },
  { code: 'UY', dial: '+598', flag: '🇺🇾', name: 'Uruguai' },
] as const

export type CountryDial = (typeof COUNTRIES)[number]['dial']

export function formatBRPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (!digits.length) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

function formatUSPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10)
  if (!d.length) return ''
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

function formatPTPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 9)
  if (!d.length) return ''
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

function formatARPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10)
  if (!d.length) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
}

function formatCLPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 9)
  if (!d.length) return ''
  if (d.length <= 1) return d
  if (d.length <= 5) return `${d.slice(0, 1)} ${d.slice(1)}`
  return `${d.slice(0, 1)} ${d.slice(1, 5)}-${d.slice(5)}`
}

function formatMXPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10)
  if (!d.length) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
}

function formatCOPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 10)
  if (!d.length) return ''
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
}

function formatPYPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 9)
  if (!d.length) return ''
  if (d.length <= 3) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`
}

function formatUYPhone(value: string): string {
  const d = value.replace(/\D/g, '').slice(0, 8)
  if (!d.length) return ''
  if (d.length <= 1) return d
  if (d.length <= 4) return `${d.slice(0, 1)} ${d.slice(1)}`
  return `${d.slice(0, 1)} ${d.slice(1, 4)}-${d.slice(4)}`
}

export function formatPhoneByDial(value: string, dial: string): string {
  switch (dial) {
    case '+55':  return formatBRPhone(value)
    case '+1':   return formatUSPhone(value)
    case '+351': return formatPTPhone(value)
    case '+54':  return formatARPhone(value)
    case '+56':  return formatCLPhone(value)
    case '+52':  return formatMXPhone(value)
    case '+57':  return formatCOPhone(value)
    case '+595': return formatPYPhone(value)
    case '+598': return formatUYPhone(value)
    default:     return value.replace(/\D/g, '').slice(0, 15)
  }
}

export function parseStoredPhone(stored: string | null | undefined): { dial: string; number: string } {
  if (!stored) return { dial: '+55', number: '' }
  const country = COUNTRIES.find((c) => stored.startsWith(c.dial + ' '))
  if (country) return { dial: country.dial, number: stored.slice(country.dial.length + 1) }
  return { dial: '+55', number: stored }
}

export function buildStoredPhone(dial: string, number: string): string | null {
  return number ? `${dial} ${number}` : null
}
