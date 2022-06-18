import { AxiosInstance } from 'axios'
import { addColWidths } from './common'
import {
  isBase64Image,
  replaceAsync,
  stringToHtml,
  htmlToString,
  toDataURL,
} from '../../helpers'

/* Заменяет <mark> на <span>, так как Word их игнорирует */
export const replaceMarkTagsWithSpans = (html: string) =>
  html.replace(/<mark/g, '<span').replace(/\/mark>/g, '/span>')

export const addExtraHTMLforWord = (html: string) =>
  "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body><pre>" +
  html +
  '</pre></body></html>'

// Меняет стиль маркеров нумерованного списка для doc
export const fixDocLists = (html: string) => {
  const dom = stringToHtml(html)
  const lis = dom.querySelectorAll<HTMLLIElement>('li')

  lis.forEach((li) => {
    const spanWithStyles = li.querySelector<HTMLLIElement>('span')

    if (spanWithStyles) {
      li.setAttribute('style', spanWithStyles.style.cssText)
      li.querySelector<HTMLParagraphElement>('p')?.removeAttribute('style')
    }
  })

  return htmlToString(dom)
}

/* Добавляет значения для ширины колонок в таблицах в необходимом формате */
/* Для doc */
export const addColWidthsForDoc = (html: string) =>
  addColWidths(html, (htmlArg) =>
    htmlArg
      .split(',')
      .reduce((sum, nextWidth) => sum + +nextWidth, 0)
      .toFixed(0)
  )

/* Скачивает и конвертирует картинки в формат base64, чтобы они отображались в экспортированном документе */
export const convertImagesToBase64DOC =
  (apiClient: AxiosInstance) => async (html: string) =>
    await replaceAsync(
      html,
      /<img\s+src="([^"]+)"\s+width="([^"]+)"\s+height="([^"]+)"/gm,
      async (match: string, ...args: Array<string>) => {
        if (isBase64Image(args[0])) {
          return match
        }

        const base64_l = await toDataURL(
          args[0],
          apiClient,
          args[1] ? parseInt(args[1]) : undefined,
          args[2] ? parseInt(args[2]) : undefined
        )
        return args[0].includes('/') ? `<img src="${base64_l}"` : ''
      }
    )
