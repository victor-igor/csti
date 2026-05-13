import { useEffect, useState } from 'react'
import { Dialog } from '@base-ui/react'
import { ClipboardList, FileText, Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

const STORAGE_KEY = 'orcafacil_onboarding_seen'

export function OnboardingWelcome() {
  const profile = useAuthStore((s) => s.profile)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!profile) return
    if (typeof window === 'undefined') return

    const localFlag = window.localStorage.getItem(STORAGE_KEY)
    if (localFlag === '1') return

    // Heurística: coluna onboarding_done (se existir) ou timestamps próximos
    const onboardingDone = (profile as { onboarding_done?: boolean }).onboarding_done
    if (onboardingDone === true) {
      window.localStorage.setItem(STORAGE_KEY, '1')
      return
    }

    const created = new Date(profile.created_at).getTime()
    const updated = new Date(profile.updated_at).getTime()
    const recente = Math.abs(updated - created) < 60_000

    if (onboardingDone === false || recente) {
      setOpen(true)
    }
  }, [profile])

  async function handleClose() {
    setOpen(false)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, '1')
    }
    if (profile?.id) {
      // Tentar marcar a coluna se existir; ignorar erro silenciosamente
      try {
        await supabase
          .from('profiles')
          .update({ onboarding_done: true } as never)
          .eq('id', profile.id)
      } catch {
        // coluna pode não existir; localStorage cobre
      }
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-[290]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-neutral-800">
            Bem-vindo ao CSTI!
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-neutral-600">
            Em 3 passos você sai do problema para a solução:
          </Dialog.Description>
          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-3">
              <ClipboardList className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">Crie uma solicitação descrevendo seu problema</span>
            </li>
            <li className="flex items-start gap-3">
              <FileText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">Receba o orçamento de um prestador</span>
            </li>
            <li className="flex items-start gap-3">
              <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <span className="text-sm text-foreground">Acompanhe a Ordem de Serviço até a conclusão</span>
            </li>
          </ul>
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleClose}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Entendi
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
