import { DEFAULT_FONT_SIZE, DEFAULT_PDF_INNER_WIDTH } from '../constants'
import {
  PDFAttributes,
  PDFNode,
  PDFNodeAlignment,
  PDFNodeMargin,
} from '../types'

// На основе alignment возвращает margin
const getAlignmentMargin = (
  alignment: PDFNodeAlignment = 'left',
  contentWidth: number
): PDFNodeMargin => {
  switch (alignment) {
    case 'left':
      return [0, 0, 0, 0]
    case 'right':
      return [DEFAULT_PDF_INNER_WIDTH - contentWidth, 0, 0, 0]
    case 'center':
      const horizontalMargin = (DEFAULT_PDF_INNER_WIDTH - contentWidth) / 2
      return [horizontalMargin, 0, horizontalMargin, 0]
    default:
      return [0, 0, 0, 0]
  }
}

// Рекурсивно проходит по всем нодам и возвращает true, если нода - картинка
function findImageNode(node: PDFNode): boolean {
  if (node.stack) {
    const children = node.stack.map((child: PDFNode) => findImageNode(child))
    const value = !!children.find((item) => item)

    return value
  }
  return 'image' in node
}

// Конвертирует все картинки в inline
function convertImagesToInline(
  node: PDFNode,
  isRootNode = false
): PDFAttributes {
  let width = node._maxWidth
  let height = 'image' in node ? node.height : undefined
  if (node.stack) {
    // Проходимся по всем дочерним нодам
    const childrenAttrs = node.stack.map((child: PDFNode) =>
      convertImagesToInline(child)
    )
    // Вычисляем ширину ноды
    width = childrenAttrs.reduce(
      (sum: number, attrs: PDFAttributes) => (sum += attrs.width || 0),
      0
    )

    if (width < DEFAULT_PDF_INNER_WIDTH) {
      // Меняем stack на columns
      node.columns = node.stack.sort((aNode, bNode) => {
        // по флагу float имитация обтекания текстом. в зависимости от флага прижать в начало или конец массива
        // одинокая картинка в тексте обернатая в SPAN
        let aFloat = aNode.columns ? aNode.columns[0]?.float : undefined
        let bFloat = bNode.columns ? bNode.columns[0]?.float : undefined
        if (!aFloat && !bFloat) {
          // картинка в тексте
          aFloat = aNode?.float
          bFloat = bNode?.float
        }
        let a = 5
        let b = 5
        if (aFloat === 'left') a = 1
        else if (aFloat === 'right') a = 10
        if (bFloat === 'left') b = 1
        else if (bFloat === 'right') b = 10

        return a - b
      })
      delete node.stack
      // Вычисляем высоту
      height = childrenAttrs.reduce((result: number, attrs: PDFAttributes) => {
        if (attrs.height) {
          result = result > attrs.height ? result : attrs.height
        }
        return result
      }, 0)

      // Задаем ширину, высоту и ориентацию
      node.width = width
      node.height = height
      node.alignment = childrenAttrs[0].alignment

      // Выставляем отступ у дочерних нод
      node.columns.forEach((child: PDFNode) => {
        if (height) {
          const marginTop =
            height -
            (child.height || 0) -
            (child.text ? child.fontSize || DEFAULT_FONT_SIZE : 0)
          if (child.margin) {
            child.margin[0] = marginTop
            return
          }
          child.margin = [0, marginTop, 0, 0]
        }
      })

      // Выставляем отступ у корневой ноды, чтобы имитировать ориентацию
      if (isRootNode)
        node.margin = getAlignmentMargin(node.alignment, width || 0)
    }
  } else if (node.table) {
    // Обработка картинок в таблицах
    // TODO: Оптимизировать обработку картинок в таблицах (сейчас он проходит по ВСЕМ нодам ЛЮБОГО уровня вложенности)
    // TODO: Решить проблему с ориентацией колонок с картинками (сейчас ориентация не работает корректно)
    const children = node.table.body
    children.forEach((row: []) => {
      row.forEach((col: PDFNode) => {
        const isImage = findImageNode(col)
        if (isImage) {
          convertImagesToInline(col)
        }
      })
    })
  }
  const nodeAttrs: PDFAttributes = {
    width,
    height,
    alignment: node.alignment,
  }
  node.width = width

  return nodeAttrs
}

// Запускает рекурсивную функцию
export function makeImagesInline(content: PDFNode[]) {
  content.forEach((node) => convertImagesToInline(node, true))
  return content
}
