import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  totalPages: number
  onPrev: () => void
  onNext: () => void
}

export function Pagination({ page, totalPages, onPrev, onNext }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between pt-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onPrev}
        disabled={page === 1}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Button>

      <span className="text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={onNext}
        disabled={page === totalPages}
        className="gap-1"
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
