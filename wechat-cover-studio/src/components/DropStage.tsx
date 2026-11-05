/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */

import { useRef, useState } from 'react'

type Props = {
  items: unknown[]
  children: React.ReactNode
  onFiles: (files: FileList) => void // ⬅️ 对应 addFiles
  id?: string
}

export function DropStage({ items, children, onFiles }: Props) {
  const dragDepth = useRef(0)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragEnter = (e: React.DragEvent) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault()
      dragDepth.current += 1
      setIsDragOver(true)
    }
  }

  const handleDragover = (e: React.DragEvent) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  }
  const handleDragLeave = (_e: React.DragEvent) => {
    dragDepth.current = Math.max(0, dragDepth.current - 1)
    if (dragDepth.current === 0) setIsDragOver(false)
  }
  const handleDrop = (e: React.DragEvent) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault()
      dragDepth.current = 0
      setIsDragOver(false)
      onFiles(e.dataTransfer.files)
    }
  }

  const className = [
    'stage',
    items.length > 0 && 'has-image',
    isDragOver && 'dragover',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={className}
      id="stage"
      onDragEnter={(event) => handleDragEnter(event)}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragover}
      onDrop={handleDrop}
    >
      {children}
    </div>
  )
}
