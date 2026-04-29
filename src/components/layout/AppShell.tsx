import { Outlet } from 'react-router-dom'
import { TopBar } from './TopBar'
import { Sidebar } from './Sidebar'
import { MobileDrawer } from './MobileDrawer'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <TopBar />
      <Sidebar />
      <MobileDrawer />

      <main className="pt-14 pb-16 md:pb-0 md:ml-[64px] lg:ml-[240px] min-h-screen">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}
