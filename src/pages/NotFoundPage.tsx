import { Link } from 'react-router-dom'
import { FileQuestion } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-neutral-100">
        <FileQuestion className="h-8 w-8 text-neutral-400" />
      </div>
      <h1 className="text-2xl font-semibold text-neutral-900">Página não encontrada</h1>
      <p className="text-sm text-neutral-500 max-w-xs">
        O endereço que você acessou não existe ou foi movido.
      </p>
      <Link
        to="/dashboard"
        className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
      >
        Voltar ao início
      </Link>
    </div>
  )
}
