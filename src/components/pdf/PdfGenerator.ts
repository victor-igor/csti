import jsPDF from 'jspdf'
import type { IOrcamento, IItemOrcamento, IProfile } from '@/types/domain'

const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function generateOrcamentoPdf(
  orcamento: IOrcamento,
  itens: IItemOrcamento[],
  prestador: Pick<IProfile, 'nome' | 'especialidade' | 'telefone'>,
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let y = 20

  // Header
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('OrçaFácil', 14, y)
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`Orçamento: ${orcamento.numero}`, 14, y)
  y += 6

  if (prestador.nome) {
    doc.text(`Prestador: ${prestador.nome}`, 14, y)
    y += 6
  }
  if (prestador.especialidade) {
    doc.text(`Especialidade: ${prestador.especialidade}`, 14, y)
    y += 6
  }
  if (prestador.telefone) {
    doc.text(`Telefone: ${prestador.telefone}`, 14, y)
    y += 6
  }
  y += 4

  // Table header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('Descrição', 14, y)
  doc.text('Qtd', 110, y)
  doc.text('Unit.', 130, y)
  doc.text('Total', 165, y)
  y += 2
  doc.line(14, y, pageWidth - 14, y)
  y += 6

  // Table rows
  doc.setFont('helvetica', 'normal')
  let totalGeral = 0
  for (const item of itens) {
    const total = (item.quantidade ?? 0) * (item.valor_unitario ?? 0)
    totalGeral += total
    doc.text(item.descricao ?? '', 14, y)
    doc.text(String(item.quantidade ?? 0), 110, y)
    doc.text(formatter.format(item.valor_unitario ?? 0), 130, y)
    doc.text(formatter.format(total), 165, y)
    y += 7
  }

  // Total line
  y += 2
  doc.line(14, y, pageWidth - 14, y)
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Total Geral:', 130, y)
  doc.text(formatter.format(totalGeral), 165, y)

  // Watermark for status=enviado
  if (orcamento.status === 'enviado') {
    doc.setTextColor(220, 50, 50)
    doc.setFontSize(48)
    doc.setFont('helvetica', 'bold')
    doc.setGState(doc.GState({ opacity: 0.18 }))
    doc.text('PENDENTE DE APROVAÇÃO', pageWidth / 2, doc.internal.pageSize.getHeight() / 2, {
      align: 'center',
      angle: 45,
    })
    doc.setGState(doc.GState({ opacity: 1 }))
  }

  doc.save(`orcamento-${orcamento.numero}.pdf`)
}
