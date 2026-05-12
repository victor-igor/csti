export default function DashboardPreview() {
  const navItems = ['Dashboard', 'Solicitações', 'Orçamentos', 'Ordens de Serviço']

  return (
    <div className="flex h-full w-full pointer-events-none select-none overflow-hidden text-neutral-400">
      {/* Sidebar */}
      <div className="w-60 shrink-0 bg-white border-r border-neutral-100 flex flex-col py-4 px-3 gap-2">
        <div className="px-2 mb-4">
          <img src="/logo+texto.png" alt="" className="h-8 w-auto opacity-80" />
        </div>
        {navItems.map((item, i) => (
          <div
            key={item}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${i === 0 ? 'bg-violet-50 text-violet-700 font-medium' : 'text-neutral-500'}`}
          >
            <div className="h-4 w-4 rounded bg-current opacity-40" />
            {item}
          </div>
        ))}
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col bg-neutral-50">
        {/* TopBar */}
        <div className="h-14 bg-white border-b border-neutral-100 flex items-center px-6 gap-4">
          <div className="flex-1 h-8 rounded-lg bg-neutral-100" />
          <div className="h-8 w-8 rounded-full bg-violet-200" />
          <div className="h-8 w-8 rounded-full bg-neutral-200" />
          <div className="h-8 w-8 rounded-full bg-neutral-300" />
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-hidden">
          {/* Header */}
          <div className="mb-6">
            <div className="h-7 w-48 rounded bg-neutral-200 mb-2" />
            <div className="h-4 w-32 rounded bg-neutral-100" />
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-5 border border-neutral-100 shadow-sm">
                <div className="h-3 w-24 rounded bg-neutral-100 mb-3" />
                <div className="h-8 w-16 rounded bg-neutral-200 mb-1" />
                <div className="h-3 w-20 rounded bg-neutral-100" />
              </div>
            ))}
          </div>

          {/* Two column sections */}
          <div className="grid grid-cols-2 gap-4">
            {/* Attention section */}
            <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 rounded bg-amber-200" />
                <div className="h-4 w-32 rounded bg-neutral-200" />
              </div>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <div className="h-8 w-8 rounded-lg bg-neutral-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-full rounded bg-neutral-100 mb-1" />
                    <div className="h-3 w-2/3 rounded bg-neutral-100" />
                  </div>
                  <div className="h-5 w-16 rounded-full bg-amber-100" />
                </div>
              ))}
            </div>

            {/* Recent activity */}
            <div className="bg-white rounded-xl p-5 border border-neutral-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-4 w-4 rounded bg-neutral-200" />
                <div className="h-4 w-36 rounded bg-neutral-200" />
              </div>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                  <div className="h-8 w-8 rounded-full bg-violet-100 shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-3/4 rounded bg-neutral-100 mb-1" />
                    <div className="h-3 w-1/2 rounded bg-neutral-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
