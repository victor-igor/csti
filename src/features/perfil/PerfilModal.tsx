import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, User, Shield, Loader2, Pencil } from 'lucide-react'
import { CATEGORIAS, CATEGORIA_LABEL } from '@/features/solicitacao/solicitacaoSchemas'
import { toast } from 'sonner'
import { Dialog } from '@base-ui/react'
import { Button } from '@/components/ui/button'
import { PhoneInput } from '@/components/molecules/PhoneInput'
import { InfoRow } from '@/components/molecules/InfoRow'
import { parseStoredPhone, buildStoredPhone, formatDisplayPhone } from '@/lib/phoneUtils'
import { parseApiError } from '@/lib/errorUtils'
import { useAuthStore } from '@/store/authStore'
import { useGetPerfil, useUpdatePerfil } from '@/features/perfil/usePerfil'
import { usePerfilModal } from '@/store/perfilModalStore'
import { supabase } from '@/lib/supabase'
import type { Role } from '@/types/domain'

const ROLE_LABEL: Record<Role, string> = {
  cliente: 'Cliente',
  prestador: 'Prestador',
  admin: 'Administrador',
  super_admin: 'Super Admin',
}

const PerfilSchema = z.object({
  nome: z.string().min(2, 'Mínimo 2 caracteres'),
  phoneDial: z.string(),
  phoneNumber: z.string().optional(),
  especialidade: z.array(z.string()).optional(),
})
type PerfilFormData = z.infer<typeof PerfilSchema>

type Tab = 'perfil' | 'seguranca'

const inputCls =
  'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors'

