import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit2, Trash2, Mail, Phone, ShieldAlert, ShieldCheck, UserCheck, Loader2, X, Plus, PowerOff, Power } from 'lucide-react'
import { Dialog } from '@base-ui/react'
import { supabase } from '@/lib/supabase'
import { parseApiError } from '@/lib/errorUtils'
import { PageHeader } from '@/components/molecules/PageHeader'
import { FilterBar } from '@/components/molecules/FilterBar'
import { StatusFilterChips } from '@/components/molecules/StatusFilterChips'
import { LoadingSkeleton } from '@/components/atoms/LoadingSkeleton'
import { EmptyState } from '@/components/atoms/EmptyState'
import { ConfirmDialog } from '@/components/molecules/ConfirmDialog'
import { Button } from '@/components/ui/button'
import type { IProfile, Role } from '@/types/domain'
import { formatDisplayPhone, parseStoredPhone, buildStoredPhone } from '@/lib/phoneUtils'
import { PhoneInput } from '@/components/molecules/PhoneInput'

const ROLE_FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Clientes', value: 'cliente' },
  { label: 'Prestadores', value: 'prestador' },
  { label: 'Administradores', value: 'admin' },
]

const ROLE_BADGE: Record<Role, React.ReactNode> = {
  cliente: (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
      <UserCheck className="h-3 w-3" /> Cliente
    </span>
  ),
  prestador: (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
      <ShieldCheck className="h-3 w-3" /> Prestador
    </span>
  ),
  admin: (
    <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-700">
      <ShieldAlert className="h-3 w-3" /> Admin
    </span>
  ),
}

const INATIVO_BADGE = (
  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 border border-neutral-200">
    <PowerOff className="h-3 w-3" /> Inativo
  </span>
)

