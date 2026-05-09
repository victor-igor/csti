export function getGreeting(name: string): string {
  const hour = new Date().getHours()
  const period = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const firstName = name.split(' ')[0]
  return `${period}, ${firstName}!`
}
