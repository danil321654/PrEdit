import { Extension } from '@tiptap/core'
import { wordUnitsToPx } from '../../../utils'
import { Plugin, PluginKey } from 'prosemirror-state'
import { DEFAULT_FONT_SIZE } from '../../../constants'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

const alignParagraph = (doc: ProseMirrorNode) => {
  const decorations: Decoration[] = []

  doc.descendants((node: ProseMirrorNode, pos: number, parent) => {
    if (
      !parent ||
      parent.type.name === 'tableCell' ||
      node.type.name !== 'paragraph'
    ) {
      return
    }

    let fontSize = +wordUnitsToPx(DEFAULT_FONT_SIZE).replace('px', '')
    ;(node.content as unknown as ProseMirrorNode).content?.forEach((match) => {
      const fontSizeMark = match.marks.find((mark) => mark.attrs?.fontSize)
        ?.attrs?.fontSize
      if (!fontSizeMark) return
      const numberValue = +fontSizeMark.replace('px', '')
      fontSize = Math.max(numberValue, fontSize)
    })
    const margin = (fontSize * node.attrs.lineHeight) / 2
    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        nodeName: 'div',
        style: `display:${
          parent.type.name === 'listItem' ? 'inline-block' : 'block'
        }; margin-top: ${-(margin - 13)}px; margin-bottom: ${margin + 13}px`,
      })
    )
  })

  return DecorationSet.create(doc, decorations)
}

export const ParagraphVerticalAlign = Extension.create({
  name: 'paragraph-vertical-align',
  addProseMirrorPlugins() {
    const key = new PluginKey('customAligner')
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => alignParagraph(doc),
          apply: (tr, _) => (tr.docChanged ? alignParagraph(tr.doc) : _),
        },
        props: {
          decorations: (state) => key.getState(state),
        },
      }),
    ]
  },
})
