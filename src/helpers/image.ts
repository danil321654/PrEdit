import { AxiosInstance } from 'axios'
import { MAX_SIZE_IMG } from '../constants'

export const dataURItoBlob = (dataURI: string) => {
  const bytes =
    dataURI.split(',')[0].indexOf('base64') >= 0
      ? atob(dataURI.split(',')[1])
      : unescape(dataURI.split(',')[1])
  const mime = dataURI.split(',')[0].split(':')[1].split(';')[0]
  const max = bytes.length
  const codesArray = new Uint8Array(max)
  for (let i = 0; i < max; i++) {
    codesArray[i] = bytes.charCodeAt(i)
  }
  return new Blob([codesArray], { type: mime })
}

export function isBase64Image(str: string | undefined) {
  return !!str?.startsWith('data:')
}

export const convertToValidSize = (width: number, height: number) => {
  let fixedWidth = width
  let fixedHeight = height
  if (fixedWidth > MAX_SIZE_IMG.WIDTH) {
    fixedWidth = MAX_SIZE_IMG.WIDTH
    fixedHeight = (fixedWidth / width) * height
  }
  return {
    fixedWidth: Math.round(fixedWidth),
    fixedHeight: Math.round(fixedHeight),
  }
}

export const resizeImage = (file: File): Promise<Blob> => {
  const { type: mimeType } = file
  const reader = new FileReader()
  const image = new Image()
  const canvas = document.createElement('canvas')

  const resize = () => {
    const width = image.width
    const height = image.height
    if (width < MAX_SIZE_IMG.WIDTH && height < MAX_SIZE_IMG.HEIGHT) return file

    const { fixedWidth, fixedHeight } = convertToValidSize(width, height)
    canvas.width = fixedWidth
    canvas.height = fixedHeight
    canvas.getContext('2d')?.drawImage(image, 0, 0, fixedWidth, fixedHeight)
    const dataUrl = canvas.toDataURL(mimeType)
    const resizedFile = dataURItoBlob(dataUrl)
    return resizedFile.size < file.size ? resizedFile : file
  }

  return new Promise((res, rej) => {
    if (!mimeType.match(/image.*/)) {
      rej(new Error('Not an image'))
      return
    }

    reader.onload = (readerEvent: any) => {
      image.onload = () => res(resize())
      image.src = readerEvent.target.result
    }
    reader.readAsDataURL(file)
  })
}

export const convertToValidFileName = (fileName: string) =>
  fileName.replace(/[^a-zA-Zа-яА-ЯёЁ_:?"'.,№\-\d\s]+/g, '_')

export async function toDataURL(
  url: string,
  apiClient: AxiosInstance,
  width?: number,
  height?: number
) {
  const urlForApiClient = url.replace('/gateway', '')
  if (isBase64Image(urlForApiClient)) {
    return urlForApiClient
  }
  const response = await apiClient.get<Blob>(urlForApiClient, {
    withCredentials: true,
    responseType: 'blob',
  })
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const imageSrc = (reader.result as string).replace(
        'application/octet-stream',
        'image/png'
      )

      // Изменяет размер картинки и обрабатывает прозрачные изображения
      if (width && height) {
        const image = new Image()
        image.src = imageSrc
        image.onload = () => {
          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          ctx?.drawImage(image, 0, 0, canvas.width, canvas.height)

          // Set all black pixels in trasnparent image to white
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          if (imageData) {
            const data = imageData.data

            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] === 0) {
                data[i] = 255
                data[i + 1] = 255
                data[i + 2] = 255
                data[i + 3] = 255
              }
            }

            ctx?.putImageData(imageData, 0, 0)
          }

          const base64 = canvas.toDataURL('image/png')
          res(base64)
        }
      } else {
        res(imageSrc)
      }
    }
    reader.onerror = rej
    reader.readAsDataURL(response.data)
  })
}

export async function replaceAsync(
  str: string,
  regex: RegExp,
  asyncFn: (arg0: string, ...args: any[]) => any
) {
  const promises: Array<Promise<string>> = []
  str.replace(regex, (match, ...args: any[]): any => {
    const promise = asyncFn(match, ...args)
    promises.push(promise)
  })
  const data = await Promise.all(promises)
  return str.replace(regex, () => data.shift() as string)
}
