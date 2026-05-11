import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { BottomNav } from './BottomNav'
import { useSidebar } from '@/hooks/useSidebar'

export function AppShell() {
  const isExpanded = useSidebar((s) => s.isExpanded)

  return (
    <div className="min-h-screen bg-neutral-50">
      <Sidebar />
      <TopBar />

      <main
        className={cn(
          'pt-16 pb-20 md:pb-6 min-h-screen transition-all duration-200',
          isExpanded ? 'md:ml-[240px]' : 'md:ml-[64px]',
        )}
      >
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
