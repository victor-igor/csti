import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'

function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-48 rounded-lg border-2 border-dashed border-neutral-300">
      <p className="text-neutral-500 text-sm">{title} — em breve</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Placeholder title="Dashboard" />} />
          <Route path="solicitacoes" element={<Placeholder title="Solicitações" />} />
          <Route path="orcamentos" element={<Placeholder title="Orçamentos" />} />
          <Route path="ordens-servico" element={<Placeholder title="Ordens de Serviço" />} />
          <Route path="perfil" element={<Placeholder title="Perfil" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
