/* eslint-disable max-lines */
import React from 'react'
import ChangeColorButton from './ChangeColorButton'
import { AddImageButton } from '../Image'
import { AddLinkButton } from './AddLinkButton'
import { lineHeights } from '../../../constants'
import { MenuButton, MenuIcons } from './MenuButton'
import { Grid, makeStyles } from '@material-ui/core'
import { Editor, SingleCommands } from '@tiptap/core'
import { ChangeFontButtons } from './ChangeFontButtons'
import { InsertTableButton } from './InsertTableButton'
import {
  compareLineHeight,
  getHeadingFontSize,
  isHeadingActive,
  prepareHTMLForPrint,
  printDocument,
  wordUnitsToPx,
} from '../../../utils'

export const useStyles = makeStyles((theme) => ({
  menuBar: {
    backgroundColor: theme.palette.background.default,
    paddingLeft: theme.spacing(3),
    borderRadius: '3px 3px 0 0',
  },
  separator: {
    borderLeft: 0,
    borderRight: `1px solid ${theme.palette.divider}`,
    cursor: 'default',
    margin: theme.spacing(0.5, 0.375),
    padding: 0,
  },
}))

export interface MenuBarProps {
  editor: Editor
}

interface CommonMenuBtn {
  type: 'common'
  icon: keyof MenuIcons
  command?: keyof SingleCommands
  commandArgs?: unknown[]
  tooltip?: React.ReactNode
  isActive?: string | Record<string, string>
  onClick?(editor: Editor): React.MouseEventHandler<HTMLButtonElement>
  childrenMenus?(editor: Editor): React.ReactNode[]
}

interface CustomMenuBtn {
  type: 'custom'
  customRender(editor: Editor): React.ReactNode
}

type MenuBtn = CommonMenuBtn | CustomMenuBtn | 'separator'
declare type Level = 1 | 2 | 3 | 4 | 5 | 6

const TextBlockMenus = (editor: Editor) => {
  return [
    <MenuButton
      key="p"
      btnText={<p>Нормальный текст</p>}
      disabled={!editor.can().setParagraph()}
      onClick={() => editor.chain().focus().setParagraph().run()}
      vertical
    />,
    ...[
      <h1 key="head1">Заголовок 1</h1>,
      <h2 key="head2">Заголовок 2</h2>,
      <h3 key="head3">Заголовок 3</h3>,
      <h4 key="head4">Заголовок 4</h4>,
    ].map((head, i) => {
      const level = (i + 1) as Level
      return (
        <MenuButton
          key={`h${i + 1}`}
          btnText={head}
          disabled={!editor.can().setHeading({ level })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .setHeading({ level })
              .setFontSize(`${wordUnitsToPx(getHeadingFontSize(level))}px`)
              .run()
          }
          aria-pressed={isHeadingActive(editor.state, i + 1)}
          vertical
        />
      )
    }),
  ]
}

const renderСhangeFontButtons = (editor: Editor) => (
  <ChangeFontButtons editor={editor} />
)
const renderInsertTableButton = (editor: Editor) => (
  <InsertTableButton editor={editor} />
)
const renderImageButton = (editor: Editor) => (
  <AddImageButton key="imageBtn" editor={editor} />
)
const renderLinkButton = (editor: Editor) => <AddLinkButton editor={editor} />

const renderLineHeightButton = (editor: Editor) => {
  return [
    lineHeights.map((lineHeight) => (
      <MenuButton
        key={`lineHeight-${lineHeight}`}
        btnText={lineHeight}
        onClick={() => editor.chain().setLineHeight(lineHeight).focus().run()}
        aria-pressed={compareLineHeight(editor, lineHeight)}
        vertical
      />
    )),
  ]
}

