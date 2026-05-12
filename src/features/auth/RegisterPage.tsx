import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { RegisterSchema, type RegisterFormData } from './authSchemas'
import { useAuth } from './useAuth'
import { FormField } from '@/components/molecules/FormField'
import { SelectField } from '@/components/molecules/SelectField'
import { PhoneInput } from '@/components/molecules/PhoneInput'
import { buildStoredPhone } from '@/lib/phoneUtils'
import DashboardPreview from './DashboardPreview'

const ROLE_OPTIONS = [
  { value: 'cliente', label: 'Cliente' },
  { value: 'prestador', label: 'Prestador' },
]

export default function RegisterPage() {
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState<string | null>(null)
  const [phoneDial, setPhoneDial] = useState('+55')
  const [phoneNumber, setPhoneNumber] = useState('')

  const { control, handleSubmit, watch, formState: { isSubmitting } } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: { nome: '', email: '', senha: '', confirmar_senha: '', telefone: '', especialidade: '', role: 'cliente', aceita_termos: false },
  })

  const role = watch('role')

  async function onSubmit(data: RegisterFormData) {
    setServerError(null)
    try {
      const telefone = buildStoredPhone(phoneDial, phoneNumber) ?? undefined
      await registerUser({ ...data, telefone })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao criar conta.')
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 overflow-hidden">
      {/* Background: DashboardPreview blurred (igual Stripe) */}
      <div className="absolute inset-0 pointer-events-none select-none scale-110">
        <DashboardPreview />
      </div>
      <div className="absolute inset-0 bg-white/20 backdrop-blur-[8px]" />

      {/* Card centralizado */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-6">Criar sua conta OrçaFácil</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <FormField<RegisterFormData>
            name="email"
            control={control}
            label="E-mail"
            type="email"
            placeholder="email@exemplo.com"
          />

          <FormField<RegisterFormData>
            name="nome"
            control={control}
            label="Nome completo"
            placeholder="Seu nome completo"
          />

          <FormField<RegisterFormData>
            name="senha"
            control={control}
            label="Senha"
            type="password"
            placeholder="Mínimo 8 caracteres"
          />

          <FormField<RegisterFormData>
            name="confirmar_senha"
            control={control}
            label="Confirmar senha"
            type="password"
            placeholder="Repita a senha"
          />

          <SelectField<RegisterFormData>
            name="role"
            control={control}
            label="Perfil"
            options={ROLE_OPTIONS}
            placeholder="Selecione um perfil"
          />

          {role === 'prestador' && (
            <FormField<RegisterFormData>
              name="especialidade"
              control={control}
              label="Especialidade"
              placeholder="Ex: Redes, Hardware, Suporte"
            />
          )}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Telefone <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
            </label>
            <PhoneInput
              dial={phoneDial}
              number={phoneNumber}
              onDialChange={setPhoneDial}
              onNumberChange={setPhoneNumber}
            />
          </div>

          <Controller
            name="aceita_termos"
            control={control}
            render={({ field, fieldState }) => (
              <div>
                <label className="flex items-start gap-2 text-sm text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    Li e aceito os{' '}
                    <Link to="/termos" className="text-primary hover:underline" target="_blank" rel="noopener">
                      Termos de Uso e Política de Privacidade
                    </Link>
                  </span>
                </label>
                {fieldState.error && (
                  <p className="mt-1 text-xs text-danger">{fieldState.error.message}</p>
                )}
              </div>
            )}
          />

          {serverError && (
            <p className="text-sm text-danger">{serverError}</p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full h-11 text-base">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Criar conta
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Acesse
          </Link>
        </p>
      </div>
    </div>
  )
}
