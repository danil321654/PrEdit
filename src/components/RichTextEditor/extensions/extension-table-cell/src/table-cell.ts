import { RGBToHex } from '../../../../../helpers'
import { Node, mergeAttributes } from '@tiptap/core'
import { TABLE_MAX_WIDTH } from '../../../../../constants'
import { isVerticalAlign, VerticalAlign } from '../../../../../types'
import { isInTable, selectedRect, setAttr } from '../../prosemirror-tables/src'

export interface TableCellOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableCell: {
      /**
       * Set vertical align
       */
      setVerticalAlign: (verticalAlign: VerticalAlign) => ReturnType
      /**
       * Hide/unhide border
       */
      toggleBorder: ({ all }: { all?: boolean }) => ReturnType
    }
  }
}

export const TableCell = Node.create<TableCellOptions>({
  name: 'tableCell',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  addAttributes() {
    return {
      verticalAlign: {
        default: 'top',
        parseHTML: (element) =>
          isVerticalAlign(element.style.verticalAlign)
            ? element.style.verticalAlign
            : 'top',
        renderHTML: ({}) => ({}),
      },
      borderColor: {
        default: '#000000',
        parseHTML: (element) =>
          RGBToHex(element.style.borderColor) === '#ffffff'
            ? '#ffffff'
            : '#000000',
        renderHTML: ({}) => ({}),
      },
      style: {
        default: '',
        renderHTML: ({ verticalAlign, borderColor }) => ({
          style: `vertical-align: ${verticalAlign}; border-color: ${borderColor}`,
        }),
      },
      colspan: {
        default: 1,
        parseHTML: (element) => +(element.getAttribute('colspan') ?? 1),
        renderHTML: ({ colspan }) => ({
          colspan,
        }),
      },
      rowspan: {
        default: 1,
        parseHTML: (element) => +(element.getAttribute('rowspan') ?? 1),
        renderHTML: ({ rowspan }) => ({
          rowspan,
        }),
      },
      colwidth: {
        default: null,
        parseHTML: (element) => {
          const colwidth = element.getAttribute('colwidth')

          const cols = Array.from(element.parentElement?.children || []).reduce(
            (totalColspan, curCell) =>
              totalColspan + +(curCell.getAttribute('colspan') || 1),
            0
          )
          const value = colwidth
            ? colwidth.split(',').map((el) => +el)
            : Array(+(element.getAttribute('colspan') || 1)).fill(
                (TABLE_MAX_WIDTH - cols - 1) / cols
              )

          return value
        },
      },
    }
  },

  tableRole: 'cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'td' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'td',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setVerticalAlign:
        (verticalAlign) =>
        ({ state, dispatch }) => {
          if (!isInTable(state)) return false
          if (dispatch) {
            const rect = selectedRect(state),
              tr = state.tr
            const cells = rect.map.cellsInRect(rect)

            cells.forEach((cell: any) => {
              const cellNode = rect.table.nodeAt(cell)
              tr.setNodeMarkup(
                rect.tableStart + cell,
                undefined,
                setAttr(cellNode.attrs, 'verticalAlign', verticalAlign)
              )
            })
            return dispatch(tr)
          }
        },
      toggleBorder:
        ({ all }) =>
        ({ state, dispatch }) => {
          if (!isInTable(state)) return false
          if (dispatch) {
            const rect = selectedRect(state),
              tr = state.tr
            const cells = rect.map.cellsInRect(
              all
                ? {
                    left: 0,
                    top: 0,
                    right: rect.map.width,
                    bottom: rect.map.height,
                  }
                : rect
            )

            cells.forEach((cell: any) => {
              const cellNode = rect.table.nodeAt(cell)
              const borderColor =
                cellNode.attrs.borderColor === '#000000' ? '#ffffff' : '#000000'
              tr.setNodeMarkup(
                rect.tableStart + cell,
                undefined,
                setAttr(cellNode.attrs, 'borderColor', borderColor)
              )
            })
            return dispatch(tr)
          }
        },
    }
  },
})
