import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Edit2, Trash2, Mail, Phone, ShieldAlert, ShieldCheck, UserCheck, Loader2, X, Check, Ban } from 'lucide-react'
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
import { formatDisplayPhone } from '@/lib/phoneUtils'

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

const APROVACAO_BADGE: Record<'pendente' | 'aprovado' | 'recusado', React.ReactNode> = {
  pendente: (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200 animate-pulse">
      Aprovação Pendente
    </span>
  ),
  aprovado: (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 border border-green-200">
      Aprovado
    </span>
  ),
  recusado: (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
      Recusado
    </span>
  ),
}

export default function AdminUsuariosPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [activeRole, setActiveRole] = useState('')
  const [editingUser, setEditingUser] = useState<IProfile | null>(null)
  const [deletingUser, setDeletingUser] = useState<IProfile | null>(null)

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
          status_aprovacao: updated.status_aprovacao,
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

  // 3. Quick Status Change Mutation (Aprovar / Recusar)
  const statusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'aprovado' | 'recusado' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status_aprovacao: status })
        .eq('id', userId)
      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['badge', 'solicitacoes'] })
      toast.success(`Usuário ${variables.status === 'aprovado' ? 'aprovado' : 'recusado'} com sucesso!`)
    },
    onError: (error: Error) => {
      toast.error(parseApiError(error) || 'Erro ao alterar status de aprovação')
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
        subtitle="Analise novos cadastros na fila de aprovação e edite permissões de contas"
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
            const isPending = user.status_aprovacao === 'pendente'
            return (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-card hover:border-primary/50 transition-colors"
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
                      {APROVACAO_BADGE[user.status_aprovacao as 'pendente' | 'aprovado' | 'recusado']}
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
                <div className="flex items-center gap-3 sm:self-center shrink-0">
                  {/* Quick actions for pending */}
                  {isPending && (
                    <div className="flex items-center gap-2 border-r border-border pr-3">
                      <Button
                        size="xs"
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1 h-8 text-[11px]"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ userId: user.id, status: 'aprovado' })}
                      >
                        <Check className="h-3.5 w-3.5" /> Aprovar
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1 h-8 text-[11px]"
                        disabled={statusMutation.isPending}
                        onClick={() => statusMutation.mutate({ userId: user.id, status: 'recusado' })}
                      >
                        <Ban className="h-3.5 w-3.5" /> Recusar
                      </Button>
                    </div>
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
    status_aprovacao: 'pendente' | 'aprovado' | 'recusado'
  }) => void
}

function EditUserForm({ user, isPending, onCancel, onSubmit }: EditUserFormProps) {
  const [nome, setNome] = useState(user.nome)
  const [role, setRole] = useState<Role>(user.role as Role)
  const [telefone, setTelefone] = useState(user.telefone ? formatDisplayPhone(user.telefone) : '')
  const [especialidade, setEspecialidade] = useState(user.especialidade ?? '')
  const [statusAprovacao, setStatusAprovacao] = useState<'pendente' | 'aprovado' | 'recusado'>(
    (user.status_aprovacao as 'pendente' | 'aprovado' | 'recusado') ?? 'pendente'
  )

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
      telefone: telefone.trim() ? telefone.replace(/\D/g, '') : null,
      especialidade: role === 'prestador' ? especialidade.trim() || null : null,
      status_aprovacao: statusAprovacao,
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

      <div className="grid grid-cols-2 gap-4">
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
          <label className="block text-xs font-medium text-neutral-500 mb-1">Status de Aprovação</label>
          <select
            value={statusAprovacao}
            onChange={(e) => setStatusAprovacao(e.target.value as 'pendente' | 'aprovado' | 'recusado')}
            className={inputCls}
          >
            <option value="pendente">Pendente</option>
            <option value="aprovado">Aprovado</option>
            <option value="recusado">Recusado</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-neutral-500 mb-1">Telefone (opcional)</label>
        <input
          type="text"
          value={telefone}
          onChange={(e) => setTelefone(e.target.value)}
          className={inputCls}
          placeholder="+55 11 99999-9999"
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
