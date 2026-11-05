/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
import { type DragEvent, useState } from 'react'

export type StripItem = {
  id: string // 稳定唯一 id，用作 key
  url: string // 预览地址（blob URL / 远程地址）
}

type Props = {
  items: StripItem[]
  maxImages?: number
  onRemove: (id: string) => void
  onMove: (fromIndex: number, toIndex: number) => void
  onAddMore: () => void // 父组件负责触发 file input
}

export function ThumbnailStrip({
  items,
  maxImages = 9,
  onRemove,
  onMove,
  onAddMore,
}: Props) {
  // 拖拽源索引；用 null 表示"无"
  const [dragSrc, setDragSrc] = useState<number | null>(null)
  // 当前悬停的目标索引，用于高亮
  const [dropTarget, setDropTarget] = useState<number | null>(null)

  const handleDragStart = (e: DragEvent<HTMLDivElement>, index: number) => {
    setDragSrc(index)
    e.dataTransfer.effectAllowed = 'move'
    try {
      e.dataTransfer.setData('text/plain', String(index))
    } catch {
      /* 某些浏览器/环境不支持，忽略 */
    }
  }

  const handleDragEnd = () => {
    setDragSrc(null)
    setDropTarget(null)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    if (dragSrc !== null && dragSrc !== index) {
      setDropTarget(index)
    }
  }

  const handleDragLeave = (index: number) => {
    // 只在离开的是当前目标时清除，避免子元素冒泡误清
    setDropTarget((cur) => (cur === index ? null : cur))
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault()
    setDropTarget(null)
    if (dragSrc === null || dragSrc === index) return
    onMove(dragSrc, index)
    setDragSrc(null)
  }

  const canAddMore = items.length > 0 && items.length < maxImages

  return (
    <div className="strip">
      {items.map((item, i) => {
        const isDragging = dragSrc === i
        const isDropTarget = dropTarget === i

        const className = [
          'thumb',
          isDragging && 'dragging',
          isDropTarget && 'drop-target',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <div
            key={item.id}
            className={className}
            draggable
            data-index={i}
            onDragStart={(e) => handleDragStart(e, i)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragLeave={() => handleDragLeave(i)}
            onDrop={(e) => handleDrop(e, i)}
          >
            <img src={item.url} alt={`图片 ${i + 1}`} />

            <span className="idx">{i + 1}</span>

            <button
              type="button"
              className="remove"
              title="移除"
              onClick={(e) => {
                e.stopPropagation()
                onRemove(item.id)
              }}
            >
              ×
            </button>

            <div className="move">
              <button
                type="button"
                title="左移"
                onClick={(e) => {
                  e.stopPropagation()
                  onMove(i, i - 1)
                }}
              >
                ←
              </button>
              <button
                type="button"
                title="右移"
                onClick={(e) => {
                  e.stopPropagation()
                  onMove(i, i + 1)
                }}
              >
                →
              </button>
            </div>
          </div>
        )
      })}

      {canAddMore && (
        <button
          type="button"
          className="thumb add-more"
          title="继续添加图片"
          onClick={onAddMore}
        >
          +
        </button>
      )}
    </div>
  )
}
