import '@tiptap/extension-text-style'
import { Extension } from '@tiptap/core'
import { wordUnitsToPx } from '../../../utils'
import { DEFAULT_STYLE } from '../../../constants'

interface fontSizeOptions {
  types: string[]
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      /**
       * Set the font family
       */
      setFontSize: (fontSize: string) => ReturnType
      /**
       * Unset the font family
       */
      unsetFontSize: () => ReturnType
    }
  }
}

const FontSize = Extension.create<fontSizeOptions>({
  name: 'fontSize',

  defaultOptions: {
    types: ['textStyle'],
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {}
              }

              return {
                style: `font-size: ${attributes.fontSize};`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        fontSize =>
        ({ chain }) =>
          chain().setMark('textStyle', { fontSize }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain()
            .setMark('textStyle', { fontSize: null })
            .removeEmptyTextStyle()
            .run(),
    }
  },
  addKeyboardShortcuts() {
    return {
      Tab: () => {
        const { fontSize, fontFamily } = this.editor.getAttributes('textStyle')
        const attributes = {
          fontSize: fontSize ?? wordUnitsToPx(DEFAULT_STYLE.fontSize) + 'px',
          fontFamily: fontFamily ?? DEFAULT_STYLE.fontFamily,
        }
        return this.editor.commands.insertContent(
          `<span style="font-size: ${attributes.fontSize}; font-family: ${
            attributes.fontFamily
          };">${' '.repeat(4)}</span>`,
        )
      },
    }
  },
})

export default FontSize
