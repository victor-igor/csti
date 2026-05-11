import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { useGetPerfil, useUpdatePerfil } from '@/features/perfil/usePerfil'
import { PageHeader } from '@/components/molecules/PageHeader'
import { UserCard } from '@/components/molecules/UserCard'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { FormField } from '@/components/molecules/FormField'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'

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

        <FormField<PerfilFormData>
          name="telefone"
          control={control}
          label="Telefone (opcional)"
          type="tel"
          placeholder="(11) 99999-9999"
        />

        {activeProfile?.role === 'prestador' && (
          <FormField<PerfilFormData>
            name="especialidade"
            control={control}
            label="Especialidade"
            placeholder="Ex: Redes, Hardware, Suporte"
          />
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Salvar
        </button>
      </form>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Salvar alterações"
        description="Deseja salvar as alterações no seu perfil?"
        onConfirm={handleConfirm}
        confirmLabel="Salvar"
        loading={isPending}
      />
    </div>
  )
}
