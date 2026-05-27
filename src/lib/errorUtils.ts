export function parseApiError(error: unknown): string {
  // Guard contra null/undefined
  if (!error) return ''

  // Offline check (apenas em ambiente browser)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return 'Verifique sua conexão e tente novamente'
  }

  // Supabase/Postgres errors são objetos com code/message
  if (typeof error === 'object') {
    const e = error as { code?: string; message?: string; details?: string; detail?: string }

    // Unique constraint violation — detecta qual campo causou o conflito
    if (e.code === '23505') {
      const hint = `${e.message ?? ''} ${e.details ?? ''} ${e.detail ?? ''}`.toLowerCase()
      if (hint.includes('telefone')) return 'Este telefone já está cadastrado por outro usuário'
      if (hint.includes('email'))    return 'Este e-mail já está cadastrado'
      return 'Este valor já está em uso por outro cadastro'
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
