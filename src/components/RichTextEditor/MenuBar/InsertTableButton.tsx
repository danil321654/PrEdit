/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import clsx from 'clsx'
import React, { useEffect, useState } from 'react'
import { Editor } from '@tiptap/core'
import { makeStyles } from '@material-ui/core'
import { ChildrenMenusFn, MenuButton } from './MenuButton'

export const useStyles = makeStyles(theme => ({
  insertTableWrapper: {
    padding: theme.spacing(1),
  },
  insertTable: {
    borderSpacing: `${theme.spacing(0.75)}px`,
  },
  insertTableCell: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    border: '1px solid #D4D5D7',
    borderRadius: theme.spacing(0.25),
    cursor: 'pointer',
  },
  insertTableCellSelected: {
    backgroundColor: theme.palette.primary.light,
    border: `1px solid ${theme.palette.primary.main}`,
  },
}))

const TABLE_TEMPLATE = Array.from({ length: 5 }, () =>
  Array.from({ length: 5 }),
)

const DEFAULT_SELECTED_CELLS = { i: -1, j: -1 }

interface Props {
  editor: Editor
}

export function InsertTableButton({ editor }: Props) {
  const [isInTable, setIsTable] = useState(false)
  const [selectedCell, setSelectedCell] = useState(DEFAULT_SELECTED_CELLS)
  const classes = useStyles()

  useEffect(() => {
    setIsTable(editor.isActive('table'))
  }, [editor, editor.state])

  const insertTable = () => {
    editor.commands.insertTable({
      rows: selectedCell.i + 1,
      cols: selectedCell.j + 1,
      withHeaderRow: false,
    })
    setSelectedCell(DEFAULT_SELECTED_CELLS)
  }

  // Render table preview when selection out of table
  const renderTable: ChildrenMenusFn = () => {
    return [
      <div key="insertTable" className={classes.insertTableWrapper}>
        <div>{`Таблица ${selectedCell.i + 1}x${selectedCell.j + 1}`}</div>
        <table
          className={classes.insertTable}
          onMouseLeave={() => setSelectedCell(DEFAULT_SELECTED_CELLS)}
        >
          <tbody>
            {TABLE_TEMPLATE.map((row, idx) => (
              <tr key={idx}>
                {row.map((_c, cIdx) => (
                  <td
                    key={`cell[${idx} ${cIdx}]`}
                    className={clsx(classes.insertTableCell, {
                      [classes.insertTableCellSelected]:
                        idx <= selectedCell.i && cIdx <= selectedCell.j,
                    })}
                    onMouseEnter={() =>
                      setSelectedCell({
                        i: idx,
                        j: cIdx,
                      })
                    }
                    onClick={insertTable}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    ]
  }

  return (
    <MenuButton
      icon="table"
      tooltip={!isInTable ? 'Вставить таблицу' : ''}
      childrenMenus={!isInTable ? renderTable : undefined}
      centerChildren={!isInTable}
      isInlineMenu={isInTable}
      aria-pressed={isInTable}
      disabled={!editor.isEditable || !editor.can().insertTable()}
    />
  )
}
