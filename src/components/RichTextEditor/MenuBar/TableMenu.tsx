import React from 'react'
import MenuBtnChild from './MenuBtnChild'
import { noop } from 'lodash-es'
import { Editor } from '@tiptap/core'
import { Grid } from '@material-ui/core'
import { MenuButton } from './MenuButton'

interface Props {
  editor: Editor
  open: boolean
  toggleChild?: () => void
  showChevron?: boolean
}

export function TableMenu({
  editor,
  open,
  toggleChild = noop,
  showChevron,
}: Props) {
  const { borderColor } = editor.getAttributes('tableCell')
  const borderColorTooltip = `${
    borderColor === '#ffffff' ? 'Показать' : 'Скрыть'
  } границы у таблицы`

  return editor.isActive('table') ? (
    <MenuBtnChild
      toggleChild={toggleChild}
      open={open}
      centerChildren
      showChevron={showChevron}
    >
      <Grid container direction="row">
        <MenuButton
          icon="addRow"
          key="addRow"
          tooltip="Вставить строку"
          onClick={() => editor.commands.addRowAfter()}
          disabled={!editor.can().addRowBefore()}
          iconSize={18}
        />
        <MenuButton
          icon="delRow"
          key="deleteRow"
          tooltip="Удалить строку"
          onClick={() => editor.commands.deleteRow()}
          disabled={!editor.can().deleteRow()}
          iconSize={18}
        />
      </Grid>
      <Grid container direction="row">
        <MenuButton
          icon="addCol"
          key="addCol"
          tooltip="Вставить колонку"
          onClick={() => editor.commands.addColumnAfter()}
          disabled={!editor.can().addColumnBefore()}
          iconSize={18}
        />
        <MenuButton
          icon="delCol"
          key="deleteCol"
          tooltip="Удалить колонку"
          onClick={() => editor.commands.deleteColumn()}
          disabled={!editor.can().deleteColumn()}
          iconSize={18}
        />
      </Grid>
      <Grid container direction="row">
        <MenuButton
          icon="merge"
          key="mergeCells"
          tooltip="Объединить ячейки"
          onClick={() => editor.commands.mergeCells()}
          disabled={!editor.can().mergeCells()}
          iconSize={18}
        />
        <MenuButton
          icon="split"
          key="splitCells"
          tooltip="Разделить ячейки"
          onClick={() => editor.commands.splitCell()}
          disabled={!editor.can().splitCell()}
          iconSize={18}
        />
      </Grid>

      <Grid container direction="row">
        <MenuButton
          icon="top"
          key="topAlign"
          tooltip="Выровнять по верхнему краю"
          onClick={() => editor.commands.setVerticalAlign('top')}
          iconSize={18}
        />
        <MenuButton
          icon="bottom"
          key="bottomAlign"
          tooltip="Выровнять по нижнему краю"
          onClick={() => editor.commands.setVerticalAlign('bottom')}
          iconSize={18}
        />
      </Grid>

      <Grid container direction="row">
        <MenuButton
          icon="middle"
          key="middleAlign"
          tooltip="Выровнять посередине"
          onClick={() => editor.commands.setVerticalAlign('middle')}
          iconSize={18}
        />
        <MenuButton
          icon="noBorder"
          key="toggleBorderAll"
          tooltip={borderColorTooltip}
          onClick={() => editor.commands.toggleBorder({ all: true })}
          iconSize={18}
        />
      </Grid>

      <Grid container direction="row">
        <MenuButton
          icon="deleteTable"
          key="deleteTable"
          tooltip="Удалить таблицу"
          onClick={() => editor.commands.deleteTable()}
          disabled={!editor.can().deleteTable()}
          iconSize={18}
        />
      </Grid>
    </MenuBtnChild>
  ) : null
}
