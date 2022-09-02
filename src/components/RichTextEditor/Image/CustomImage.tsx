/* eslint-disable max-lines */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import clsx from 'clsx'
import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  RefObject,
} from 'react'
import { Node } from 'prosemirror-model'
// import { useDispatch } from 'react-redux'
import { NodeViewWrapper } from '@tiptap/react'
import { MenuButton } from '../MenuBar/MenuButton'
import { Grid, makeStyles } from '@material-ui/core'
import { MAX_SIZE_IMG, MIN_SIZE_IMG } from '../../../constants'
// import { printFormImageMount, printFormImageUnmount } from '../../../actions'
import { convertToValidSize, cssToObj } from '../../../helpers'

const useStyles = makeStyles((theme) => ({
  customImage: {
    display: 'inline-flex',
    border: `${theme.spacing(0.25)}px solid ${theme.palette.grey[100]}`,
    position: 'relative',
    justifyContent: 'center',
  },
  imagePanel: {
    position: 'absolute',
    pointerEvents: 'none',
    minWidth: theme.spacing(17.5),
    background: theme.palette.background.default,
    border: `1px solid #dadada`,
    bottom: 0,
    transform: `translateY(${theme.spacing(6.25)}px)`,
    opacity: 0,
    transition: `transform 0.5s, opacity 0.5s`,
    zIndex: theme.zIndex.modal,
    '&.show': {
      transform: `translateY(${theme.spacing(4)}px)`,
      opacity: `1`,
      pointerEvents: `all`,
    },
  },
  separator: {
    borderLeft: 0,
    borderRight: '1px solid #dadada',
    cursor: 'default',
    margin: theme.spacing(0.25),
    padding: 0,
  },
  resizeDots: {
    position: 'absolute',
    pointerEvents: 'none',
    display: 'none',
    border: '2px dashed #a3a3a3',
    '&.show': {
      display: 'block',
    },
  },
  resizeDot: {
    width: theme.spacing(1.875),
    height: theme.spacing(1.875),
    backgroundColor: '#a3a3a3',
    border: `2px solid #6d6d6d`,
    position: `absolute`,
    margin: `auto`,
    pointerEvents: 'all',
  },
  topLeft: {
    top: -theme.spacing(0.25),
    left: -theme.spacing(0.25),
    cursor: 'nw-resize',
  },

  topRight: {
    top: -theme.spacing(0.25),
    right: -theme.spacing(0.25),
    cursor: 'ne-resize',
  },

  bottomLeft: {
    left: -theme.spacing(0.25),
    bottom: -theme.spacing(0.25),
    cursor: 'ne-resize',
  },

  bottomRight: {
    bottom: -theme.spacing(0.25),
    right: -theme.spacing(0.25),
    cursor: 'nw-resize',
  },

  imagePreview: {
    width: '100%',
    height: '100%',
    opacity: '0.3',
  },
}))

export interface CustomImageProps {
  node: Node
  deleteNode: () => void
  updateAttributes: (attrs: Record<string, any>) => void
}

type Side = 'bottom' | 'top' | 'right' | 'left'

