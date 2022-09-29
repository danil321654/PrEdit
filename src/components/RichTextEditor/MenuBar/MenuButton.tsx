/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import clsx from 'clsx'
import MenuBtnChild from './MenuBtnChild'
import React, { useEffect, useRef } from 'react'
import { Print } from '@material-ui/icons'
import { makeStyles, Theme, Tooltip } from '@material-ui/core'
import {
  Bold,
  Center,
  Eraser,
  ExportPDF,
  Hr,
  Image,
  Italic,
  Justify,
  Left,
  Link,
  LineHeight,
  Ol,
  Paragraph,
  Redo,
  Right,
  Strikethrough,
  Subscript,
  Superscript,
  Ul,
  Underline,
  Undo,
  Cancel,
  Table,
  DelTable,
  AddColumn,
  AddRow,
  DelCol,
  DelRow,
  Merge,
  Splitg,
  Upload,
  Fontsize,
  Font,
  Brush,
  AlignBottom,
  AlignTop,
  AlignMiddle,
  NoBorder,
} from '../../../images/icons'

const useStyles = makeStyles<Theme, { disabled?: boolean }>((theme) => ({
  menuButtonContainer: {
    display: 'flex',
    position: 'relative',
    border: '1px solid transparent',
    borderRadius: 3,
    height: theme.spacing(3.5),
    minWidth: theme.spacing(3.5),
    margin: '2px 1px',
    padding: 0,
    '&:hover': ({ disabled }) =>
      !disabled && {
        borderColor: '#dadada',
      },
    '& button': {
      alignItems: 'center',
      cursor: 'pointer',
      appearance: 'none',
      background: '0 0',
      border: 0,
      borderRadius: 3,
      boxShadow: 'none',
      boxSizing: 'border-box',
      display: 'inline-flex',
      fontStyle: 'normal',
      justifyContent: 'center',
      outline: 0,
      padding: 0,
      position: 'relative',
      textAlign: 'center',
      textDecoration: 'none',
      textTransform: 'none',
      userSelect: 'none',
      height: theme.spacing(3.5),
      minWidth: theme.spacing(3.5),
      '&:hover:not([disabled]), &.open': {
        backgroundColor:
          theme.palette.type === 'light'
            ? '#dcdcdc'
            : theme.palette.text.secondary,
        opacity: 1,
        outline: 0,
      },
      '&[aria-pressed=true]:not([disabled])': {
        backgroundColor: 'hsla(0, 0%, 86%, 0.4)',
        outline: 0,
      },
      '&[disabled]': {
        opacity: 0.3,
        pointerEvents: 'none',
      },
    },
    '& $menuButtonContainer button': {
      padding: theme.spacing(0, 1),
    },
  },
  menuButtonWithTrigger: {
    '& > button': {
      borderRadius: '3px 0 0 3px',
    },
  },
  menuBtnText: {
    whiteSpace: 'nowrap',
    color: theme.palette.text.primary,
    '&:not(:empty)': {
      display: 'inline-flex',
      flex: '1 1',
      fontSize: theme.typography.body1.fontSize,
      justifyContent: 'left',
    },
  },
  verticalBtn: {
    height: 'auto',
    minHeight: theme.spacing(3.5),
    '& button': {
      height: 'auto',
      minHeight: theme.spacing(3.5),
      width: '100%',
    },
    '& p': {
      margin: 0,
      padding: 0,
    },
    '& h1': {
      margin: 0,
      padding: 0,
    },
    '& h2': {
      margin: 0,
      padding: 0,
    },
    '& h3': {
      margin: 0,
      padding: 0,
    },
    '& h4': {
      margin: 0,
      padding: 0,
    },
    '& blockquote': {
      margin: 0,
      padding: 0,
    },
  },
  icon: {
    '&:not(:empty)': {
      display: 'inline-flex',
    },
    '& svg': {
      isolation: 'isolate',
      fill:
        theme.palette.type === 'light' ? '#4c4c4c' : theme.palette.text.primary,
      color:
        theme.palette.type === 'light' ? '#4c4c4c' : theme.palette.text.primary,
      background: '50% no-repeat',
      backgroundSize: 'contain',
      overflow: 'visible',
      transformOrigin: '0 0 !important',
    },
  },
  tooltip: {
    zIndex: theme.zIndex.tooltip,
    wordWrap: 'break-word',
    '& > div': {
      marginTop: 5,
      marginBottom: 5,
    },
  },
  popper: {
    '&[x-out-of-boundaries]': {
      visibility: 'hidden',
    },
  },
}))

