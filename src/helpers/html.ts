export const htmlToString = (html: Document): string => {
  const serializer = new XMLSerializer()

  return serializer.serializeToString(html.body)
}

export const stringToHtml = (str: string): Document => {
  const parser = new DOMParser()

  return parser.parseFromString(str, 'text/html')
}
