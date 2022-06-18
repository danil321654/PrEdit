import { flow } from 'lodash-es'
import { AxiosInstance } from 'axios'
import { addColWidths, replaceAllMatches } from './common'
import {
  htmlToString,
  replaceAsync,
  stringToHtml,
  toDataURL,
} from '../../helpers'

const convertSizeStyles =
  (
    styleType: 'cm' | 'pt' | 'in',
    convertExpression: (input: number) => number,
  ) =>
  (html: string) =>
    replaceAllMatches(
      html,
      new RegExp(`:\\s{0,1}([.\\d+]+)${styleType}`),
      (resHtml, match) =>
        resHtml.replace(match[0], `:${convertExpression(+match[1])}px`),
    )

/* 
  TO DO: завести задачу на бэк, нужно в рамках процесса перевода стилей из классовых в inline 
  также заменять размеры в дюймах, сантиметрах и пунктах на равнозначные в пикселях. PdfMake не воспринимает размеры в дюймах, сантиметрах и пунктах и крашится.
  Если изменения появятся на бэке, то убрать этот обработчик.
*/
export const fixHTMLwithWordStyles = (html: string) => {
  const htmlWithFixedTablesStyle = replaceAllMatches(
    html,
    /width:([.\d+]+)in;[\s]*\"/,
    (resHtml, match) =>
      resHtml.replace(
        match[0],
        `width:${+match[1] * 96}px;" colwidth="${+match[1] * 96}" width="${
          +match[1] * 96
        }"`,
      ),
  )

  return flow(
    convertSizeStyles('in', size => +(size * 96).toFixed(2)),
    convertSizeStyles('cm', size => +(size * 37.795276).toFixed(2)),
    convertSizeStyles('pt', size => +((size * 4) / 3).toFixed(2)),
  )(htmlWithFixedTablesStyle)
}

// Обрабатывает случай, когда есть rowspan > 1 на всю строку (pdfmake в таких случаях крашится)
export const handleRowSpannedTables = (html: string) =>
  replaceAllMatches(
    html,
    /<tr><td colspan="[^"]*" rowspan="([^"]*)" colwidth="[^"]*">((?!<td).)*<\/td><\/tr>/,
    (resHTML, nextMatch) =>
      resHTML.replace(
        nextMatch[0],
        nextMatch[0].replace(/rowspan="[^"]*"/g, 'rowspan="1"'),
      ),
  ).replace(/<tr[^<>]*><\/tr>/g, '')

/* Удаляет пустые стили для размера шрифта (pdfmake в таких случаях крашится) */
export const removeEmptyFontSizeStyles = (html: string) =>
  html.replace(/font-size: unset;/g, '')

export const removeLineHeightStyles = (html: string) =>
  html
    .replace(/line-height: \s{0,1}null;{0,1}/g, '')
    .replace(/line-height:\s{0,1}"[0-9a-z]*";{0,1}/g, '')
    .replace(/line-height:[^;]*%[^;"]*;{0,1}/g, '')
/**/

/* Добавляет значения для ширины колонок в таблицах в необходимом формате */
/* Для pdf */
export const addColWidthsForPdf = (html: string) =>
  addColWidths(html, htmlArg =>
    htmlArg
      .split(',')
      .map(width => +width / 2)
      .join(','),
  )
/* Удаляет лишний HTML и стили 
    TO DO: по идее тоже должен делать бэк */
export const removeRedundantHTMLaddedByWord = (html: string) => {
  const tempDoc = stringToHtml(html)

  tempDoc.querySelectorAll('p').forEach(p => {
    const { lineHeight, textAlign, fontSize, fontFamily } = p.style
    p.removeAttribute('style')
    p.style.textAlign = textAlign
    p.style.lineHeight = lineHeight
    p.style.fontSize = fontSize
    p.style.fontFamily = fontFamily
  })
  tempDoc.querySelectorAll('a[id]').forEach(elementWithId => {
    const fragment = document.createDocumentFragment()
    while (elementWithId.firstChild) {
      fragment.appendChild(elementWithId.firstChild)
    }
    elementWithId.parentNode?.replaceChild(fragment, elementWithId)
  })
  tempDoc.querySelectorAll('table').forEach(table => {
    const colgroup = Array.from(
      table.querySelector('colgroup')?.querySelectorAll('col') ?? [],
    ).map(col => col.getAttribute('width') ?? '0')
    if (colgroup) {
      table.querySelectorAll('tr').forEach(row => {
        let i = 0
        row.querySelectorAll('td').forEach(cell => {
          if (cell.style.width) {
            cell.removeAttribute('style')
            const width = colgroup.slice(i, i + cell.colSpan).join(',')
            cell.setAttribute('width', width)
          }
          i += cell.colSpan
        })
      })
    }
  })
  tempDoc.querySelectorAll('span').forEach(span => {
    span.style.lineHeight = ''
  })

  return htmlToString(tempDoc)
}

/* Удаляет непереведённые в base64 картинки*/
export const removeUnloadedImages = (html: string) =>
  html.replace(/<img[^<>]*https{0,1}:\/\/[^<>]*>/g, '')

export const convertImagesToBase64PDF =
  (apiClient: AxiosInstance) => async (html: string) =>
    await replaceAsync(
      html,
      /<img src="([^"]*)"/gm,
      async (_, ...args: Array<string>) => {
        const base64_l = await toDataURL(args[0], apiClient)
        return args[0].includes('/') ? `<img src="${base64_l}"` : ''
      },
    )
