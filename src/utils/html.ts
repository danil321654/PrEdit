import { flow } from 'lodash-es'
import { AxiosInstance } from 'axios'
import { flowAsync } from '../helpers'
import { fixImagesPath, fixWordParagraphs } from './htmlConverters/common'
import {
  fixDocLists,
  addColWidthsForDoc,
  addExtraHTMLforWord,
  replaceMarkTagsWithSpans,
  convertImagesToBase64DOC,
} from './htmlConverters/doc'
import {
  addColWidthsForPdf,
  convertImagesToBase64PDF,
  removeRedundantHTMLaddedByWord,
  fixHTMLwithWordStyles,
  handleRowSpannedTables,
  removeEmptyFontSizeStyles,
  removeLineHeightStyles,
  removeUnloadedImages,
} from './htmlConverters/pdfMake'

export const prepareForEditor = (html: string) =>
  flow(
    fixWordParagraphs,
    removeRedundantHTMLaddedByWord,
    fixHTMLwithWordStyles
  )(html)

export const prepareHTMLForPreview = (html: string) => flow(fixImagesPath)(html)

export const prepareHTMLForPrint = (html: string) => flow(fixImagesPath)(html)

export const prepareHTMLForDocExport =
  (apiClient: AxiosInstance) => (html: string) =>
    flowAsync(
      fixDocLists,
      addColWidthsForDoc,
      fixImagesPath,
      addExtraHTMLforWord,
      replaceMarkTagsWithSpans,
      convertImagesToBase64DOC(apiClient)
    )(html)

export const prepareHTMLForPdfExport =
  (apiClient: AxiosInstance) => (html: string) =>
    flowAsync(
      fixHTMLwithWordStyles,
      removeRedundantHTMLaddedByWord,
      handleRowSpannedTables,
      removeEmptyFontSizeStyles,
      removeLineHeightStyles,
      removeUnloadedImages,
      addColWidthsForPdf,
      fixImagesPath,
      convertImagesToBase64PDF(apiClient)
    )(html)
