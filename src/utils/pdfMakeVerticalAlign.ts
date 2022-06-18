import { cloneDeep } from 'lodash-es'
import { PDFNode, PdfTable } from '../types'
import { Content, ContentText } from 'pdfmake/interfaces'

export function addVerticalAlign(
  content: PDFNode[],
  contentWithSizes: PDFNode[],
) {
  const populatedContent = cloneDeep(contentWithSizes) as Content[]

  content.forEach((node, index) => {
    if (typeof node === 'string' || !('table' in node)) {
      return node
    }
    const table = node.table as PdfTable

    const tableBodyWithHeights = (populatedContent[index] as any).table.body
    const heights: number[] = []
    const rowsWithExtraSpans: number[] = []
    table.body.forEach((row, rowIndex) => {
      if (
        rowIndex < table.body.length - 1 &&
        tableBodyWithHeights[rowIndex + 1]?.[0]?.positions?.[0] &&
        tableBodyWithHeights[rowIndex]?.[0]?.positions?.[0]
      ) {
        heights.push(
          tableBodyWithHeights[rowIndex + 1][0].positions[0].top -
            tableBodyWithHeights[rowIndex][0].positions[0].top,
        )
      }
    })
    table.body.forEach((row, rowIndex) => {
      if (
        rowIndex < table.body.length - 1 &&
        tableBodyWithHeights[rowIndex + 1]?.[0]?.positions?.[0] &&
        tableBodyWithHeights[rowIndex]?.[0]?.positions?.[0]
      ) {
        const rowWithHeights = tableBodyWithHeights[rowIndex]
        row.forEach((cell, cellIndex) => {
          if (
            cell.stack?.some(
              (stackEl: any) =>
                (Array.isArray(stackEl?.text) &&
                  stackEl?.text.some(
                    (textEl: ContentText) =>
                      typeof textEl.text === 'string' && textEl.text?.trim(),
                  )) ||
                (typeof stackEl?.text === 'string' &&
                  stackEl.text.trim().length),
            )
          ) {
            rowsWithExtraSpans.push(rowIndex)

            if (
              typeof cell.stack?.[0] !== 'string' &&
              !Array.isArray(cell.stack?.[0]) &&
              cell.stack?.[0]?.margin
            ) {
              const cellPositions = rowWithHeights[cellIndex].positions

              const cellHeight =
                cellPositions[rowWithHeights[cellIndex].positions.length - 1]
                  .top - cellPositions[0].top
              cell.stack[0].margin = [0, 5, 0, 5]

              const rowSpan = cell.rowSpan ?? 1

              const rowSpannedHeight =
                heights
                  .slice(rowIndex, rowIndex + rowSpan)
                  .reduce(
                    (totalHeight, nextRowHeight) => totalHeight + nextRowHeight,
                    0,
                  ) +
                10 * (rowSpan - 1)

              if (cell.verticalAlign === 'bottom') {
                cell.stack[0].margin[1] = rowSpannedHeight - cellHeight - 25
              }
              if (cell.verticalAlign === 'middle') {
                cell.stack[0].margin[1] =
                  (rowSpannedHeight - cellHeight - 25) / 2
              }
              cell.stack[0].margin[3] = 5
            }
          }
        })
        row.forEach(cell => {
          if (Array.isArray(cell.stack)) {
            cell.stack = cell.stack.slice(0, cell.stack.length - 1)
          }
        })
      }
    })
    const firstRowSpan = Math.max(
      ...table.body[0].map(cell => cell.rowSpan ?? 0),
    )
    table.body = table?.body.slice(0, table?.body.length - firstRowSpan)
    table.heights = heights.fill(40).slice(0, table.body.length)
    return { ...node, table }
  })
}
