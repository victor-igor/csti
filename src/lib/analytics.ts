// Wrapper de analytics — atualmente no-op (apenas console.info em dev).
// Quando o provider for escolhido (PostHog / Plausible / Mixpanel / custom Supabase events),
// swap a implementação de `track()` aqui e todos os call sites do app passam a emitir.

type EventName =
  | 'login_attempt'
  | 'login_success'
  | 'login_error'
  | 'session_ready'
  | 'profile_loaded'
  | 'profile_load_failed'
  | 'logout'

type EventProps = Record<string, string | number | boolean | null | undefined>

const ENABLED = false
const VERBOSE_DEV = import.meta.env.DEV

export function track(event: EventName, props?: EventProps): void {
  if (VERBOSE_DEV) {
    console.info(`[analytics] ${event}`, props ?? {})
  }
  if (!ENABLED) return
  // TODO: wire up provider
  // posthog.capture(event, props)
  // plausible(event, { props })
}

export function trackError(event: EventName, err: unknown, props?: EventProps): void {
  const message = err instanceof Error ? err.message : String(err)
  track(event, { ...props, error_message: message })
}
