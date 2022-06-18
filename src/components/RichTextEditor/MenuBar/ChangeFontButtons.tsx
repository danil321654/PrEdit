import React from 'react'
import { isEqual } from 'lodash-es'
import { Editor } from '@tiptap/core'
import { MenuButton } from './MenuButton'
import { DEFAULT_STYLE, fonts, fontSizes } from '../../../constants'
import { Grid, makeStyles, Theme, TextField } from '@material-ui/core'
import {
  getHeadingFontSize,
  getHeadingLevel,
  pxToWordUnits,
  wordUnitsToPx,
} from '../../../utils'

interface RenderInputProps {
  value: string | number
  isDisabled: boolean
  isEditable: boolean
  width?: number
  update?: (value: string | number) => void
  validate?: (value: string) => string
}
type RenderInputFn = (
  props: RenderInputProps
) => React.FC<Record<string, unknown>>

const useStyles = makeStyles<Theme, Partial<RenderInputProps>>((theme) => ({
  input: {
    pointerEvents: 'all',
    opacity: (props) => (props.isEditable ? 1 : 0.3),
    width: (props) => theme.spacing(props.width ?? 11),
    '& input': {
      padding: `0 ${theme.spacing(1.5)}px`,
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    '& .endAdornment': {
      display: 'none',
    },
    '& .MuiInput-underline:before': {
      display: (props) => (props.isDisabled ? 'none' : ''),
    },
  },
}))

const renderInput: RenderInputFn =
  ({ value, isDisabled, isEditable, width, update, validate }) =>
  (props) => {
    const classes = useStyles({ isDisabled, isEditable, width })
    const [textFieldValue, setTextFieldValue] = React.useState(value)
    const [isFocused, setFocused] = React.useState(false)
    const initValue = isFocused ? textFieldValue : value

    const saveTextFieldValue = () => {
      if (String(value) !== String(textFieldValue)) {
        const updateValue = textFieldValue || value
        setTextFieldValue(updateValue)
        update?.(updateValue)
      }
      setTimeout(() => setFocused(false), 150)
    }

    return (
      <TextField
        {...props}
        disabled={isDisabled || !isEditable}
        className={classes.input}
        value={initValue}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setTextFieldValue(
            validate?.(e.target.value) !== undefined
              ? validate?.(e.target.value)
              : e.target.value
          )
        }}
        inputProps={{
          tabIndex: -1,
        }}
        onBlur={saveTextFieldValue}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            saveTextFieldValue()
            e.preventDefault()
          }
        }}
        onFocus={() => setFocused(true)}
      />
    )
  }

interface ChangeFontButtonsProps {
  editor: Editor
}

export function ChangeFontButtons({ editor }: ChangeFontButtonsProps) {
  const [selectionCached, setSelectionCached] =
    React.useState<Editor['state']['selection']>()

  if (!isEqual(selectionCached, editor.state.selection)) {
    setSelectionCached(editor.state.selection)
  }

  const selection = React.useMemo(() => selectionCached, [selectionCached])

  React.useEffect(() => {
    const currentStyle = editor.getAttributes('textStyle')
    const paragraphStyle = editor.getAttributes('paragraph')

    if (!currentStyle.fontFamily) {
      editor
        .chain()
        .setFontFamily(paragraphStyle.fontFamily ?? DEFAULT_STYLE.fontFamily)
        .run()
    }
    if (!currentStyle.fontSize) {
      editor
        .chain()
        .setFontSize(
          paragraphStyle.fontSize ??
            `${wordUnitsToPx(
              getHeadingFontSize(getHeadingLevel(editor.state))
            )}px`
        )
        .run()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selection])

  const { fontSize, fontFamily } = editor.getAttributes('textStyle')

  return (
    <Grid container>
      <MenuButton
        icon="fontFamily"
        tooltip="Изменить шрифт"
        disabled={!editor.isEditable}
        childrenMenus={fonts.map((head, i) => (
          <MenuButton
            key={`ff-${i + 1}`}
            btnText={head}
            onClick={() => editor.chain().focus().setFontFamily(head).run()}
            vertical
          />
        ))}
        InputComponent={renderInput({
          value: fontFamily || DEFAULT_STYLE.fontFamily,
          isDisabled: true,
          isEditable: editor.isEditable,
        })}
      />
      <MenuButton
        icon="fontSize"
        tooltip="Изменить размер шрифта"
        disabled={!editor.isEditable}
        isFocused={editor.isFocused}
        childrenMenus={fontSizes.map((head, i) => (
          <MenuButton
            key={`fs-${i + 1}`}
            btnText={head}
            onClick={() =>
              editor
                .chain()
                .focus()
                .setFontSize(`${wordUnitsToPx(head)}px`)
                .run()
            }
            vertical
          />
        ))}
        InputComponent={renderInput({
          value: fontSize
            ? pxToWordUnits(parseInt(fontSize))
            : DEFAULT_STYLE.fontSize,
          isDisabled: false,
          isEditable: editor.isEditable,
          width: 7,
          update: (fontSizePx) => {
            editor
              .chain()
              .focus()
              .setFontSize(`${wordUnitsToPx(Math.min(+fontSizePx, 500))}px`)
              .run()
          },
          validate: (inputString: string) =>
            String(
              Math.min(Math.abs(parseInt(inputString.slice(0, 3))), 500) || ''
            ),
        })}
      />
    </Grid>
  )
}
