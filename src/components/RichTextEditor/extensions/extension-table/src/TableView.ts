// @ts-nocheck
import { NodeView } from 'prosemirror-view'
import { Node as ProseMirrorNode } from 'prosemirror-model'

export function updateColumns(node: ProseMirrorNode, colgroup: Element, table: Element, cellMinWidth: number, overrideCol?: number, overrideValue?: any) {
  console.log(overrideCol, overrideValue)
  let totalWidth = 0
  let fixedWidth = true
  let nextDOM = colgroup.firstChild
  const row = node.firstChild

  for (let i = 0, col = 0; i < row.childCount; i += 1) {
    const { colspan, colwidth } = row.child(i).attrs

    for (let j = 0; j < colspan; j += 1, col += 1) {
      const hasWidth = overrideCol === col ? overrideValue : colwidth && colwidth[j]
      const cssWidth = hasWidth ? `${hasWidth}px` : ''

      totalWidth += hasWidth || cellMinWidth

      if (!hasWidth) {
        fixedWidth = false
      }

      if (!nextDOM) {
        colgroup.appendChild(document.createElement('col')).style.width = cssWidth
      } else {
        if (nextDOM.style.width !== cssWidth) {
          nextDOM.style.width = cssWidth
        }

        nextDOM = nextDOM.nextSibling
      }
    }
  }

  while (nextDOM) {
    const after = nextDOM.nextSibling

    nextDOM.parentNode.removeChild(nextDOM)
    nextDOM = after
  }

  if (fixedWidth) {
    table.style.width = `${totalWidth}px`
    table.style.minWidth = ''
  } else {
    table.style.width = ''
    table.style.minWidth = `${totalWidth}px`
  }
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
