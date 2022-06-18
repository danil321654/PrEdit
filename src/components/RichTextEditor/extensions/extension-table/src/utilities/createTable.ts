import { createCell } from './createCell'
import { getTableNodeTypes } from './getTableNodeTypes'
import { setAttr } from '../../../prosemirror-tables/src'
import { TABLE_MAX_WIDTH } from '../../../../../../constants'
import { Schema, Fragment, Node as ProsemirrorNode } from 'prosemirror-model'

export function createTable(
  schema: Schema,
  rowsCount: number,
  colsCount: number,
  withHeaderRow: boolean,
  cellContent?:
    | Fragment<Schema>
    | ProsemirrorNode<Schema>
    | Array<ProsemirrorNode<Schema>>,
): ProsemirrorNode {
  const types = getTableNodeTypes(schema)
  const headerCells = []
  const cells = []

  for (let index = 0; index < colsCount; index += 1) {
    let cell = createCell(types.cell, cellContent)

    let baseAttrs = cell?.attrs
    baseAttrs = setAttr(baseAttrs, 'colwidth', [
      (TABLE_MAX_WIDTH - colsCount - 1) / colsCount,
    ])
    baseAttrs = setAttr(baseAttrs, 'colspan', 1)
    baseAttrs = setAttr(baseAttrs, 'rowspan', 1)
    cell = createCell(types.cell, cellContent, baseAttrs)
    if (cell) {
      cells.push(cell)
    }

    if (withHeaderRow) {
      const headerCell = createCell(types.header_cell, cellContent)

      if (headerCell) {
        headerCells.push(headerCell)
      }
    }
  }

  const rows = []

  for (let index = 0; index < rowsCount; index += 1) {
    rows.push(
      types.row.createChecked(
        null,
        withHeaderRow && index === 0 ? headerCells : cells,
      ),
    )
  }

  return types.table.createChecked(null, rows)
}
