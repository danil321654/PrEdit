import { Extension } from '@tiptap/core'
import {
  TableFloatingMenuPlugin,
  TableFloatingMenuPluginProps,
} from './table-floating-menu-plugin'

export type TableFloatingMenuOptions = Omit<
  TableFloatingMenuPluginProps,
  'editor' | 'element'
> & {
  element: HTMLElement | null
}

export const TableFloatingMenu = Extension.create<TableFloatingMenuOptions>({
  name: 'tableFloatingMenu',

  addOptions() {
    return {
      element: null,
      tippyOptions: {},
      pluginKey: 'tableFloatingMenu',
      shouldShow: null,
    }
  },

  addProseMirrorPlugins() {
    if (!this.options.element) {
      return []
    }

    return [
      TableFloatingMenuPlugin({
        pluginKey: this.options.pluginKey,
        editor: this.editor,
        element: this.options.element,
        tippyOptions: this.options.tippyOptions,
        shouldShow: this.options.shouldShow,
      }),
    ]
  },
})
