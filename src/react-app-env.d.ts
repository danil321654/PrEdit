// / <reference types="react-scripts" />

declare module '*.png'

declare module '*.svg' {
  import React = require('react')
  export const ReactComponent: React.SFC<React.SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

declare module 'react-file-viewer' {
  import React = require('react')
  const FileViewer: React.FC<{
    filePath: string
    fileType: string
    onError: (e: Error) => void
  }>

  export default FileViewer
}
