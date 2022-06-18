import { Node, mergeAttributes } from '@tiptap/core'
import { wordUnitsToPx } from '../../../../../utils'
import { DEFAULT_STYLE } from '../../../../../constants'
import { setAttr, isInTable } from '../../prosemirror-tables/src'

export interface ParagraphOptions {
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    paragraph: {
      /**
       * Toggle a paragraph
       */
      setParagraph: () => ReturnType
    }
    lineHeight: {
      setLineHeight: (lineHeight: number, fontSize?: string) => ReturnType
    }
  }
}

export const Paragraph = Node.create<ParagraphOptions>({
  name: 'paragraph',

  priority: 1000,

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },
  addAttributes() {
    const DefaultFontSizePx = wordUnitsToPx(DEFAULT_STYLE.fontSize) + 'px'
    return {
      fontSize: {
        default: DefaultFontSizePx,
        parseHTML: (element) =>
          element.style.fontSize ? element.style.fontSize : DefaultFontSizePx,
        renderHTML: ({}) => ({}),
      },
      fontFamily: {
        default: DEFAULT_STYLE.fontFamily,
        parseHTML: (element) =>
          element.style.fontFamily
            ? element.style.fontFamily
            : DEFAULT_STYLE.fontFamily,
        renderHTML: ({}) => ({}),
      },
      lineHeight: {
        default: DEFAULT_STYLE.lineHeight,
        parseHTML: (element) =>
          element.style.lineHeight
            ? element.style.lineHeight
            : DEFAULT_STYLE.lineHeight,
        renderHTML: ({}) => ({}),
      },
      style: {
        default: '',
        renderHTML: ({ lineHeight, fontSize, fontFamily, textAlign }) => ({
          style: `line-height: ${lineHeight}; font-size: ${fontSize}; font-family: ${fontFamily}, text-align: ${textAlign}`,
        }),
      },
    }
  },

  group: 'block',

  content: 'inline*',

  parseHTML() {
    return [{ tag: 'p' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'p',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      0,
    ]
  },

  addCommands() {
    return {
      setParagraph:
        () =>
        ({ commands }) => {
          return commands.setNode(this.name)
        },
      setLineHeight:
        (lineHeight: number) =>
        ({ tr, state, dispatch }) => {
          if (isInTable(state) || !dispatch) return false

          const { $from, $to } = state.selection

          state.doc.nodesBetween($from.pos, $to.pos, (node, pos) => {
            if (node.type.name !== 'paragraph') return
            tr.setNodeMarkup(
              pos,
              undefined,
              setAttr(node.attrs, 'lineHeight', lineHeight)
            )
          })

          return dispatch(tr)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Alt-0': () => this.editor.commands.setParagraph(),
    }
  },
})
