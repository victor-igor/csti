interface UserCardProps {
  name: string
  role: string
  avatarUrl?: string
}

export function UserCard({ name, role, avatarUrl }: UserCardProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} className="h-9 w-9 rounded-full object-cover" />
      ) : (
        <div className="h-9 w-9 rounded-full bg-primary-light flex items-center justify-center text-sm font-medium text-primary">
          {initials}
        </div>
      )}
      <div className="flex flex-col">
        <span className="text-sm font-medium text-neutral-800">{name}</span>
        <span className="text-xs text-neutral-500 capitalize">{role}</span>
      </div>
    </div>
  )
}
