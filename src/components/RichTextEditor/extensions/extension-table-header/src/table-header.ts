import { Node, mergeAttributes } from '@tiptap/core'
import { TABLE_MAX_WIDTH } from '../../../../../constants'

export interface TableHeaderOptions {
  HTMLAttributes: Record<string, any>
}
export const TableHeader = Node.create<TableHeaderOptions>({
  name: 'tableHeader',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  content: 'block+',

  addAttributes() {
    return {
      colspan: {
        default: 1,
      },
      rowspan: {
        default: 1,
      },
      colwidth: {
        default: null,
        parseHTML: element => {
          const colwidth = element.getAttribute('colwidth')

          const cols = Array.from(element.parentElement?.children || []).reduce(
            (totalColspan, curCell) =>
              totalColspan + +(curCell.getAttribute('colspan') || 1),
            0,
          )
          const value = colwidth
            ? colwidth.split(',').map(el => +el)
            : Array(+(element.getAttribute('colspan') || 1)).fill(
                (TABLE_MAX_WIDTH - cols - 1) / cols,
              )

          return value
        },
      },
    }
  },

  tableRole: 'header_cell',

  isolating: true,

  parseHTML() {
    return [{ tag: 'th' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'th',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },
})
