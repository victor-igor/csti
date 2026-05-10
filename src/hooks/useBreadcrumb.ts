import { useLocation } from 'react-router-dom'

export interface BreadcrumbItem {
  label: string
  href: string | null
}

const SEGMENT_LABELS: Record<string, string> = {
  dashboard:       'Dashboard',
  solicitacoes:    'Solicitações',
  orcamentos:      'Orçamentos',
  'ordens-servico': 'Ordens de Serviço',
  nova:            'Nova Solicitação',
  revisar:         'Revisar Orçamento',
  perfil:          'Meu Perfil',
  prestador:       '', // segmento invisível (prefixo de rota)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const CODE_RE = /^(SOL|ORC|OS)-\d{4}-\d+$/i

function segmentLabel(seg: string): string {
  if (SEGMENT_LABELS[seg] !== undefined) return SEGMENT_LABELS[seg]
  if (UUID_RE.test(seg)) return `#${seg.slice(0, 6)}`
  if (CODE_RE.test(seg)) return seg
  return seg.charAt(0).toUpperCase() + seg.slice(1)
}

export function useBreadcrumb(): BreadcrumbItem[] {
  const { pathname } = useLocation()

  const segments = pathname.split('/').filter(Boolean)

  const items: BreadcrumbItem[] = [{ label: 'Dashboard', href: segments.length === 0 ? null : '/' }]

  // Build items with correct href using segment position tracking
  let segIdx = 0
  const visibleWithPos: Array<{ seg: string; pos: number }> = []
  for (const seg of segments) {
    if (SEGMENT_LABELS[seg] !== '') {
      visibleWithPos.push({ seg, pos: segIdx })
    }
    segIdx++
  }

  visibleWithPos.forEach(({ seg, pos }, i) => {
    const href = i === visibleWithPos.length - 1
      ? null
      : '/' + segments.slice(0, pos + 1).join('/')
    items.push({ label: segmentLabel(seg), href })
  })

  // Máximo 3 níveis
  return items.slice(0, 3)
}
