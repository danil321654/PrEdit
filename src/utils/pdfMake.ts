/* eslint-disable max-lines */
import htmlToPdfmake from 'html-to-pdfmake'
import { v4 as uuid } from 'uuid'
import { pdfMake } from '../pdfMake'
import { AxiosInstance } from 'axios'
import { cloneDeep } from 'lodash-es'
import { PDFNode, PdfTable } from '../types'
import { RGBToHex, flowAsync } from '../helpers'
import { prepareHTMLForPdfExport } from './html'
import { makeImagesInline } from './pdfMakeImage'
import { fonts, TABLE_MAX_WIDTH } from '../constants'
import { addVerticalAlign } from './pdfMakeVerticalAlign'
import {
  Content,
  StyleDictionary,
  TDocumentDefinitions,
  ContentText,
} from 'pdfmake/interfaces'

const addIdToNodes = (node: PDFNode) => {
  node.stack?.forEach(child => addIdToNodes(child))
  node.columns?.forEach(child => addIdToNodes(child))

  if (node.text && typeof node.text !== 'string')
    node.text.forEach(child => addIdToNodes(child))

  node.id = uuid()
}

// Рекурсивно ищет ноду по id
const findNodeById = (node: PDFNode, id: string): PDFNode | undefined => {
  if (node.id === id) return node

  let children: (PDFNode | undefined)[] = []

  // Примечание: У ноды не может одновременно быть и stack и columns
  if (node.stack) children = node.stack.map(child => findNodeById(child, id))
  if (node.columns)
    children = node.columns.map(child => findNodeById(child, id))

  const value = children.find(item => item)

  return value
}

// Рекурсивно копирует атрибуты в дереве нод
const copyNodeAttrs = (from: PDFNode, to: PDFNode) => {
  if (!from.id) return

  const copyNode = findNodeById(to, from.id)
  if (!copyNode) return

  if ('stack' in copyNode) {
    copyNode.columns = copyNode.stack
    delete copyNode.stack
  }

  copyNode._maxWidth = from._maxWidth
  copyNode.width = from.width
  copyNode.alignment = from.alignment
  copyNode.height = from.height
  copyNode.margin = from.margin
  copyNode.lineHeight = from.lineHeight

  if (from.columns) {
    from.columns.forEach(node => copyNodeAttrs(node, to))
  }
}

const pdfTableWidth = 460

export const htmlToContent = (html: string) =>
  htmlToPdfmake(html, {
    tableAutoSize: true,
    /* Обрабатывает тэг mark, без этой функции фоновый цвет будет перекрывать текст */
    customTag: function (params: Record<string, any>) {
      const ret = params.ret
      const parents = params.parents
      if (ret.nodeName === 'MARK') {
        if (ret?.color === 'inherit') {
          let colorParent: string = parents[parents.length - 1]?.style?.color
          if (colorParent.includes('rgb')) colorParent = RGBToHex(colorParent)
          ret.color = colorParent ?? 'inherit'
        }
      }
      return ret
    },
  } as any) as Content[]