// ── Aba Perfil ──
function PerfilTab() {
  const { user, profile: storeProfile } = useAuthStore()
  const email = useAuthStore((s) => s.session?.user?.email) ?? ''
  const userId = user?.id ?? ''
  const [isEditing, setIsEditing] = useState(false)

  const { data: profile } = useGetPerfil(userId)
  const { mutate, isPending } = useUpdatePerfil(userId)
  const activeProfile = profile ?? storeProfile
  const roleLabel = activeProfile?.role ? ROLE_LABEL[activeProfile.role as Role] : ''
  const initials = activeProfile?.nome?.charAt(0).toUpperCase() ?? '?'

  const { control, handleSubmit, reset } = useForm<PerfilFormData>({
    resolver: zodResolver(PerfilSchema),
    defaultValues: { nome: '', phoneDial: '+55', phoneNumber: '', especialidade: [] },
  })

  useEffect(() => {
    if (activeProfile) {
      const parsed = parseStoredPhone(activeProfile.telefone)
      reset({
        nome: activeProfile.nome ?? '',
        phoneDial: parsed.dial,
        phoneNumber: parsed.number,
        especialidade: Array.isArray(activeProfile.especialidade) ? activeProfile.especialidade : [],
      })
    }
  }, [activeProfile, reset])

  function onSubmit(data: PerfilFormData) {
    const telefone = buildStoredPhone(data.phoneDial, data.phoneNumber ?? '')
    mutate(
      { nome: data.nome, telefone, especialidade: data.especialidade?.length ? data.especialidade : null },
      {
        onSuccess: () => { toast.success('Perfil atualizado!'); setIsEditing(false) },
        onError: (error: Error) => toast.error(parseApiError(error) || 'Erro ao atualizar perfil'),
      },
    )
  }

  function handleCancel() {
    const parsed = parseStoredPhone(activeProfile?.telefone)
    reset({ nome: activeProfile?.nome ?? '', phoneDial: parsed.dial, phoneNumber: parsed.number, especialidade: Array.isArray(activeProfile?.especialidade) ? activeProfile.especialidade : [] })
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <h4 className="text-sm font-semibold text-neutral-800 mb-2">Atualizar perfil</h4>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Nome</label>
          <Controller name="nome" control={control} render={({ field, fieldState }) => (
            <>
              <input {...field} type="text" placeholder="Seu nome completo" className={inputCls} />
              {fieldState.error && <p className="mt-1 text-xs text-danger">{fieldState.error.message}</p>}
            </>
          )} />
        </div>

        {activeProfile?.role === 'prestador' && (
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1">
              Áreas de atuação
            </label>
            <Controller
              name="especialidade"
              control={control}
              render={({ field }) => {
                const selected: string[] = field.value ?? []
                const toggle = (cat: string) => {
                  const next = selected.includes(cat)
                    ? selected.filter((c) => c !== cat)
                    : [...selected, cat]
                  field.onChange(next)
                }
                return (
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIAS.map((cat) => {
                      const active = selected.includes(cat)
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggle(cat)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            active
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-neutral-600 border-neutral-300 hover:border-primary/50'
                          }`}
                        >
                          {CATEGORIA_LABEL[cat]}
                        </button>
                      )
                    })}
                  </div>
                )
              }}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone</label>
          <Controller name="phoneDial" control={control} render={({ field: dialField }) => (
            <Controller name="phoneNumber" control={control} render={({ field: numField }) => (
              <PhoneInput
                dial={dialField.value}
                number={numField.value ?? ''}
                onDialChange={dialField.onChange}
                onNumberChange={numField.onChange}
              />
            )} />
          )} />
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" type="button" onClick={handleCancel} disabled={isPending} size="sm">Cancelar</Button>
          <Button type="submit" disabled={isPending} size="sm">
            {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Salvar
          </Button>
        </div>
      </form>
    )
  }

  return (
    <div>
      {/* Perfil row */}
      <InfoRow
        label="Perfil"
        value={
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm select-none">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-neutral-900">{activeProfile?.nome}</p>
              <p className="text-xs text-neutral-400">{roleLabel}</p>
            </div>
          </div>
        }
        action={
          <button onClick={() => setIsEditing(true)} className="text-sm text-primary hover:underline flex items-center gap-1">
            <Pencil className="h-3.5 w-3.5" /> Atualizar
          </button>
        }
      />

      {/* Email row */}
      <InfoRow
        label="E-mail"
        value={
          <div className="flex items-center gap-2 flex-wrap">
            <span>{email}</span>
            <span className="inline-flex items-center rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500 font-medium">Principal</span>
          </div>
        }
      />

      {/* Telefone row */}
      <InfoRow
        label="Telefone"
        value={
          activeProfile?.telefone
            ? <span>{formatDisplayPhone(activeProfile.telefone)}</span>
            : <button onClick={() => setIsEditing(true)} className="text-sm text-primary hover:underline">Adicionar telefone</button>
        }
        action={activeProfile?.telefone ? (
          <button onClick={() => setIsEditing(true)} className="text-sm text-primary hover:underline flex items-center gap-1">
            <Pencil className="h-3.5 w-3.5" /> Editar
          </button>
        ) : undefined}
      />

      {activeProfile?.role === 'prestador' && (
        <InfoRow
          label="Áreas de atuação"
          value={
            Array.isArray(activeProfile?.especialidade) && activeProfile.especialidade.length > 0
              ? (
                <div className="flex flex-wrap gap-1">
                  {activeProfile.especialidade.map((cat) => (
                    <span key={cat} className="inline-flex items-center rounded-full bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium">
                      {CATEGORIA_LABEL[cat as typeof CATEGORIAS[number]] ?? cat}
                    </span>
                  ))}
                </div>
              )
              : <span className="text-neutral-400">Nenhuma área selecionada</span>
          }
          action={
            <button onClick={() => setIsEditing(true)} className="text-sm text-primary hover:underline flex items-center gap-1">
              <Pencil className="h-3.5 w-3.5" /> Editar
            </button>
          }
        />
      )}
    </div>
  )
}

// ── Aba Segurança ──
function SegurancaTab() {
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [senhaError, setSenhaError] = useState<string | null>(null)
  const [trocandoSenha, setTrocandoSenha] = useState(false)
  const [isChanging, setIsChanging] = useState(false)

  async function handleTrocarSenha() {
    setSenhaError(null)
    if (novaSenha.length < 8) { setSenhaError('Senha deve ter pelo menos 8 caracteres'); return }
    if (novaSenha !== confirmarSenha) { setSenhaError('As senhas não coincidem'); return }
    setTrocandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    setTrocandoSenha(false)
    if (error) {
      const friendly = parseApiError(error) || 'Erro ao atualizar senha'
      setSenhaError(friendly)
      toast.error(friendly)
      return
    }
    toast.success('Senha atualizada')
    setIsChanging(false)
    setNovaSenha('')
    setConfirmarSenha('')
  }

  if (isChanging) {
    return (
      <div className="space-y-4 max-w-sm">
        <h4 className="text-sm font-semibold text-neutral-800">Alterar senha</h4>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Nova senha</label>
          <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)}
            className={inputCls} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Confirmar nova senha</label>
          <input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)}
            className={inputCls} placeholder="Repita a senha" autoComplete="new-password" />
        </div>
        {senhaError && <p className="text-sm text-danger">{senhaError}</p>}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" type="button" disabled={trocandoSenha} onClick={() => { setIsChanging(false); setSenhaError(null) }}>Cancelar</Button>
          <Button size="sm" onClick={handleTrocarSenha} disabled={trocandoSenha}>
            {trocandoSenha ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : null}
            Atualizar senha
          </Button>
        </div>
      </div>
    )
  }

  return (
    <InfoRow
      label="Senha"
      value={<span className="text-neutral-400 text-sm">••••••••</span>}
      action={
        <button onClick={() => setIsChanging(true)}
          className="text-sm border border-neutral-200 rounded-md px-3 py-1.5 hover:bg-neutral-50 transition-colors text-neutral-700">
          Alterar senha...
        </button>
      }
    />
  )
}

// ── Modal principal ──
export function PerfilModal() {
  const { isOpen, close } = usePerfilModal()
  const [activeTab, setActiveTab] = useState<Tab>('perfil')

  const navItems: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'seguranca', label: 'Segurança', icon: Shield },
  ]

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && close()}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-[calc(100%-2rem)] max-w-3xl rounded-xl bg-white shadow-2xl overflow-hidden flex flex-col sm:flex-row max-h-[85vh]">

          {/* ── Left nav (desktop) ── */}
          <div className="hidden sm:flex flex-col w-56 shrink-0 bg-neutral-50 border-r border-neutral-100 p-4">
            <div className="mb-5">
              <h2 className="text-sm font-semibold text-neutral-900">Conta</h2>
              <p className="text-xs text-neutral-400 mt-0.5 leading-snug">Gerencie seus dados de perfil.</p>
            </div>
            <nav className="space-y-0.5">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-sm transition-colors ${
                    activeTab === id
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* ── Right content ── */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
              <h3 className="text-base font-semibold text-neutral-900">
                {activeTab === 'perfil' ? 'Conta' : 'Segurança'}
              </h3>
              <button onClick={close}
                className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                aria-label="Fechar">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {activeTab === 'perfil' ? <PerfilTab /> : <SegurancaTab />}
            </div>

            {/* Mobile bottom tabs */}
            <div className="sm:hidden flex border-t border-neutral-100 shrink-0">
              {navItems.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
                    activeTab === id
                      ? 'text-primary border-t-2 border-primary -mt-px font-medium'
                      : 'text-neutral-500'
                  }`}>
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