export default function AdminUsuariosPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeRole, setActiveRole] = useState('')
  const [editingUser, setEditingUser] = useState<IProfile | null>(null)
  const [deletingUser, setDeletingUser] = useState<IProfile | null>(null)
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // 1. Fetch Users
  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('nome', { ascending: true })
      if (error) throw error
      return data as IProfile[]
    },
  })

  // Create User Mutation
  const createMutation = useMutation({
    mutationFn: async (newUser: {
      email: string
      senha: string
      nome: string
      role: Role
      telefone: string | null
      especialidade: string | null
    }) => {
      const { error } = await supabase.rpc('admin_criar_usuario', {
        p_email: newUser.email,
        p_senha: newUser.senha,
        p_nome: newUser.nome,
        p_role: newUser.role,
        p_telefone: newUser.telefone ?? null,
        p_especialidade: newUser.especialidade ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Usuário criado com sucesso!')
      setIsCreatingUser(false)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao criar usuário')
    },
  })

  // 2. Update User Mutation
  const updateMutation = useMutation({
    mutationFn: async (updated: Partial<IProfile> & { id: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: updated.nome,
          role: updated.role,
          telefone: updated.telefone ?? null,
          especialidade: updated.especialidade ?? null,
        })
        .eq('id', updated.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['badge', 'solicitacoes'] })
      toast.success('Usuário atualizado com sucesso!')
      setEditingUser(null)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao atualizar usuário')
    },
  })

  // 3. Deactivate / Reactivate Mutations
  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_desativar_usuario', { p_user_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Usuário desativado com sucesso.')
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao desativar usuário')
    },
  })

  const reactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_reativar_usuario', { p_user_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Usuário reativado com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao reativar usuário')
    },
  })

  // 4. Delete User Mutation (RPC)
  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.rpc('admin_deletar_usuario', {
        p_user_id: userId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Usuário excluído com sucesso!')
      setDeletingUser(null)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao excluir usuário')
    },
  })

  // Filtering
  const filteredUsers = users
    .filter((u) => !activeRole || u.role === activeRole)
    .filter(
      (u) =>
        !search ||
        u.nome.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <div className="p-6 max-w-5xl space-y-6">
      <PageHeader
        title="Gerenciamento de Usuários"
        subtitle="Gerencie os usuários da plataforma — crie, edite, desative ou exclua contas"
        actions={
          <Button onClick={() => setIsCreatingUser(true)} className="flex items-center gap-1.5 h-9 text-xs">
            <Plus className="h-4 w-4" /> Novo Usuário
          </Button>
        }
      />

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        placeholder="Buscar por nome ou e-mail..."
        filters={
          <StatusFilterChips
            filters={ROLE_FILTERS}
            active={activeRole}
            onSelect={setActiveRole}
          />
        }
        resultCount={filteredUsers.length}
        totalCount={users.length}
      />

      {isLoading && <LoadingSkeleton rows={5} />}

      {isError && (
        <EmptyState
          title="Erro ao carregar usuários"
          description="Ocorreu um erro ao buscar a lista de usuários da plataforma."
          action={
            <Button onClick={() => refetch()} size="sm">
              Tentar novamente
            </Button>
          }
        />
      )}

      {!isLoading && !isError && filteredUsers.length === 0 && (
        <EmptyState
          title="Nenhum usuário encontrado"
          description="Nenhum cadastro atende aos filtros selecionados."
        />
      )}

      {!isLoading && !isError && filteredUsers.length > 0 && (
        <div className="grid gap-4 grid-cols-1">
          {filteredUsers.map((user) => {
            const initials = user.nome.charAt(0).toUpperCase()
            const isInactive = user.ativo === false
            return (
              <div
                key={user.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border bg-card p-5 shadow-card transition-colors ${
                  isInactive
                    ? 'border-neutral-200 opacity-60 grayscale-[30%]'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {/* User details */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-lg">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-foreground truncate">{user.nome}</p>
                      {ROLE_BADGE[user.role as Role]}
                      {isInactive && INATIVO_BADGE}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" /> {user.email}
                    </p>
                    {user.telefone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5 truncate">
                        <Phone className="h-3.5 w-3.5 shrink-0" /> {formatDisplayPhone(user.telefone)}
                      </p>
                    )}
                    {user.role === 'prestador' && (
                      <p className="text-xs text-primary font-medium truncate">
                        Especialidade: {user.especialidade || 'Não informada'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 sm:self-center shrink-0">
                  {/* Toggle Deactivate / Reactivate */}
                  {isInactive ? (
                    <button
                      onClick={() => reactivateMutation.mutate(user.id)}
                      disabled={reactivateMutation.isPending}
                      className="p-2 rounded-md hover:bg-green-50 text-neutral-400 hover:text-green-600 transition-colors"
                      title="Reativar Usuário"
                    >
                      <Power className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => deactivateMutation.mutate(user.id)}
                      disabled={deactivateMutation.isPending}
                      className="p-2 rounded-md hover:bg-amber-50 text-neutral-400 hover:text-amber-600 transition-colors"
                      title="Desativar Usuário"
                    >
                      <PowerOff className="h-4 w-4" />
                    </button>
                  )}

                  {/* Standard edit / delete actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingUser(user)}
                      className="p-2 rounded-md hover:bg-neutral-50 text-neutral-500 hover:text-foreground transition-colors"
                      title="Editar Usuário"
                    >
                      <Edit2 className="h-4.5 w-4.5" />
                    </button>
                    <button
                      onClick={() => setDeletingUser(user)}
                      className="p-2 rounded-md hover:bg-neutral-50 text-neutral-500 hover:text-danger transition-colors"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Confirm Dialog Deletion ── */}
      {deletingUser && (
        <ConfirmDialog
          open={!!deletingUser}
          onOpenChange={(open) => !open && setDeletingUser(null)}
          title="Excluir Conta"
          description={`Tem certeza que deseja excluir permanentemente a conta de ${deletingUser.nome}? Esta ação também apagará todas as solicitações, orçamentos e históricos associados a ela e NÃO poderá ser desfeita.`}
          confirmLabel="Excluir permanentemente"
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deletingUser.id)}
        />
      )}

      {/* ── Edit User Modal (Dialog) ── */}
      {editingUser && (
        <Dialog.Root open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-[calc(100%-2rem)] max-w-md rounded-xl bg-white p-6 shadow-2xl overflow-hidden flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-semibold text-neutral-900">Editar Usuário</h3>
                <button
                  onClick={() => setEditingUser(null)}
                  className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <EditUserForm
                user={editingUser}
                isPending={updateMutation.isPending}
                onCancel={() => setEditingUser(null)}
                onSubmit={(data) => updateMutation.mutate({ id: editingUser.id, ...data })}
              />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}

      {/* ── Create User Modal (Dialog) ── */}
      {isCreatingUser && (
        <Dialog.Root open={isCreatingUser} onOpenChange={setIsCreatingUser}>
          <Dialog.Portal>
            <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[300]" />
            <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[400] w-[calc(100%-2rem)] max-w-md rounded-xl bg-white p-6 shadow-2xl overflow-hidden flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <h3 className="text-base font-semibold text-neutral-900">Novo Usuário</h3>
                <button
                  onClick={() => setIsCreatingUser(false)}
                  className="p-1.5 rounded-md text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <CreateUserForm
                isPending={createMutation.isPending}
                onCancel={() => setIsCreatingUser(false)}
                onSubmit={(data) => createMutation.mutate(data)}
              />
            </Dialog.Popup>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </div>
  )
}

interface EditUserFormProps {
  user: IProfile
  isPending: boolean
  onCancel: () => void
  onSubmit: (data: {
    nome: string
    role: Role
    telefone: string | null
    especialidade: string | null
  }) => void
}

function EditUserForm({ user, isPending, onCancel, onSubmit }: EditUserFormProps) {
  const [nome, setNome] = useState(user.nome)
  const [role, setRole] = useState<Role>(user.role as Role)
  const parsedPhone = parseStoredPhone(user.telefone)
  const [phoneDial, setPhoneDial] = useState(parsedPhone.dial)
  const [phoneNumber, setPhoneNumber] = useState(parsedPhone.number)
  const [especialidade, setEspecialidade] = useState(user.especialidade ?? '')

  const inputCls =
    'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors'

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome não pode estar vazio')
      return
    }
    onSubmit({
      nome,
      role,
      telefone: buildStoredPhone(phoneDial, phoneNumber),
      especialidade: role === 'prestador' ? especialidade.trim() || null : null,
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Nome completo</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={inputCls}
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Papel (Nível de Acesso)</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputCls}
        >
          <option value="cliente">Cliente</option>
          <option value="prestador">Prestador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone (opcional)</label>
        <PhoneInput
          dial={phoneDial}
          number={phoneNumber}
          onDialChange={setPhoneDial}
          onNumberChange={setPhoneNumber}
          disabled={isPending}
        />
      </div>

      {role === 'prestador' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Especialidade</label>
          <input
            type="text"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            className={inputCls}
            placeholder="Ex: Hardware, Redes, Suporte"
          />
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isPending} size="sm">
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          Salvar Alterações
        </Button>
      </div>
    </form>
  )
}

interface CreateUserFormProps {
  isPending: boolean
  onCancel: () => void
  onSubmit: (data: {
    email: string
    senha: string
    nome: string
    role: Role
    telefone: string | null
    especialidade: string | null
  }) => void
}

function CreateUserForm({ isPending, onCancel, onSubmit }: CreateUserFormProps) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [role, setRole] = useState<Role>('cliente')
  const [phoneDial, setPhoneDial] = useState('+55')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [especialidade, setEspecialidade] = useState('')

  const inputCls =
    'w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors'

  function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) {
      toast.error('Nome não pode estar vazio')
      return
    }
    if (!email.trim() || !email.includes('@')) {
      toast.error('Insira um e-mail válido')
      return
    }
    if (senha.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres')
      return
    }
    if (senha !== confirmarSenha) {
      toast.error('As senhas não conferem')
      return
    }
    onSubmit({
      nome,
      email,
      senha,
      role,
      telefone: buildStoredPhone(phoneDial, phoneNumber),
      especialidade: role === 'prestador' ? especialidade.trim() || null : null,
    })
  }

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Nome completo</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className={inputCls}
          placeholder="Ex: João da Silva"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          placeholder="joao@exemplo.com"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={inputCls}
            placeholder="Mínimo 8 chars"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Confirmar Senha</label>
          <input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className={inputCls}
            placeholder="Repita a senha"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Papel (Nível de Acesso)</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className={inputCls}
        >
          <option value="cliente">Cliente</option>
          <option value="prestador">Prestador</option>
          <option value="admin">Administrador</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone (opcional)</label>
        <PhoneInput
          dial={phoneDial}
          number={phoneNumber}
          onDialChange={setPhoneDial}
          onNumberChange={setPhoneNumber}
          disabled={isPending}
        />
      </div>

      {role === 'prestador' && (
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">Especialidade</label>
          <input
            type="text"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            className={inputCls}
            placeholder="Ex: Hardware, Redes, Suporte"
            required
          />
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2 border-t border-neutral-100">
        <Button variant="outline" type="button" onClick={onCancel} disabled={isPending} size="sm">
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
          Criar Usuário
        </Button>
      </div>
    </form>
  )
}
