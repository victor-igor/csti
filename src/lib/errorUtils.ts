export function parseApiError(error: unknown): string {
  // Guard contra null/undefined
  if (!error) return ''

  // Offline check (apenas em ambiente browser)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Verifique sua conexão e tente novamente'
  }

  // Supabase/Postgres errors são objetos com code/message
  if (typeof error === 'object') {
    const e = error as { code?: string; message?: string }

    // Email duplicado / unique violation
    if (e.code === '23505') {
      return 'Este e-mail já está cadastrado'
    }

    // Sem permissão / RLS
    if (e.code === '42501') {
      return 'Você não tem permissão para realizar esta ação'
    }

    // Network / fetch failure no message
    const msg = (e.message || '').toLowerCase()
    if (msg.includes('failed to fetch') || msg.includes('networkerror')) {
      return 'Verifique sua conexão e tente novamente'
    }
    if (msg.includes('permission denied')) {
      return 'Você não tem permissão para realizar esta ação'
    }
  }

  // Sem mapeamento — caller decide o fallback contextual (D-06)
  return ''
}
