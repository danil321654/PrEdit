// @ts-nocheck
import { NodeView } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'

export function updateColumns(
  node: ProseMirrorNode,
  colgroup: Element,
  table: Element,
  overrideCol?: number,
  overrideValue?: any,
) {
  let nextDOM = colgroup.firstChild
  const row = node.firstChild
  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth = overrideCol === col ? overrideValue : colwidth?.[j]
      const cssWidth = hasWidth ? `${hasWidth}px` : ''

      if (!nextDOM) {
        const col = document.createElement('col')
        colgroup.appendChild(col).style.width =
          cssWidth
          console.log('++++')
          console.log(col.style.width)
      } else {

        nextDOM = nextDOM.nextSibling
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling

    nextDOM.parentNode.removeChild(nextDOM)
    nextDOM = after
  }

  const widths = []
  if (!table.style.width) table.style.width = `100%`
  const firstRow = table.querySelector('tr')

  firstRow?.querySelectorAll('th,td').forEach(cell => {
    const colspan = +cell.getAttribute('colspan')
    const clientWidth = cell.clientWidth
    if (colspan > 1) {
      const colwidths = cell
        .getAttribute('colwidth')
        ?.split(',')
        .map(colwidth => +colwidth)

      colwidths?.forEach(colwidth => {
        widths.push(colwidth)
      })
    } else {
      widths.push(clientWidth)
    }
  })
}


export class TableView implements NodeView {
  node: ProseMirrorNode

  cellMinWidth: number

  dom: Element

  table: Element

  colgroup: Element

  contentDOM: Element

  constructor(node: ProseMirrorNode, cellMinWidth: number) {
    this.node = node
    this.cellMinWidth = cellMinWidth
    this.dom = document.createElement('div')
    this.dom.className = 'tableWrapper'
    const table = document.createElement('table')
    table.style = 'min-width:100px;border-collapse:collapse;'
    table.border = '1'
    this.table = this.dom.appendChild(table)

    // cells drag&drop breaks column resizing, so event listener disables it
    this.table.addEventListener('dragstart', e => {
      e.preventDefault()
    })

    this.colgroup = this.table.appendChild(document.createElement('colgroup'))
    updateColumns(node, this.colgroup, this.table, cellMinWidth)
    const cols = table.querySelectorAll('col')
    cols.forEach((col: Element) => {
      if (!col.style.width)
        col.style.width = `${table.clientWidth / cols.length}px`
    })
    this.contentDOM = this.table.appendChild(document.createElement('tbody'))
  }

  update(node: ProseMirrorNode) {
    if (node.type !== this.node.type) {
      return false
    }

    this.node = node
    updateColumns(node, this.colgroup, this.table, this.cellMinWidth)

    return true
  }

  ignoreMutation(
    mutation: MutationRecord | { type: 'selection'; target: Element },
  ) {
    return (
      mutation.type === 'attributes' &&
      (mutation.target === this.table ||
        this.colgroup.contains(mutation.target))
    )
  }
}
