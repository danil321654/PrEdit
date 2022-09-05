import React, { useState } from 'react'
import { Editor } from '@tiptap/core'
import { AddImageModal } from './AddImageModal'
import { MenuButton } from '../MenuBar/MenuButton'

interface Props {
  editor: Editor
}

export function AddImageButton({ editor }: Props) {
  const [isOpen, setOpen] = useState(false)
  const toggleDialog = () => setOpen((state) => !state)
  return (
    <>
      <AddImageModal
        isOpen={isOpen}
        onClose={toggleDialog}
        addImage={(url: string) => {
          if (url && editor) {
            editor.chain().focus().addImage({ src: url }).run()
          }
        }}
      />
      <MenuButton
        icon="image"
        onClick={editor.isEditable ? toggleDialog : undefined}
        disabled={!editor.isEditable}
        tooltip="Вставить изображение"
      />
    </>
  )
}
