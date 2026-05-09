export function relativeDate(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86_400_000)
  if (days === 0) return 'hoje'
  if (days === 1) return 'ontem'
  if (days < 30) return `há ${days} dias`
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function isNew(dateStr: string): boolean {
  return Date.now() - new Date(dateStr).getTime() < 86_400_000
}

export function greetingByHour(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}