const fixTables = (content: Content[]) => {
  return content.map(node => {
    if (typeof node === 'string' || !('table' in node)) {
      return node
    }
    const table = node.table as PdfTable
    const isWidthsDefined =
      table.widths?.length &&
      table.body[0].length <= table.widths?.length &&
      Array.isArray(table.widths) &&
      table.widths.every(
        width => width !== 'auto' && width !== '*' && Boolean(width),
      )
    /* Проставляет размер колонкам таблицы */
    table.widths = [
      ...(table.body[0] || [])
        .filter((col, i) =>
          isWidthsDefined ? table.widths?.[i] : (col as any).width,
        )
        .map((col, i) =>
          isWidthsDefined ? table.widths?.[i] : (col as any).width,
        )
        .map(col => {
          if (String(col).includes(',')) {
            return String(col)
              .split(',')
              .map(
                strWidth =>
                  (parseFloat(strWidth) * pdfTableWidth) / TABLE_MAX_WIDTH,
              )
          }
          return col
        })
        .flat(1),
    ]
    const widths = table.widths as number[]
    const totalWidth = widths.reduce((sum, nextWidth) => sum + +nextWidth, 0)
    /* Растягивает пропорционально таблицу в ширину на всю страницу pdf документа */
    if (totalWidth !== pdfTableWidth) {
      table.widths = widths.map(el => el / (totalWidth / pdfTableWidth))
    }
    table.widths = table.widths.map(
      el => +el + ((6 - widths.length) * 9) / widths.length,
    )
    table.body = table.body.map(row => {
      if (
        'stack' in row[0] &&
        typeof row[0].stack[0] !== 'string' &&
        'text' in row[0].stack[0] &&
        !(row[0].stack[0].text as any)?.length
      ) {
        row[0].stack[0].text = ' '
      }

      /* Удаляет лишние колонки 
      TO DO: поправить, так как иногда удаляются нужные, понять почему в массиве widths значений меньше чем колонок */
      const columnsCount = table.widths?.length
      if (columnsCount && row.length > columnsCount) {
        row = row.slice(0, columnsCount)
        row.forEach((cell, i) => {
          if (cell?.colSpan && cell.colSpan + i > columnsCount) {
            cell.colSpan = columnsCount - i
          }
        })
      }
      row.forEach(cell => {
        if (
          cell?.stack &&
          (cell.stack.length > 1 ||
            (cell.stack.length === 1 && (cell.stack[0] as ContentText).text))
        ) {
          cell.stack.push({
            text: ' ',
            nodeName: 'P',
          } as Content)
        }
        if (cell.borderColor) {
          cell.borderColor = new Array(4).fill(String(cell.borderColor)) as any
        }
      })

      return row
    })

    const firstRowSpan = Math.max(
      ...table.body[0].map(cell => cell.rowSpan ?? 0),
    )
    table.body = [...table.body, ...table.body.slice(0, firstRowSpan)]

    /* Устанавлиивает строкам таблицы минимальную высоту */
    if (Array.isArray(table.heights) && table.heights.length) {
      table.heights = new Array(table.heights.length + firstRowSpan).fill(40)
    }
    return { ...node, table }
  })
}
/* Заменяет шрифты, которых нет среди установленных, на дефолтный */
export const fixFonts = (content: Content[]) =>
  JSON.parse(
    JSON.stringify(content).replace(
      /"font":"([^"]*)"/g,
      (_fullMatch, fontFamily) =>
        `"font":"${
          fonts.map(font => font.replace(/\s/g, '')).includes(fontFamily)
            ? fontFamily
            : 'Roboto'
        }"`,
    ),
  )
/* Меняет шрифт у символов, которые не отображаются в текщем шрифте */
const fontsNonUnicode = ['Roboto', 'Verdana']
const fixUnsupportedUnicodeSymbols = (content: any): any => {
  if (Array.isArray(content)) {
    return content.map(item => fixUnsupportedUnicodeSymbols(item as Content[]))
  }
  if (content && typeof content === 'object') {
    const newObj: any = {}
    Object.keys(content).forEach(key => {
      const valTemp = fixUnsupportedUnicodeSymbols(content[key])
      if (
        key === 'text' &&
        typeof valTemp === 'string' &&
        valTemp.match(/(\p{S})/u) &&
        fontsNonUnicode.includes(content?.font)
      ) {
        const strSplited = valTemp.split(/(\p{S})/u)
        const newVal = strSplited.map(value => ({
          ...content,
          text: value,
          font: value.match(/(\p{S})/u) ? 'Arial' : content.font, // шрифт который отражает символ в юникоде из тех что имеется
        }))
        newObj[key] = newVal
      } else newObj[key] = fixUnsupportedUnicodeSymbols(content[key])
    })
    return newObj
  }
  return content
}

/* Функция, которая рекурсивно ищет текстовые ноды и вставляет текст в начало */
const setNestedText = (contentObject: Record<string, any>, value: string) => {
  const valueType = typeof contentObject?.[0]?.['text']
  if (valueType === 'string') {
    contentObject[0]['text'] = value + contentObject[0]['text']
  }
  if (valueType === 'object') {
    setNestedText(contentObject[0]['text'], value)
  }
}

