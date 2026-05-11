import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Dialog } from '@base-ui/react'
import { useAuthStore } from '@/store/authStore'
import { useGetPerfil, useUpdatePerfil } from '@/features/perfil/usePerfil'
import { PageHeader } from '@/components/molecules/PageHeader'
import { UserCard } from '@/components/molecules/UserCard'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { FormField } from '@/components/molecules/FormField'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { formatPhone } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const PerfilSchema = z.object({
  nome: z.string().min(2, 'Mínimo 2 caracteres'),
  telefone: z.string().optional(),
  especialidade: z.string().optional(),
})

type PerfilFormData = z.infer<typeof PerfilSchema>

export default function PerfilPage() {
  const { user, profile: storeProfile } = useAuthStore()
  const email = useAuthStore((s) => s.session?.user?.email) ?? ''
  const userId = user?.id ?? ''
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingData, setPendingData] = useState<PerfilFormData | null>(null)
  const [senhaOpen, setSenhaOpen] = useState(false)
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaError, setSenhaError] = useState<string | null>(null)
  const [trocandoSenha, setTrocandoSenha] = useState(false)

  const { data: profile, isLoading } = useGetPerfil(userId)
  const { mutate, isPending } = useUpdatePerfil(userId)

  const activeProfile = profile ?? storeProfile

  const { control, handleSubmit, reset } = useForm<PerfilFormData>({
    resolver: zodResolver(PerfilSchema),
    defaultValues: {
      nome: storeProfile?.nome ?? '',
      telefone: storeProfile?.telefone ?? '',
      especialidade: storeProfile?.especialidade ?? '',
    },
  })

  useEffect(() => {
    if (profile) {
      reset({
        nome: profile.nome ?? '',
        telefone: profile.telefone ?? '',
        especialidade: profile.especialidade ?? '',
      })
    }
  }, [profile, reset])

  function onSubmit(data: PerfilFormData) {
    setPendingData(data)
    setConfirmOpen(true)
  }

  function handleConfirm() {
    if (!pendingData) return
    const payload = {
      nome: pendingData.nome,
      telefone: pendingData.telefone ?? null,
      especialidade: pendingData.especialidade ?? null,
    }
    mutate(payload, {
      onSuccess: () => {
        toast.success('Perfil atualizado!')
        setConfirmOpen(false)
      },
      onError: () => {
        toast.error('Erro ao atualizar perfil')
        setConfirmOpen(false)
      },
    })
  }

  async function handleTrocarSenha() {
    setSenhaError(null)
    if (novaSenha.length < 8) {
      setSenhaError('Senha deve ter pelo menos 8 caracteres')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaError('As senhas não coincidem')
      return
    }
    setTrocandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setTrocandoSenha(false)
    if (error) {
      setSenhaError(error.message)
      toast.error('Erro ao atualizar senha')
      return
    }
    toast.success('Senha atualizada')
    setSenhaOpen(false)
    setNovaSenha('')
    setConfirmarSenha('')
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSkeleton rows={4} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <PageHeader title="Meu Perfil" />
      {activeProfile && (
        <div className="mb-6">
          <UserCard name={activeProfile.nome} role={activeProfile.role} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            E-mail <span className="text-xs text-muted-foreground font-normal">(não pode ser alterado)</span>
          </label>
          <input
            type="email"
            value={email}
            readOnly
            disabled
            className="w-full rounded-md border bg-muted px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
          />
        </div>
        <FormField<PerfilFormData>
          name="nome"
          control={control}
          label="Nome"
          placeholder="Seu nome completo"
        />

        <Controller
          name="telefone"
          control={control}
          render={({ field, fieldState }) => (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Telefone <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
              </label>
              <input
                type="tel"
                inputMode="tel"
                placeholder="(11) 99999-9999"
                value={field.value ?? ''}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
              {fieldState.error && (
                <p className="mt-1 text-xs text-danger">{fieldState.error.message}</p>
              )}
            </div>
          )}
        />

        {activeProfile?.role === 'prestador' && (
          <FormField<PerfilFormData>
            name="especialidade"
            control={control}
            label="Especialidade"
            placeholder="Ex: Redes, Hardware, Suporte"
          />
        )}

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </Button>
      </form>

      <div className="mt-8 border-t border-border pt-6">
        <h2 className="text-sm font-semibold text-foreground mb-3">Segurança</h2>
        <Button variant="outline" type="button" onClick={() => setSenhaOpen(true)}>
          Alterar senha
        </Button>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Salvar alterações"
        description="Deseja salvar as alterações no seu perfil?"
        onConfirm={handleConfirm}
        confirmLabel="Salvar"
        loading={isPending}
      />

      <Dialog.Root open={senhaOpen} onOpenChange={setSenhaOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-[290]" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <Dialog.Title className="text-base font-semibold text-neutral-800">
              Alterar senha
            </Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-neutral-600">
              Defina uma nova senha (mínimo 8 caracteres).
            </Dialog.Description>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Nova senha</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Confirmar nova senha</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Repita a senha"
                  autoComplete="new-password"
                />
              </div>
              {senhaError && <p className="text-sm text-danger">{senhaError}</p>}
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" type="button" disabled={trocandoSenha} onClick={() => setSenhaOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleTrocarSenha} disabled={trocandoSenha}>
                {trocandoSenha ? 'Atualizando...' : 'Atualizar senha'}
              </Button>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
