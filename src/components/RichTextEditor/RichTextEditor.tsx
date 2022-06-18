import React from 'react'
import MenuBar from './MenuBar'
import Link from '@tiptap/extension-link'
import StarterKit from '@tiptap/starter-kit'
import TableRow from '@tiptap/extension-table-row'
import Subscript from '@tiptap/extension-subscript'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import FontFamily from '@tiptap/extension-font-family'
import Superscript from '@tiptap/extension-superscript'
import { useApiContext } from '../../contexts'
import { Color } from '@tiptap/extension-color'
import { Grid, makeStyles, Theme } from '@material-ui/core'
import { TableFloatingMenu } from './MenuBar/TableFloatingMenu'
import { useEditor, EditorContent, EditorEvents } from '@tiptap/react'
import { pasteImages, prepareForEditor, styleTextNodes } from '../../utils'
import {
  BulletList,
  FontSize,
  Highlight,
  ImageExtension,
  ListItem,
  ListItemMarker,
  OrderedList,
  Paragraph,
  ParagraphVerticalAlign,
  Table,
  TableCell,
  TableHeader,
  TableShowInvisibleBorder,
} from './extensions'

const EDITOR_EXTENSIONS = [
  StarterKit.configure({
    listItem: false,
    paragraph: false,
    orderedList: false,
    bulletList: false,
  }),
  ListItem,
  ListItemMarker,
  FontSize,
  Paragraph,
  TextStyle,
  Color,
  Underline,
  Highlight.configure({ multicolor: true }),
  Link.configure({
    openOnClick: false,
  }),
  FontFamily.configure({ types: ['textStyle'] }),
  BulletList,
  OrderedList,
  ParagraphVerticalAlign,
  Superscript,
  Subscript,
  Table.configure({
    resizable: true,
  }),
  TableRow,
  TableCell,
  TableHeader,
  TableShowInvisibleBorder,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
]

const useStyles = makeStyles<Theme, Partial<RichTextEditorProps>>((theme) => ({
  container: {
    height: '100%',
    flexWrap: 'nowrap',
  },
  richTextEditor: {
    width: '100%',
    flexGrow: 1,
  },
  editorContainer: {
    flexGrow: 1,
  },
  editorContent: {
    height: '100%',
    flexGrow: 1,
    width: '100%',
    overflow: 'auto',
    '& .ProseMirror': {
      margin: '0 auto',
      maxWidth: theme.spacing(85),
      height: '60vh',
      width: '100%',
      padding: '40px 0',
      '& * + *': {
        marginBottom: 0,
      },
      '& h1, h2, h3, h4, h5, h6': {
        lineHeight: 1.1,
        marginBottom: 0,
      },
      '& .tableWrapper': {
        width: '100%',
      },
      '& .invisibleTable td,th': {
        borderColor: 'lightgray !important',
      },
      '& table': {
        overflow: 'hidden',
        border: 'none',
      },
      '& .column-resize-handle': {
        position: 'absolute',
        right: -2,
        top: 0,
        bottom: 0,
        width: 4,
        zIndex: 20,
        backgroundColor: '#adf',
        pointerEvents: 'none',
      },
      '& td,th': {
        padding: `0 ${theme.spacing(0.75)}px`,
        pointerEvents: (props) => (props.editable ? 'all' : 'none'),
        wordBreak: 'break-word',
        '> *': {
          pointerEvents: 'all',
        },
        '&.selectedCell': {
          background: theme.palette.primary.light,
        },
        '& p': {
          marginBlockStart: '13px',
          marginBlockEnd: '13px',
        },
      },
      '&:focus': {
        outline: 'none',
      },
      '& code': {
        backgroundColor: 'rgba(97, 97, 97, 0.153)',
      },
      '& ul': {
        padding: `0 ${theme.spacing(2)}px`,
      },
      '& ol': {
        padding: `0 ${theme.spacing(2)}px`,
      },
      '& li': {
        listStyleType: 'none',
      },
      '& p': {
        margin: 0,
      },
    },
  },
}))

export interface RichTextEditorProps {
  className?: string
  onUpdate: (_arg0: string) => void
  editable: boolean
  setIsEmptyEditor: (IsEmpty: boolean) => void
}

export const RichTextEditor = ({
  className = '',
  onUpdate,
  editable,
  setIsEmptyEditor,
}: RichTextEditorProps) => {
  const { apiClient } = useApiContext()
  const editor = useEditor({
    extensions: [
      ...EDITOR_EXTENSIONS,
      ImageExtension.configure({
        pasteImages: pasteImages(apiClient),
      }),
    ],
    content: '' ? prepareForEditor('') : '',
    onUpdate: ({ editor: ed }: EditorEvents['update']) => {
      onUpdate(ed.getHTML())
    },
    parseOptions: {
      preserveWhitespace: 'full',
    },
    editorProps: {
      transformPasted: styleTextNodes,
    },
  })
  const classes = useStyles({ editable })

  React.useEffect(() => {
    setIsEmptyEditor(!!editor?.isEmpty)
  }, [editor?.isEmpty, setIsEmptyEditor])

  React.useEffect(() => {
    editor?.setEditable(editable)
  }, [editor, editable])

  if (!editor) {
    return null
  }

  return (
    <Grid container wrap="nowrap" direction="column" className={className}>
      <MenuBar editor={editor} />
      <Grid container className={classes.container}>
        <EditorContent editor={editor} className={classes.editorContent} />
        <TableFloatingMenu editor={editor} />
      </Grid>
    </Grid>
  )
}
