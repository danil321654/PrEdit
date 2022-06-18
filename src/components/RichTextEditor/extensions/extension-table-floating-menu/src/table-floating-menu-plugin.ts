import tippy, { Instance, Props } from 'tippy.js'
import { Editor } from '@tiptap/core'
import { EditorView } from 'prosemirror-view'
import { selectionCell } from '../../prosemirror-tables/src/util'
import { EditorState, Plugin, PluginKey } from 'prosemirror-state'

export interface TableFloatingMenuPluginProps {
  pluginKey: PluginKey | string
  editor: Editor
  element: HTMLElement
  tippyOptions?: Partial<Props>
  shouldShow?:
    | ((props: {
        editor: Editor
        view: EditorView
        state: EditorState
        oldState?: EditorState
      }) => boolean)
    | null
}

export type TableFloatingMenuViewProps = TableFloatingMenuPluginProps & {
  view: EditorView
}

export class TableFloatingMenuView {
  public editor: Editor

  public element: HTMLElement

  public view: EditorView

  public preventHide: boolean

  public tippy: Instance | undefined

  public tippyOptions?: Partial<Props>

  public shouldShow: Exclude<TableFloatingMenuPluginProps['shouldShow'], null> =
    ({ view, state }) => {
      const { selection } = state
      const { $anchor, empty } = selection
      const isRootDepth = $anchor.depth === 1
      const isEmptyTextBlock =
        $anchor.parent.isTextblock &&
        !$anchor.parent.type.spec.code &&
        !$anchor.parent.textContent

      if (!view.hasFocus() || !empty || !isRootDepth || !isEmptyTextBlock) {
        return false
      }

      return true
    }

  constructor({
    editor,
    element,
    view,
    tippyOptions = {},
    shouldShow,
  }: TableFloatingMenuViewProps) {
    this.preventHide = false
    this.editor = editor
    this.element = element
    this.view = view

    if (shouldShow) {
      this.shouldShow = shouldShow
    }

    this.element.addEventListener('mousedown', this.mousedownHandler, {
      capture: true,
    })
    this.editor.on('focus', this.focusHandler)
    this.editor.on('blur', this.blurHandler)
    this.tippyOptions = tippyOptions
    // Detaches menu content from its current parent
    // also causes error
    // this.element.remove()
    this.hide()
  }

  mousedownHandler = () => {
    this.preventHide = true
  }

  focusHandler = () => {
    // we use `setTimeout` to make sure `selection` is already updated
    setTimeout(() => this.update(this.editor.view))
  }

  blurHandler = ({ event }: { event: FocusEvent }) => {
    if (this.preventHide) {
      this.preventHide = false

      return
    }

    if (
      event?.relatedTarget &&
      this.element.parentNode?.contains(event.relatedTarget as Node)
    ) {
      return
    }

    this.hide()
  }

  createTooltip() {
    const { element: editorElement } = this.editor.options
    const editorIsAttached = !!editorElement.parentElement

    if (this.tippy || !editorIsAttached) {
      return
    }

    this.tippy = tippy((editorElement.firstChild as Element) ?? editorElement, {
      duration: 0,
      getReferenceClientRect: null,
      content: this.element,
      interactive: true,
      trigger: 'manual',
      placement: 'right-start',
      hideOnClick: 'toggle',
      ...this.tippyOptions,
    })
    // maybe we have to hide tippy on its own blur event as well
    if (this.tippy.popper.firstChild) {
      ;(this.tippy.popper.firstChild as HTMLElement).addEventListener(
        'blur',
        event => {
          this.blurHandler({ event })
        },
      )
    }
  }

  update(view: EditorView, oldState?: EditorState) {
    const { state } = view
    const { doc, selection } = state
    const $pos = selectionCell(state)
    if (!$pos) {
      return
    }
    const isSame = oldState?.doc.eq(doc) && oldState.selection.eq(selection)

    if (isSame) {
      return
    }

    this.createTooltip()

    const shouldShow = this.shouldShow?.({
      editor: this.editor,
      view,
      state,
      oldState,
    })
    if (!shouldShow) {
      this.hide()
      this.tippy?.setProps({
        getReferenceClientRect: null,
      })
      return
    }
    this.tippy?.setProps({
      getReferenceClientRect: () => {
        const parentTableRow = view
          .domAtPos(selection.$anchor.pos)
          .node.parentElement?.closest('tr') as Element
        return parentTableRow.getBoundingClientRect()
      },
    })

    this.show()
  }

  show() {
    this.element.style.visibility = 'visible'
    this.tippy?.show()
  }

  hide() {
    this.element.style.visibility = 'hidden'
    this.tippy?.hide()
  }

  destroy() {
    this.tippy?.destroy()
    this.element.removeEventListener('mousedown', this.mousedownHandler, {
      capture: true,
    })
    this.editor.off('focus', this.focusHandler)
    this.editor.off('blur', this.blurHandler)
  }
}

export const TableFloatingMenuPlugin = (
  options: TableFloatingMenuPluginProps,
) => {
  return new Plugin({
    key:
      typeof options.pluginKey === 'string'
        ? new PluginKey(options.pluginKey)
        : options.pluginKey,
    view: view => new TableFloatingMenuView({ view, ...options }),
  })
}
