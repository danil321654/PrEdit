export const replaceAllMatches = (
  html: string,
  regExp: RegExp,
  matchReducer: (updatedHTML: string, matchArray: RegExpMatchArray) => string
) => {
  const globalRegExp = new RegExp(regExp, 'g')
  const matches = html.match(globalRegExp) ?? []
  return matches.reduce((resHtml, nextMatch) => {
    const match = nextMatch.match(regExp)
    return match ? matchReducer(resHtml, match) : resHtml
  }, html)
}

// Правит путь для картинок, которые хранятся на нашем бэкенде
export const fixImagesPath = (html: string) =>
  html.replace(/<img src=\"\/print-form/g, '<img src="/gateway/print-form')

/* Добавляет значения для ширины колонок в таблицах в необходимом формате */
export const addColWidths = (
  html: string,
  widthProcessor: (arg0: string) => string
) => {
  const colWidthRegExp = /colwidth="([^\>\"]*)"\>/
  return replaceAllMatches(html, colWidthRegExp, (resHtml, match) =>
    resHtml.replace(
      colWidthRegExp,
      `colwidth="${match[1]}" width="${widthProcessor(match[1])}">`
    )
  )
}

export const fixWordParagraphs = (html: string) => {
  if (!html.includes('<body')) {
    return html
  }
  const tempDoc = document.implementation.createHTMLDocument()
  tempDoc.open()
  tempDoc.write(html.replace(/<p/g, '<p><span').replace(/<\/p/g, '</span></p'))
  tempDoc.querySelectorAll('p').forEach((p) => {
    p.setAttribute('style', p.querySelector('span')?.style.cssText || '')
  })
  tempDoc.querySelectorAll('a[id]').forEach((elementWithId) => {
    const fragment = document.createDocumentFragment()
    while (elementWithId.firstChild) {
      fragment.appendChild(elementWithId.firstChild)
    }
    elementWithId.parentNode?.replaceChild(fragment, elementWithId)
  })
  const resultHTML = tempDoc.querySelector('body')?.innerHTML ?? html
  tempDoc.close()
  return resultHTML
}
