import type { LucideIcon } from 'lucide-react'
import { MoreHorizontal } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export interface OverflowAction {
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'destructive'
  disabled?: boolean
  separator?: boolean // adds a separator BEFORE this item
  onClick: () => void
}

interface OverflowMenuProps {
  actions: OverflowAction[]
  /** Align dropdown to end of trigger (default) or start */
  align?: 'start' | 'end'
}

export function OverflowMenu({ actions, align = 'end' }: OverflowMenuProps) {
  if (actions.length === 0) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Mais ações"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <MoreHorizontal className="h-4 w-4" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} side="bottom" sideOffset={4} className="min-w-[180px]">
        {actions.map((action, i) => (
          <span key={i}>
            {action.separator && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={action.variant === 'destructive' ? 'destructive' : 'default'}
              disabled={action.disabled}
              onClick={action.onClick}
              className="cursor-pointer"
            >
              {action.icon && <action.icon className="h-4 w-4 shrink-0" />}
              {action.label}
            </DropdownMenuItem>
          </span>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
