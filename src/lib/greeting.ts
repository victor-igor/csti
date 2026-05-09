export function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  // Trim the name and handle empty/whitespace
  const trimmedName = name.trim()
  const firstName = trimmedName ? trimmedName.split(' ')[0] : ''

  // Return period without name if empty after trim
  if (!firstName) {
    return `${period}!`
  }

  return `${period}, ${firstName}!`
}
