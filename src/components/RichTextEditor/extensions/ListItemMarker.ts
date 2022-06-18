import { Extension } from '@tiptap/core'
import { DEFAULT_STYLE } from '../../../constants'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Node as ProseMirrorNode } from 'prosemirror-model'
import { Decoration, DecorationSet } from 'prosemirror-view'

const styleMarker = (doc: ProseMirrorNode) => {
  const decorations: Decoration[] = []

  doc.descendants((listNode: ProseMirrorNode, listNodePos: number) => {
    const isBulletList = listNode.type.name === 'bulletList'
    const isOrderedList = listNode.type.name === 'orderedList'
    if (isBulletList && isOrderedList) {
      return
    }
    let marker = isOrderedList ? 0 : '•'
    listNode.descendants((listItem: ProseMirrorNode, listItemPos: number) => {
      if (listItem.type.name !== 'listItem') {
        return
      }
      let inserted = false
      listItem.descendants((textNode: ProseMirrorNode, textNodePos: number) => {
        if (inserted || textNode.type.name !== 'text') {
          return
        }
        const mark = textNode.marks.find(
          (nodeMark) => nodeMark.type.name === 'textStyle'
        )
        if (mark) {
          if (isOrderedList) {
            marker = +marker + 1
          }
          const widget = document.createElement('span')
          widget.innerText = isOrderedList ? `${marker}. ` : `${marker}\t`
          for (const styleProp in mark.attrs) {
            const styleRule = styleProp as keyof typeof DEFAULT_STYLE
            widget.style[styleRule] = String(mark.attrs[styleRule])
          }
          decorations.push(
            Decoration.widget(
              listNodePos + listItemPos + textNodePos + 1,
              widget
            )
          )
          inserted = true
        }
      })
    })
  })

  return DecorationSet.create(doc, decorations)
}

export const ListItemMarker = Extension.create({
  name: 'list-item-marker',
  addProseMirrorPlugins() {
    const key = new PluginKey('customMarker')
    return [
      new Plugin({
        key,
        state: {
          init: (_, { doc }) => styleMarker(doc),
          apply: (tr, _) => (tr.docChanged ? styleMarker(tr.doc) : _),
        },
        props: {
          decorations: (state) => key.getState(state),
        },
      }),
    ]
  },
})
