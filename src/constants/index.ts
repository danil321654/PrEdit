export const inDevelopment = process.env.NODE_ENV === 'development'

export const documentsPerPage = 20

export const imagesPerPage = 20

export const MAX_SIZE_IMG = {
  WIDTH: 680,
  HEIGHT: 1000,
}
export const MIN_SIZE_IMG = {
  WIDTH: 45,
  HEIGHT: 65,
}

export const lineHeights = [1.0, 1.5, 2.0, 2.5, 3.0]

export const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 32]
export const DEFAULT_FONT_SIZE = 11
export const fonts = [
  'Arial',
  'Courier New',
  'Roboto',
  'Tahoma',
  'Times New Roman',
  'Verdana',
]
export const DEFAULT_STYLE = {
  fontSize: fontSizes[3],
  fontFamily: fonts[0],
  lineHeight: lineHeights[0],
}

export const HEADING_FONT_SIZES = [DEFAULT_FONT_SIZE, 24, 18, 14, 11]

export const CELL_MIN_WIDTH = 25
export const TABLE_MAX_WIDTH = 680
export const DEFAULT_PDF_INNER_WIDTH = 515.28

export const IMAGES_KEY = 'PR_EDIT_IMAGES_STORED_IDS'
