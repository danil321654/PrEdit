import { ContentStack, Table, TableCell } from 'pdfmake/interfaces'

export type PDFNodeMargin = [number, number, number, number]

export type PDFNodeAlignment = 'left' | 'right' | 'center' | 'justify'

const verticalAlignAllowed = ['top', 'middle', 'bottom'] as const

export type VerticalAlign = typeof verticalAlignAllowed[number]

export const isVerticalAlign = (value: string) =>
  verticalAlignAllowed.includes(value as VerticalAlign)

export interface PDFNode {
  verticalAlign: VerticalAlign
  id?: string
  columns?: PDFNode[]
  stack?: PDFNode[]
  image?: string
  text?: string | PDFNode[]
  width?: number
  height?: number
  alignment?: PDFNodeAlignment
  fontSize?: number
  margin?: PDFNodeMargin
  _maxWidth?: number
  table?: {
    body: []
  }
  ol?: PDFNode[]
  ul?: PDFNode[]
  float?: string
  lineHeight?: number
}

export interface PDFAttributes {
  width: number | undefined
  height: number | undefined
  alignment: PDFNodeAlignment | undefined
}

export type PdfCell = Exclude<TableCell, Record<string, never>> &
  ContentStack & { verticalAlign?: VerticalAlign }
export type PdfTable = Omit<Table, 'body'> & { body: PdfCell[][] }