const MENU_BUTTONS: MenuBtn[] = [
  {
    type: 'common',
    icon: 'undo',
    command: 'undo',
    tooltip: 'Отмена',
  },
  {
    type: 'common',
    icon: 'redo',
    command: 'redo',
    tooltip: 'Повтор',
  },
  'separator',
  {
    type: 'common',
    icon: 'paragraph',
    command: 'setParagraph',
    tooltip: 'Вставить блочный элемент',
    childrenMenus: TextBlockMenus,
  },
  {
    type: 'custom',
    customRender: renderСhangeFontButtons,
  },
  {
    type: 'custom',
    customRender: ChangeColorButton,
  },
  'separator',
  {
    type: 'common',
    icon: 'bold',
    command: 'toggleBold',
    isActive: 'bold',
    tooltip: 'Жирный',
  },
  {
    type: 'common',
    icon: 'italic',
    command: 'toggleItalic',
    isActive: 'italic',
    tooltip: 'Наклонный',
  },
  {
    type: 'common',
    icon: 'underline',
    command: 'toggleUnderline',
    isActive: 'underline',
    tooltip: 'Подчеркнутый',
  },
  {
    type: 'common',
    icon: 'strikethrough',
    command: 'toggleStrike',
    isActive: 'strike',
    tooltip: 'Перечеркнутый',
  },
  {
    type: 'common',
    icon: 'eraser',
    command: 'unsetAllMarks',
    tooltip: 'Очистить форматирование',
  },
  'separator',
  {
    type: 'common',
    icon: 'sub',
    command: 'toggleSubscript',
    isActive: 'subscript',
    tooltip: 'Индекс',
  },
  {
    type: 'common',
    icon: 'sup',
    command: 'toggleSuperscript',
    isActive: 'superscript',
    tooltip: 'Верхний индекс',
  },
  'separator',
  {
    type: 'common',
    icon: 'ul',
    command: 'toggleBulletList',
    isActive: 'bulletList',
    tooltip: 'Вставка маркированного списка',
  },
  {
    type: 'common',
    icon: 'ol',
    command: 'toggleOrderedList',
    isActive: 'orderedList',
    tooltip: 'Вставить нумерованный список',
  },
  'separator',
  {
    type: 'common',
    icon: 'left',
    command: 'setTextAlign',
    commandArgs: ['left'],
    isActive: { textAlign: 'left' },
    tooltip: 'Выровнять по левому краю',
  },
  {
    type: 'common',
    icon: 'center',
    command: 'setTextAlign',
    commandArgs: ['center'],
    isActive: { textAlign: 'center' },
    tooltip: 'Выровнять по центру',
  },
  {
    type: 'common',
    icon: 'right',
    command: 'setTextAlign',
    commandArgs: ['right'],
    isActive: { textAlign: 'right' },
    tooltip: 'Выровнять по правому краю',
  },
  {
    type: 'common',
    icon: 'justify',
    command: 'setTextAlign',
    commandArgs: ['justify'],
    isActive: { textAlign: 'justify' },
    tooltip: 'Выровнять по ширине',
  },
  'separator',
  {
    type: 'common',
    icon: 'lineHeight',
    tooltip: 'Изменить межстрочный интервал',
    childrenMenus: renderLineHeightButton,
  },
  'separator',
  {
    type: 'common',
    icon: 'hr',
    command: 'setHorizontalRule',
    tooltip: 'Вставить горизонтальную линию',
  },
  {
    type: 'custom',
    customRender: renderLinkButton,
  },
  {
    type: 'custom',
    customRender: renderImageButton,
  },

  {
    type: 'custom',
    customRender: renderInsertTableButton,
  },

  {
    type: 'common',
    icon: 'print',
    tooltip: 'Печать',
    onClick: (editor: Editor) => async () => {
      const html = await prepareHTMLForPrint(editor.getHTML())
      printDocument(html, 'example')
    },
  },
]

const MenuBar: React.FC<MenuBarProps> = ({ editor }: MenuBarProps) => {
  const classes = useStyles()

  if (!editor) {
    return null
  }

  return (
    <Grid container justify="center" className={classes.menuBar}>
      {MENU_BUTTONS.map((el, idx) => {
        if (!el) {
          return null
        }

        if (el === 'separator') {
          return <div key={idx} className={classes.separator} />
        }

        if (el.type === 'custom') {
          return <div key={idx}> {el.customRender(editor)}</div>
        }

        const {
          command,
          commandArgs = [],
          isActive,
          onClick,
          childrenMenus,
          ...restProps
        } = el

        const btnOnClick = onClick
          ? onClick(editor)
          : () =>
              command &&
              (editor.chain().focus()[command] as any)(...commandArgs).run()

        return (
          <MenuButton
            key={el.icon + idx}
            {...restProps}
            disabled={
              (command && !(editor.can()[command] as any)(...commandArgs)) ||
              !editor.isEditable
            }
            onClick={editor.isEditable ? btnOnClick : undefined}
            aria-pressed={!!isActive && editor.isActive(isActive)}
            childrenMenus={childrenMenus?.(editor)}
          />
        )
      })}
      <div className={classes.separator} />
    </Grid>
  )
}

export default MenuBar
