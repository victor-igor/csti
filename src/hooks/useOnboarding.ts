/**
 * useOnboarding — Store do tour de onboarding (React Joyride)
 *
 * Substitui a implementação anterior com driver.js.
 * Agora o tour vive dentro do React (AppShell) e navega via React Router.
 *
 * Storage key v3 → limpa estados antigos do driver.js (v1/v2).
 */
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Role = 'cliente' | 'prestador' | 'admin' | 'super_admin'

interface OnboardingState {
  /** Controla se o Joyride está rodando */
  run: boolean
  /** Step atual do Joyride */
  stepIndex: number
  /** Role do usuário (determina quais steps mostrar) */
  role: Role | null
  /** Tour foi concluído ou pulado nesta sessão de localStorage */
  tourDone: boolean

  // ── Ações ────────────────────────────────────────────────
  /** Inicia o tour para um role específico */
  startTour: (role: Role) => void
  /** Avança para um step específico */
  setStepIndex: (index: number) => void
  /** Marca o tour como concluído e para o Joyride */
  finishTour: () => void
  /** Reseta completamente (força re-exibição) */
  reset: () => void
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      run: false,
      stepIndex: 0,
      role: null,
      tourDone: false,

      startTour: (role) =>
        set({
          run: true,
          stepIndex: 0,
          role,
          tourDone: false,
        }),

      setStepIndex: (index) => set({ stepIndex: index }),

      finishTour: () =>
        set({
          run: false,
          stepIndex: 0,
          tourDone: true,
        }),

      reset: () =>
        set({
          run: false,
          stepIndex: 0,
          tourDone: false,
        }),
    }),
    {
      name: 'csti-onboarding-v3', // v3 → apaga estados antigos do driver.js (v1/v2)
      // Persiste só tourDone — run e stepIndex resetam ao recarregar
      partialize: (state) => ({ tourDone: state.tourDone, role: state.role }),
    }
  )
)