/* Переносит маркер списка внутрь текста, чтобы сохранить форматирование */
const fixLists = (content: PDFNode[]) =>
  content.map((node: PDFNode) => {
    if (node.ol) {
      node.ol.forEach((li: any, i: number) => {
        if (li?.stack?.[0]?.text?.[0]?.text) {
          li.listType = 'none'
          setNestedText(li.stack, `${i + 1}. `)
        }
      })
    }
    if (node.ul) {
      node.ul.forEach((li: any) => {
        if (li?.stack?.[0]?.text?.[0]?.text) {
          li.listType = 'none'
          setNestedText(li.stack, '• ')
        }
      })
    }
    return node as Content
  })

/* Функция, которая всем нодам добавляет id */
const addIds = (content: PDFNode[]) => {
  content.forEach(node => addIdToNodes(node))
  return content
}

/* Функция, которая создает конфигурацию для создания pdf */
const createDocumentDefinition = (content: Content) => {
  const documentStyles: StyleDictionary = {
    'html-th': { margin: [2, 5, 2, 5] },
    'html-td': { margin: [2, 5, 2, 5] },
    'html-li': { margin: [-15, 0, 0, 0] },
    T1: { decoration: 'underline' },
  }
  return {
    content,
    styles: documentStyles,
    defaultStyle: {
      preserveLeadingSpaces: true,
    },
  }
}

const populateWithAttrsAndCreatePDF = (
  documentDefinition: TDocumentDefinitions,
) => {
  const contentCopy = cloneDeep(documentDefinition.content) as PDFNode[]
  // Предварительно генерирует pdf, чтобы библиотека проставила _maxWidth нодам
  const pdf = pdfMake.createPdf(documentDefinition)
  pdf.getStream()

  // Делаем картинки inline
  makeImagesInline(documentDefinition.content as PDFNode[])

  // Переносим все атрибуты, которые проставляли на предыдущем шаге, на копию разметки
  contentCopy.forEach((node, index) =>
    copyNodeAttrs((documentDefinition.content as PDFNode[])[index], node),
  )

  addVerticalAlign(contentCopy, documentDefinition.content as PDFNode[])

  return pdfMake.createPdf({
    ...documentDefinition,
    content: contentCopy as Content,
  })
}

/* Функция, которая проходит по всем таблицам в шаблоне и меняет ячейкам colspan и rowspan */
const fixRowColSpan = (html: string) => {
  const parser = new DOMParser()
  const serializer = new XMLSerializer()
  const dom = parser.parseFromString(html, 'text/html')
  const tables = dom.querySelectorAll('table')

  tables.forEach(table => {
    const rows = table.querySelectorAll('tr')

    // Если в таблице 1 строка, то выставялет всем ячейкам rowspan = 1
    if (rows.length > 1) return
    const cells = rows[0].querySelectorAll('td')
    cells.forEach(cell => {
      cell.rowSpan = 1
    })

    // Если в строке только 1 столбец, то выставляет colspan = 1
    if (cells.length > 1) return
    cells[0].colSpan = 1

    const cellWidth = cells[0].getAttribute('width')
    if (!cellWidth) return

    // Фиксит ширину ячейки. При соединении ячеек в одну, их width суммируется, а т.к. width - строка, то суммируются строки
    cells[0].setAttribute(
      'width',
      cellWidth
        .split(',')
        .map(width => parseFloat(width))
        .reduce((acc, width) => acc + width)
        .toString(),
    )
  })

  return serializer.serializeToString(dom.body)
}

export const generatePdf = (html: string, apiClient: AxiosInstance) =>
  flowAsync(
    prepareHTMLForPdfExport(apiClient),
    fixRowColSpan,
    htmlToContent,
    fixTables,
    fixFonts,
    fixUnsupportedUnicodeSymbols,
    fixLists,
    addIds,
    createDocumentDefinition,
    populateWithAttrsAndCreatePDF,
  )(html)

export const generatePreview = async (
  html: string,
  apiClient: AxiosInstance,
  cb: (blob: Blob) => void,
) => (await generatePdf(html, apiClient)).getBlob(cb)

export const convertToPdf = async (
  name: string,
  html: string,
  apiClient: AxiosInstance,
) => (await generatePdf(html, apiClient)).download(`${name}.pdf`)
