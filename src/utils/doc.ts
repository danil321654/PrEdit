import { get } from 'lodash-es'
import { AxiosInstance } from 'axios'
import { prepareHTMLForDocExport } from './html'

export async function convertToDoc(
  name: string,
  html: string,
  apiClient: AxiosInstance,
) {
  const newHTML = await prepareHTMLForDocExport(apiClient)(html)

  const blob = new Blob(['\ufeff', newHTML], {
    type: 'application/msword',
  })

  // Specify link url
  const url = `data:application/vnd.ms-word;charset=utf-8,${encodeURIComponent(
    newHTML,
  )}`

  // Specify file name
  const filename = name ? `${name}.doc` : 'document.doc'

  // Create download link element
  const downloadLink = document.createElement('a')

  document.body.appendChild(downloadLink)

  const nav = window.navigator

  const msSaveOrOpenBlob = get(nav, 'msSaveOrOpenBlob')

  if (msSaveOrOpenBlob) {
    msSaveOrOpenBlob(blob, filename)
  } else {
    // Create a link to the file
    downloadLink.href = url

    // Setting the file name
    downloadLink.download = filename

    // triggering the function
    downloadLink.click()
  }

  document.body.removeChild(downloadLink)
}
