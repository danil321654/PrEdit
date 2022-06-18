import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

const showInvisibleBorder = (doc: ProseMirrorNode) => {
  const decorations: Decoration[] = []

  doc.descendants((node, pos: number) => {
    if (
      node.type.name !== 'table' ||
      (node.content as any).content.some((row: ProseMirrorNode) =>
        (row.content as any).content.some(
          (cell: ProseMirrorNode) => cell.attrs.borderColor !== '#ffffff'
        )
      )
    ) {
      return
    }

    decorations.push(
      Decoration.node(pos, pos + node.nodeSize, {
        nodeName: 'div',
        class: 'invisibleTable',
      })
    )
  })

  return DecorationSet.create(doc, decorations)
}

export const TableShowInvisibleBorder = Extension.create({
  name: 'table-invisible-border',
  addProseMirrorPlugins() {
    const key = new PluginKey('customBorder')
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => showInvisibleBorder(doc),
          apply: (tr, _) => (tr.docChanged ? showInvisibleBorder(tr.doc) : _),
        },
        props: {
          decorations: (state) => key.getState(state),
        },
      }),
    ]
  },
})