const MENU_ICONS = {
  paragraph: Paragraph,
  brush: Brush,
  bold: Bold,
  italic: Italic,
  underline: Underline,
  strikethrough: Strikethrough,
  eraser: Eraser,
  fontSize: Fontsize,
  fontFamily: Font,
  pdf: ExportPDF,
  sub: Subscript,
  sup: Superscript,
  ul: Ul,
  ol: Ol,
  link: Link,
  image: Image,
  hr: Hr,
  center: Center,
  left: Left,
  right: Right,
  middle: AlignMiddle,
  top: AlignTop,
  bottom: AlignBottom,
  justify: Justify,
  redo: Redo,
  undo: Undo,
  cancel: Cancel,
  table: Table,
  deleteTable: DelTable,
  addRow: AddRow,
  addCol: AddColumn,
  merge: Merge,
  split: Splitg,
  delCol: DelCol,
  delRow: DelRow,
  upload: Upload,
  lineHeight: LineHeight,
  noBorder: NoBorder,
  print: Print as unknown as 'inherit',
} as const
export type MenuIcons = typeof MENU_ICONS

type MenuIconProps = React.SVGProps<SVGSVGElement> & {
  icon: keyof MenuIcons
}

function MenuIcon({ icon, ...restProps }: MenuIconProps) {
  const Icon = MENU_ICONS[icon]
  const classes = useStyles({})
  return (
    <span className={classes.icon}>
      <Icon {...restProps} />
    </span>
  )
}

interface Props {
  icon?: keyof MenuIcons
  iconSize?: number
  tooltip?: React.ReactNode
  btnText?: React.ReactNode
  childrenMenus?: React.ReactNode[] | any
  disabled?: boolean
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  className?: string
  vertical?: boolean
  'aria-pressed'?: boolean
  isInlineMenu?: boolean
  isFocused?: boolean
  centerChildren?: boolean
  InputComponent?: React.FC<Record<string, unknown>>
}

export const MenuButton = ({
  icon,
  iconSize,
  tooltip,
  childrenMenus,
  vertical,
  btnText,
  onClick,
  isInlineMenu,
  isFocused,
  centerChildren,
  InputComponent,
  className,
  ...restProps
}: Props) => {
  const [isShowChild, setShowChild] = React.useState(false)
  const childRef = useRef<HTMLDivElement>(null)
  const classes = useStyles({ disabled: restProps.disabled })
  const hasChildren = !!childrenMenus
  const childrenNeedsProps = hasChildren && typeof childrenMenus === 'function'

  useEffect(() => {
    if (hasChildren && isShowChild && isFocused) {
      setShowChild(false)
    }
  }, [hasChildren, isFocused, isShowChild])

  useEffect(() => {
    const closeByClickOutside = (e: MouseEvent) => {
      if (!childRef.current?.contains(e.target as HTMLElement)) {
        setShowChild(false)
      }
    }

    if (isShowChild) {
      document.addEventListener('click', closeByClickOutside)
    } else {
      document.removeEventListener('click', closeByClickOutside)
    }

    return () => document.removeEventListener('click', closeByClickOutside)
  }, [isShowChild])

  const toggleChild = () => {
    if (hasChildren) {
      if (isShowChild) setShowChild(false)
      else setShowChild(true)
    }
  }

  return (
    <span
      role="listitem"
      ref={childRef}
      className={`${classes.menuButtonContainer} ${
        hasChildren ? classes.menuButtonWithTrigger : ''
      } ${vertical ? classes.verticalBtn : ''}`}
      onClick={() => !childrenNeedsProps && toggleChild}
    >
      <Tooltip
        title={tooltip || ''}
        placement="bottom"
        enterDelay={700}
        leaveDelay={100}
        classes={{ popper: classes.popper }}
        className={classes.tooltip}
        PopperProps={{
          modifiers: {
            hide: { enabled: true },
          },
        }}
      >
        <span className={classes.menuBtnText}>
          {InputComponent ? (
            <InputComponent
              onClick={!hasChildren ? onClick : () => setShowChild(true)}
            />
          ) : (
            <button
              {...restProps}
              className={clsx(className, {
                open: isShowChild,
              })}
              type="button"
              tabIndex={-1}
              onClick={!hasChildren ? onClick : toggleChild}
            >
              {icon && (
                <MenuIcon
                  icon={icon}
                  width={iconSize ?? 14}
                  height={iconSize ?? 14}
                />
              )}
              {btnText && (
                <span className={classes.menuBtnText}>{btnText}</span>
              )}
            </button>
          )}
        </span>
      </Tooltip>
      {hasChildren && (
        <MenuBtnChild
          open={!restProps?.disabled && isShowChild}
          toggleChild={toggleChild}
          isInlineMenu={isInlineMenu}
          centerChildren={centerChildren}
        >
          {childrenNeedsProps
            ? childrenMenus({
                setIsShowChildFalse: () => setShowChild(false),
                setIsShowChildTrue: () => setShowChild(true),
              })
            : childrenMenus}
        </MenuBtnChild>
      )}
    </span>
  )
}
