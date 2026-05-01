import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateOrcamentoPdf } from './PdfGenerator'
import type { IOrcamento, IItemOrcamento, IProfile } from '@/types/domain'

interface PdfDownloadButtonProps {
  orcamento: IOrcamento
  itens: IItemOrcamento[]
  prestador: Pick<IProfile, 'nome' | 'especialidade' | 'telefone'>
}

export function PdfDownloadButton({ orcamento, itens, prestador }: PdfDownloadButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => generateOrcamentoPdf(orcamento, itens, prestador)}
    >
      <Download className="size-4" />
      Baixar PDF
    </Button>
  )
}
