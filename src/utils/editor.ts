import { Editor } from '@tiptap/core'
import { ImageParams } from '../records'
import { Slice } from 'prosemirror-model'
import { JSONContent } from '@tiptap/react'
import { prepareHTMLForPrint } from './html'
import { EditorState } from 'prosemirror-state'
import { AxiosInstance, AxiosResponse } from 'axios'
import { findParentNodeOfType } from 'prosemirror-utils'
import { convertToValidFileName, resizeImage } from '../helpers'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_STYLE,
  fonts,
  HEADING_FONT_SIZES,
} from '../constants'

declare type Level = 1 | 2 | 3 | 4 | 5 | 6

export function setParagraph(editor: Editor) {
  editor.chain().focus().setParagraph().run()
}

export const setHeading = (level: Level) => (editor: Editor) => {
  editor.chain().focus().setHeading({ level }).run()
}

export const wordUnitsToPx = (sizeUnit: number) => (sizeUnit / 0.75).toFixed(2)

export const pxToWordUnits = (sizePx: number) => Math.round(sizePx * 0.75)

export const getHeadingFontSize = (level: number) => {
  if (level >= HEADING_FONT_SIZES.length) {
    return DEFAULT_FONT_SIZE
  }

  return HEADING_FONT_SIZES[level]
}

export const editorHeading = {
  p: setParagraph,
  H1: setHeading(1),
  H2: setHeading(2),
  H3: setHeading(3),
  H4: setHeading(4),
  H5: setHeading(5),
  H6: setHeading(6),
}

export function compareLineHeight(editor: Editor, lineHeight: number) {
  const { lineHeight: currentLineHeight } = editor.getAttributes('paragraph')

  if (!parseFloat(currentLineHeight))
    return lineHeight === DEFAULT_STYLE.lineHeight

  return lineHeight === parseFloat(currentLineHeight)
}

function findHeading(state: EditorState) {
  const { heading } = state.schema.nodes
  return findParentNodeOfType(heading)(state.selection)
}

export function isHeadingActive(state: EditorState, level: number) {
  const result = findHeading(state)

  if (level === null) {
    return !!result
  }

  return !!(result?.node?.attrs?.level === level)
}

export function getHeadingLevel(state: EditorState): number {
  const result = findHeading(state)

  return result?.node?.attrs?.level ?? 0
}

export const printDocument = async (
  html: string,
  printDocumentTitle: string
) => {
  const iframeForPrint = document.createElement('iframe')
  iframeForPrint.style.width = '640px'
  iframeForPrint.style.height = '0px'
  iframeForPrint.style.visibility = 'hidden'
  document.body.appendChild(iframeForPrint)

  iframeForPrint.onload = async () => {
    if (iframeForPrint.contentDocument && iframeForPrint.contentWindow) {
      iframeForPrint.contentDocument.body.innerHTML = prepareHTMLForPrint(html)
      await Promise.all(
        Array.from(iframeForPrint.contentDocument?.images || [])
          .filter((img) => !img.complete)
          .map(
            (img) =>
              new Promise((resolve) => {
                img.onload = img.onerror = resolve
              })
          )
      )

      const documentTitle = document.title
      document.title = printDocumentTitle
      iframeForPrint.contentWindow.focus()
      iframeForPrint.contentWindow.print()
      document.title = documentTitle
      if ('matchMedia' in iframeForPrint.contentWindow) {
        iframeForPrint.contentWindow
          .matchMedia('print')
          .addEventListener('change', function (media) {
            if (!media.matches) {
              iframeForPrint.contentDocument?.close()
              iframeForPrint.remove()
            }
          })
      } else {
        ;(iframeForPrint.contentWindow as Window).onafterprint = function () {
          iframeForPrint.contentDocument?.close()
          iframeForPrint.remove()
        }
      }
    }
  }
}

/* Рекурсивное добавление стилей при вставке на текстовые ноды без стилей (fontSize fontFamily) */
export const styleTextNodes = (slice: Slice | JSONContent) => {
  if (
    slice instanceof Slice ||
    (slice.content as JSONContent).content?.length
  ) {
    ;(slice?.content as JSONContent)?.content?.forEach((node) => {
      styleTextNodes(node)
    })
  } else {
    const sliceType = slice.type as any
    if (
      sliceType?.name === 'text' &&
      !slice.marks?.some?.(
        (mark: any) =>
          mark.type.name === 'textStyle' &&
          mark.attrs?.fontSize &&
          mark.attrs.fontFamily &&
          fonts.includes(mark.attrs.fontFamily.split(',')[0])
      )
    ) {
      slice.marks = [
        ...(Array.isArray(slice.marks)
          ? slice.marks.filter((mark: any) => mark.type.name !== 'textStyle')
          : []),
        sliceType?.schema.marks.textStyle.create({
          fontFamily:
            (slice.marks?.find((mark) => mark.fontFamily)?.fontFamily || '')
              .split(',')
              .filter((font: string) => fonts.includes(font))?.[0] ??
            DEFAULT_STYLE.fontFamily,

          fontSize:
            slice.marks?.find((mark) => mark.fontSize)?.fontSize ??
            wordUnitsToPx(DEFAULT_STYLE.fontSize) + 'px',
        }),
      ]
    }
  }
  return slice as Slice
}

export const pasteImages =
  (apiClient: AxiosInstance) => async (images: File[], ed: Editor) => {
    const requests = await Promise.all(
      images.map(async (image) => {
        const resizedImage = await resizeImage(image)
        return {
          fileName: convertToValidFileName(image.name),
          file: await resizedImage,
        }
      })
    )
    const responses = await Promise.allSettled(
      requests.map((item) => {
        const body = new FormData()
        body.set('file', item.file)
        return apiClient.post<
          Partial<ImageParams>,
          AxiosResponse<Partial<ImageParams>>
        >(`/file`, body)
      })
    )

    responses.forEach((item) => {
      if (item.status === 'fulfilled')
        ed.chain()
          .focus()
          .addImage({ src: `/file/${item.value.data.id}` })
          .run()
    })
  }
