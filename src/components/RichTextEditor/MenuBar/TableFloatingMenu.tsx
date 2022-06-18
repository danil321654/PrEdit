import React from 'react'
import { Editor } from '@tiptap/core'
import { TableMenu } from './TableMenu'
import { TableFloatingMenuWrapper } from './TableFloatingMenuWrapper'

interface Props {
  editor: Editor
}

export function TableFloatingMenu({ editor }: Props) {
  return (
    <TableFloatingMenuWrapper
      editor={editor}
      shouldShow={({ editor: ed }) =>
        ed.isEditable && ed.isFocused && ed.isActive('table')
      }
      tippyOptions={{
        placement: 'right-start',
      }}
    >
      <TableMenu open editor={editor} showChevron={false} />
    </TableFloatingMenuWrapper>
  )
}