export const CustomImage = ({
  node,
  deleteNode,
  updateAttributes,
}: CustomImageProps) => {
  const classes = useStyles()
  // const dispatch = useDispatch()

  const [showExpand, setShowExpand] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  const [floatMode, setFloatMode] = useState('inline')
  const [onDot, setOnDot] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const divExpandRef = useRef<HTMLImageElement>(null)
  // const isLinkOrBase64 =
  //   isBase64Image(node.attrs.src) || node.attrs.src.startsWith('http')
  const src = node.attrs.src

  const options = {
    width: undefined,
    height: undefined,
    style: {},
  }

  // useEffect(() => {
  //   if (!isLinkOrBase64) {
  //     dispatch(printFormImageMount(node.attrs.src))
  //   }
  //   return () => {
  //     if (!isLinkOrBase64) {
  //       dispatch(printFormImageUnmount(node.attrs.src))
  //     }
  //   }
  // }, [dispatch, isLinkOrBase64, node.attrs.src])

  if (node.attrs.width) {
    options['width'] = node.attrs.width
  }

  if (node.attrs.height) {
    options['height'] = node.attrs.height
  }

  const setNodeSizes = useCallback(
    (width: number | undefined, height: number | undefined) => {
      updateAttributes({
        width,
        height,
      })
    },
    [updateAttributes]
  )

  const getSizeDivExpand = () => {
    const el = divExpandRef.current
    const result: {
      height: number | undefined
      width: number | undefined
    } = { height: undefined, width: undefined }
    if (el) {
      result.width = parseInt(el.style.width || '0')
      result.height = parseInt(el.style.height || '0')
    }
    return result
  }

  const setSizeDivExpand = (width: number, height: number): void => {
    const el = divExpandRef.current
    if (el) {
      const { fixedWidth, fixedHeight } = convertToValidSize(width, height)
      el.style.height = `${fixedHeight}px`
      el.style.width = `${fixedWidth}px`
    }
  }

  useEffect(() => {
    if (imgRef.current) {
      const getAndSetImageSize = (ref: RefObject<HTMLImageElement>) => {
        const width = ref.current?.width ?? MAX_SIZE_IMG.WIDTH
        const height = ref.current?.height ?? MAX_SIZE_IMG.HEIGHT
        const { fixedWidth, fixedHeight } = convertToValidSize(width, height)
        setNodeSizes(fixedWidth, fixedHeight)
        setSizeDivExpand(fixedWidth, fixedHeight)
      }

      const passRef = () => getAndSetImageSize(imgRef)
      imgRef.current.onload = passRef
      const currentRef = imgRef.current
      return () => {
        currentRef.onload = null
        window.onmouseup = null
      }
    }
  }, [setNodeSizes])

  // Expand methods
  const expandDiagonal = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    mult = 1,
    sideA: Side,
    sideB: Side
  ) => {
    setShowPanel(false)
    setShowPreview(true)
    const oldX = e.clientX
    const oldY = e.clientY
    const oldWidth =
      node.attrs.width > 0 ? node.attrs.width : imgRef.current?.width
    const oldHeight =
      node.attrs.height > 0 ? node.attrs.height : imgRef.current?.height

    const ratio = oldWidth / oldHeight

    const el = divExpandRef.current
    if (el) {
      el.style.top = el.style.bottom = el.style.left = el.style.right = ''
      if (sideA) el.style[sideA] = '0px'
      if (sideB) el.style[sideB] = '0px'
    }

    window.onmousemove = ({ clientX, clientY }: MouseEvent) => {
      setShowExpand(true)
      if (clientX !== oldX) {
        const div = (oldX - clientX) * mult
        const widthNew = oldWidth + div
        const height = (oldWidth + div) / ratio
        if (widthNew > MIN_SIZE_IMG.WIDTH && height > MIN_SIZE_IMG.HEIGHT) {
          setSizeDivExpand(widthNew, height)
        }
      } else if (clientY !== oldY) {
        const div = (oldY - clientY) * mult
        const widthNew = (oldHeight + div) * ratio
        const height = oldHeight + div
        if (widthNew > MIN_SIZE_IMG.WIDTH && height > MIN_SIZE_IMG.HEIGHT) {
          setSizeDivExpand(widthNew, height)
        }
      }
    }

    window.onmouseup = () => {
      window.onmousemove = null
      const { height, width } = getSizeDivExpand()
      setNodeSizes(width, height)
      setShowPreview(false)
      setShowPanel(true)
    }
  }

  // Float methods
  const setFloatLeft = () => {
    updateAttributes({
      style: {
        float: 'left',
      },
    })
    setFloatMode('left')
  }

  const setFloatRight = () => {
    updateAttributes({
      style: {
        float: 'right',
      },
    })
    setFloatMode('right')
  }

  const setInline = () => {
    updateAttributes({
      style: {
        float: 'none',
      },
    })
    setFloatMode('inline')
  }

  const draggable = !onDot ? '' : null

  return (
    <NodeViewWrapper
      as="span"
      className={classes.customImage}
      data-drag-handle={draggable}
      onMouseEnter={() => {
        setShowExpand(true)
        setShowPanel(true)
      }}
      onMouseLeave={() => {
        setShowExpand(false)
        setShowPanel(false)
      }}
      style={
        typeof node.attrs.style === 'string'
          ? cssToObj(node.attrs.style)
          : node.attrs.style
      }
    >
      <img src={src} alt="" ref={imgRef} {...options} />
      <Grid
        container
        justify="center"
        alignItems="center"
        className={clsx(classes.imagePanel, {
          show: showPanel && !showPreview,
        })}
      >
        <MenuButton
          onClick={setInline}
          icon="justify"
          tooltip="В тексте"
          disabled={floatMode === 'inline'}
        />
        <MenuButton
          onClick={setFloatLeft}
          icon="left"
          tooltip="Обволакивание текста слева"
          disabled={floatMode === 'left'}
        />
        <MenuButton
          onClick={setFloatRight}
          icon="right"
          tooltip="Обволакивание текста справа"
          disabled={floatMode === 'right'}
        />
        <div className={classes.separator} />
        <MenuButton
          onClick={deleteNode}
          icon="cancel"
          tooltip="Удалить картинку"
        />
      </Grid>
      <div
        ref={divExpandRef}
        className={clsx(classes.resizeDots, { show: showExpand })}
      >
        {showPreview && (
          <img src={src} alt="" className={classes.imagePreview} />
        )}
        <div
          className={clsx(classes.resizeDot, classes.topLeft)}
          onMouseDown={(e) => expandDiagonal(e, 1, 'bottom', 'right')}
          onMouseEnter={() => setOnDot(true)}
          onMouseLeave={() => setOnDot(false)}
        />
        <div
          className={clsx(classes.resizeDot, classes.topRight)}
          onMouseDown={(e) => expandDiagonal(e, -1, 'bottom', 'left')}
          onMouseEnter={() => setOnDot(true)}
          onMouseLeave={() => setOnDot(false)}
        />
        <div
          className={clsx(classes.resizeDot, classes.bottomLeft)}
          onMouseDown={(e) => expandDiagonal(e, 1, 'top', 'right')}
          onMouseEnter={() => setOnDot(true)}
          onMouseLeave={() => setOnDot(false)}
        />
        <div
          className={clsx(classes.resizeDot, classes.bottomRight)}
          onMouseDown={(e) => expandDiagonal(e, -1, 'top', 'left')}
          onMouseEnter={() => setOnDot(true)}
          onMouseLeave={() => setOnDot(false)}
        />
      </div>
    </NodeViewWrapper>
  )
}
