import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface BackButtonProps {
  label?: string
  to?: string
}

export function BackButton({ label = 'Voltar', to }: BackButtonProps) {
  const navigate = useNavigate()

  function handleClick() {
    if (to) navigate(to)
    else navigate(-1)
  }

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-sm text-neutral-600 hover:text-primary transition-colors"
    >
      <ChevronLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
