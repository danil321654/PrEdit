import { CustomImage } from '../Image'
import { MAX_SIZE_IMG } from '../../../constants'
import { Plugin, PluginKey } from 'prosemirror-state'
import { ReactNodeViewRenderer } from '@tiptap/react'
import { Editor, mergeAttributes, Node } from '@tiptap/core'

export type PasteImagesFn = (images: File[], editor: Editor) => Promise<void>

interface Options {
  HTMLAttributes: Record<string, any>
  pasteImages: PasteImagesFn
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    image: {
      /**
       * Add an image
       */
      addImage: (options: {
        src: string
        alt?: string
        title?: string
      }) => ReturnType
    }
  }
}

const CustomImageNode = Node.create<Options>({
  name: 'image',
  atom: true,
  draggable: true,
  inline: true,
  group: 'inline',
  addNodeView() {
    return ReactNodeViewRenderer(CustomImage)
  },
  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: 'unset',
      },
      height: {
        default: 'unset',
      },
      style: {
        default: {
          float: 'none',
        },
      },
    }
  },
  parseHTML() {
    return [
      {
        tag: 'img',
        getAttrs: (node: any) =>
          typeof node === 'string'
            ? {}
            : {
                src: node.src,
                width: node.width,
                height: node.height,
                style: node.style,
              },
      },
    ]
  },
  renderHTML({ HTMLAttributes }) {
    const style = HTMLAttributes.style
    const attrs = { ...HTMLAttributes }
    if (attrs.width === 0) {
      attrs.width = 'unset'
    }
    if (attrs.height === 0) {
      attrs.height = 'unset'
    }
    return [
      'img',
      mergeAttributes(
        style.float ? { ...attrs, style: `float: ${style.float};` } : attrs
      ),
    ]
  },
  addCommands() {
    return {
      addImage:
        ({ src }) =>
        ({ state, dispatch }) => {
          const { selection } = state
          const to = selection.ranges[0].$to.pos
          const node = this.type.create({ src, width: MAX_SIZE_IMG.WIDTH })
          const tr = state.tr.insert(to, node)
          return dispatch?.(tr)
        },
    }
  },
  addProseMirrorPlugins() {
    const { pasteImages } = this.options
    const editor = this.editor
    return [
      new Plugin({
        key: new PluginKey('imagePlugin'),
        props: {
          handleDOMEvents: {
            drop(_, e: Event) {
              if (!e.target) {
                return false
              }

              if ((e.target as HTMLElement).nodeName === 'CODE') {
                e.preventDefault()
              }

              return false
            },
            paste(_, event: Event) {
              const e = event as ClipboardEvent
              const hasFiles = e.clipboardData?.files?.length

              if (!hasFiles) return false

              const images = Array.from(e.clipboardData.files).filter((file) =>
                /image/i.test(file.type)
              )
              if (images.length === 0) return false

              e.preventDefault()

              pasteImages(images, editor)
              return true
            },
          },
          transformPastedHTML(html: string) {
            return html.replace(/<img.*?src="(http.*?)"[^\>]+>/g, '')
          },
        },
      }),
    ]
  },
})

export default CustomImageNode
