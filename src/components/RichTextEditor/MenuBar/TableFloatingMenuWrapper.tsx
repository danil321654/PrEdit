import clsx from 'clsx'
import React, { useLayoutEffect, useRef } from 'react'
import { Optional } from '../../../types'
import { makeStyles } from '@material-ui/core'
import {
  TableFloatingMenuPlugin,
  TableFloatingMenuPluginProps,
} from '../extensions/extension-table-floating-menu/src'

const useStyles = makeStyles(() => ({
  hidden: {
    visibility: 'hidden',
  },
}))

export type TableFloatingMenuWrapperProps = Omit<
  Optional<TableFloatingMenuPluginProps, 'pluginKey'>,
  'element'
> & {
  className?: string
  children: React.ReactNode
}

export const TableFloatingMenuWrapper: React.FC<
  TableFloatingMenuWrapperProps
> = (props) => {
  const classes = useStyles()
  const element = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!element.current) {
      return
    }

    const {
      pluginKey = 'tableFloatingMenu',
      editor,
      tippyOptions = {},
      shouldShow = null,
    } = props

    editor.registerPlugin(
      TableFloatingMenuPlugin({
        pluginKey,
        editor,
        element: element.current as HTMLElement,
        tippyOptions,
        shouldShow,
      })
    )

    return () => {
      editor.unregisterPlugin(pluginKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.editor, element.current])

  return (
    <div ref={element} className={clsx(classes.hidden, props.className)}>
      {props.children}
    </div>
  )
}
