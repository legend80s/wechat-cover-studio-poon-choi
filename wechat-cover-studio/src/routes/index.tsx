/** biome-ignore-all lint/a11y/noSvgWithoutTitle: <explanation> */
/** biome-ignore-all lint/suspicious/useIterableCallbackReturn: <explanation> */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: <explanation> */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: <explanation> */
/** biome-ignore-all lint/complexity/useOptionalChain: <explanation> */
/** biome-ignore-all lint/a11y/useButtonType: <explanation> */
import { createFileRoute } from '@tanstack/react-router'
import { useCallback, useEffect, useRef, useState } from 'react'
import { DropStage } from '#/components/DropStage'
import { FitModeToggle } from '#/components/FitModeToggle'
import { GapColorPicker } from '#/components/GapColorPicker'
import { ThumbnailStrip } from '#/components/ThumbnailStrip'
import { useToast } from '#/hooks/useToast'
import { type Cell, drawImageToCell, type FitMode } from '#/lib/draw'
import { type ImageItem, isImageFile, loadImageFromFile } from '#/lib/file'

import './index.css'
import { VerticalSeparator } from '#/components/VerticalSeparator'
import { config } from '#/lib/config'

export const Route = createFileRoute('/')({
  component: App,
})

const { COVER_W, COVER_H, GAP, GAP_COLOR: BG_COLOR, JPEG_QUALITY } = config

function App() {
  // ---------- Constants ----------

  const THUMB_SIZE = 383
  const MAX_IMAGES = 6
  // const BG_COLOR = '#ffffff'

  // console.log('I am here!')

  // ---------- State ----------
  const [items, setItems] = useState<ImageItem[]>([])
  const [gapColor, setGapColor] = useState<string>(BG_COLOR)
  const [fitMode, setFitMode] = useState<FitMode>('cover')

  // let dragSrcIndex = -1

  // ---------- DOM ----------
  // const stage = document.getElementById('stage')
  // const canvas = document.getElementById('preview')
  const previewRef = useRef<HTMLCanvasElement>(null)

  // const dropzone = document.getElementById('dropzone')
  // const strip = document.getElementById('strip')
  // const fileInput = document.getElementById('fileInput')
  const fileInputRef = useRef<HTMLInputElement>(null)
  // const fileInput = fileInputRef.current

  // const dlCover = document.getElementById('dlCover')
  // const dlThumb = document.getElementById('dlThumb')
  // const clearAll = document.getElementById('clearAll')
  // const toasts = document.getElementById('toasts')

  // canvas.addEventListener('click', () => {
  //   if (items.length > 0 && items.length < MAX_IMAGES) fileInput.click()
  // })

  // ---------- Toast ----------
  const { containerRef, toast } = useToast()

  // ---------- Preview canvas sizing (DPR-aware) ----------
  // function sizePreviewCanvas() {
  //   const dpr = window.devicePixelRatio || 1
  //   const rect = canvas.getBoundingClientRect()
  //   const cssW = rect.width || COVER_W
  //   const cssH = rect.height || COVER_H
  //   canvas.width = Math.round(cssW * dpr)
  //   canvas.height = Math.round(cssH * dpr)
  // }

  // ---------- Render the composed cover onto a given ctx at a given size ----------
  const composeOnto = useCallback(
    (targetCtx: CanvasRenderingContext2D, targetW: number, targetH: number) => {
      const scale = targetW / COVER_W
      console.log('COVER_W:', COVER_W)
      targetCtx.fillStyle = gapColor
      targetCtx.fillRect(0, 0, targetW, targetH)

      if (items.length === 0) return

      const cells = getCells(items.length)
      for (let i = 0; i < items.length; i++) {
        drawImageToCell(targetCtx, items[i].img, cells[i], scale, fitMode)
      }
    },
    [items, gapColor, fitMode],
  )

  // ---------- Mutations ----------
  const handleMove = (from: number, to: number) => {
    setItems((prev) => {
      if (to < 0 || to >= prev.length) return prev // 边界直接忽略
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      return next
    })
  }

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const target = prev.find((x) => x.id === id)
      if (target) URL.revokeObjectURL(target.url)
      return prev.filter((x) => x.id !== id)
    })
  }

  function handleClearAllClick() {
    items.forEach((it) => {
      URL.revokeObjectURL(it.url)
    })
    setItems([])
  }

  const addFiles = useCallback(
    async (files: File[] | null) => {
      // const files = Array.from(fileList || [])
      if (!files || files.length === 0) return

      // Determine capacity
      const room = MAX_IMAGES - items.length
      if (room <= 0) {
        toast(`最多 ${MAX_IMAGES} 张，已忽略 ${files.length} 张`)
        return
      }

      // Filter to images first
      const imageFiles = files.filter(isImageFile)
      const nonImageCount = files.length - imageFiles.length
      if (nonImageCount > 0) {
        toast(`已跳过 ${nonImageCount} 个非图片文件`)
      }
      if (imageFiles.length === 0) return

      // Enforce cap
      let toLoad = imageFiles
      let overflow = 0
      if (imageFiles.length > room) {
        toLoad = imageFiles.slice(0, room)
        overflow = imageFiles.length - room
      }
      if (overflow > 0) {
        toast(`最多 ${MAX_IMAGES} 张，已忽略 ${overflow} 张`)
      }

      // Show spinner-ish state via toast? Keep it simple: load with brief cursor wait.
      const prevCursor = document.body.style.cursor
      document.body.style.cursor = 'progress'

      // Decode sequentially to preserve drop order and avoid blocking
      const loaded: ImageItem[] = []
      for (const f of toLoad) {
        try {
          loaded.push(await loadImageFromFile(f))
        } catch (_) {
          toast(`无法读取图片：${f.name || '未命名'}`)
        }
      }
      document.body.style.cursor = prevCursor

      if (loaded.length === 0) return
      setItems((items) => items.concat(loaded))
    },
    [toast, items.length],
  )

  // ---------- Export helpers ----------
  function makeExportCanvas() {
    const c = document.createElement('canvas')
    c.width = COVER_W
    c.height = COVER_H
    const cx = c.getContext('2d')

    if (!cx) throw new Error('no canvas context')

    composeOnto(cx, COVER_W, COVER_H)
    return c
  }

  function makeThumbCanvas() {
    const cover = makeExportCanvas()
    const c = document.createElement('canvas')
    c.width = THUMB_SIZE
    c.height = THUMB_SIZE
    const cx = c.getContext('2d')
    if (!cx) throw new Error('no canvas context')
    cx.fillStyle = gapColor
    cx.fillRect(0, 0, THUMB_SIZE, THUMB_SIZE)
    // Center-crop the cover: take THUMB_SIZE x THUMB_SIZE window centered.
    const sx = (COVER_W - THUMB_SIZE) / 2
    const sy = (COVER_H - THUMB_SIZE) / 2
    cx.drawImage(
      cover,
      sx,
      sy,
      THUMB_SIZE,
      THUMB_SIZE,
      0,
      0,
      THUMB_SIZE,
      THUMB_SIZE,
    )
    return c
  }

  function downloadCanvas(c: HTMLCanvasElement, filename: string) {
    console.log('JPEG_QUALITY:', JPEG_QUALITY)
    c.toBlob(
      (blob) => {
        if (!blob) {
          toast('导出失败')
          return
        }
        const a = document.createElement('a')
        a.href = URL.createObjectURL(blob)
        a.download = filename
        document.body.appendChild(a)
        a.click()
        a.remove()
        setTimeout(() => URL.revokeObjectURL(a.href), 2000)
      },
      'image/jpeg',
      JPEG_QUALITY,
    )
  }

  // ---------- Event wiring ----------
  const [fileInputValue, setFileInputValue] = useState('')
  // @ts-expect-error
  const handleDropzoneClick = () => fileInputRef.current.click()
  const onFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>,
  ) => {
    addFiles(Array.from(e.target.files || []))
    // fileInput.value = '' // allow re-selecting same file
    setFileInputValue('')
  }

  // Whole-page drag & drop (so dropping anywhere in the stage works)
  // let dragDepth = 0

  useEffect(() => {
    const handler = (e: DragEvent) => {
      if (
        e.dataTransfer &&
        Array.from(e.dataTransfer.types).includes('Files')
      ) {
        e.preventDefault()
      }
    }

    const events = ['dragenter', 'dragover'] as const
    events.forEach((ev) => window.addEventListener(ev, handler))

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, handler))
    }
  }, [])

  // Paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const itemsInClip = e.clipboardData && e.clipboardData.items
      if (!itemsInClip) return

      const files: File[] = []
      for (const it of itemsInClip) {
        if (it.kind === 'file') {
          const f = it.getAsFile()
          if (f) files.push(f)
        }
      }

      if (files.length) {
        e.preventDefault()
        addFiles(files)
      }
    }

    // console.log('window:', window)

    window.addEventListener('paste', handlePaste)
    return () => window.removeEventListener('paste', handlePaste)
  }, [addFiles])

  /**
   *
   * @returns {string}
   * @example wechat_cover_yyyy_MM_dd_HH_mm_ss_ms.jpg'
   */
  const genFilename = () => {
    // wechat_cover_2026_10_30_10_21_15_678.jpg
    const date = new Date()
    return `wechat_cover_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}_${date.getHours()}_${date.getMinutes()}_${date.getSeconds()}_${date.getMilliseconds()}.jpg`
  }

  // Buttons
  const handleDlCoverClick = () => {
    if (!items.length) return
    downloadCanvas(makeExportCanvas(), 'wechat-cover-900x383.jpg')
  }
  const handleDlThumbClick = () => {
    if (!items.length) return
    downloadCanvas(makeThumbCanvas(), 'wechat-cover-thumbnail-383x383.jpg')
  }
  // clearAll.addEventListener('click', clearAllItems)

  // Resize → re-render at new DPR/size
  // window.addEventListener('resize', () => {
  //   // Only re-render if we have images (or even empty state to keep crisp)
  //   render()
  // })

  // ---------- Init ----------
  useEffect(() => {
    const canvas = previewRef.current
    if (!canvas) return

    // console.log('canvas:', canvas)
    const ctx = canvas.getContext('2d')
    // 某些上下文如 webgl 未创建成功时也是 null
    if (!ctx) return

    // Ensure canvas has proper CSS size for DPR calc
    const dpr = window.devicePixelRatio || 1
    const cssW = canvas.clientWidth || COVER_W
    const cssH = canvas.clientHeight || COVER_H
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    composeOnto(ctx, canvas.width, canvas.height)

    // Toggle state classes
    // stage.classList.toggle('has-image', items.length > 0)
    // dlCover.disabled =
    // dlThumb.disabled = items.length === 0
    // clearAll.disabled = items.length === 0
  }, [composeOnto]) // composeOnto 为何加入依赖数组，这其实是想要的行为：items 变了就该重绘

  return (
    <main className="page-wrap px-4 pb-8 pt-14 1">
      <div className="wrap">
        <h1>封面拼接工具</h1>
        {/* <h1>微信公众号封面拼接工具</h1> */}
        <p className="sub">
          {/* 拖入 1–6 张图片，自动拼接为 2.35:1 公众号封面（900×383），并生成 1:1 */}
          拖入 1–6 张图片，自动拼接为 <code>2.35:1</code> 封面（
          <code>
            {COVER_W}×{COVER_H}
          </code>
          ），并生成 <code>1:1</code> 缩略图
        </p>

        <DropStage
          items={items}
          id="stage"
          onFiles={(xs) => addFiles(Array.from(xs))}
        >
          <canvas ref={previewRef} id="preview"></canvas>
          <div
            className="dropzone"
            id="dropzone"
            onClick={() => handleDropzoneClick()}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            >
              <path
                d="M12 16V4m0 0L8 8m4-4l4 4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                strokeLinecap="round"
              />
            </svg>
            <span className="hint">拖入图片</span>
            <span className="subhint">或点击选择 · 支持粘贴 · 最多 6 张</span>
          </div>
        </DropStage>

        <input
          type="file"
          id="fileInput"
          ref={fileInputRef}
          onChange={(event) => onFileInputChange(event)}
          value={fileInputValue}
          accept="image/*"
          multiple
        />

        <ThumbnailStrip
          items={items}
          maxImages={MAX_IMAGES}
          onRemove={handleRemove}
          onMove={handleMove}
          onAddMore={() => fileInputRef.current?.click()}
        />

        <div className="actions items-center">
          <FitModeToggle value={fitMode} onChange={setFitMode} />

          <VerticalSeparator />

          <GapColorPicker
            presetColors={config.PRESETS}
            initialColor={BG_COLOR}
            onChange={setGapColor}
          />

          <VerticalSeparator />

          <button
            className="btn btn-primary"
            id="dlCover"
            disabled={items.length === 0}
            onClick={handleDlCoverClick}
          >
            下载封面
          </button>
          <button
            className="btn btn-secondary"
            id="dlThumb"
            disabled={items.length === 0}
            onClick={handleDlThumbClick}
          >
            下载缩略图
          </button>
          <div className="spacer"></div>
          <button
            className="btn btn-secondary"
            id="clearAll"
            disabled={items.length === 0}
            onClick={handleClearAllClick}
          >
            清空
          </button>
        </div>
      </div>

      <div id="toasts" ref={containerRef}></div>
    </main>
  )
}

// ---------- Layout: cell rects for n images ----------
// Returns array of {x,y,w,h} in cover coordinates, one per image (may be fewer
// than total cells when n is odd on a grid — e.g. 5 in 3×2 leaves one blank).
function getCells(n: number) {
  const W = COVER_W,
    H = COVER_H

  // Build raw grid cells, then inset each by G/2 on shared edges.
  // Outer edges are not inset (no outer margin).
  let cols: number
  let rows: number
  let raw: (Cell & { col: number; row: number })[] = []

  if (n <= 1) {
    return [{ x: 0, y: 0, w: W, h: H }]
  } else if (n === 2) {
    cols = 2
    rows = 1
  } else if (n === 3) {
    cols = 3
    rows = 1
  } else if (n === 4) {
    cols = 2
    rows = 2
  } else {
    cols = 3
    rows = 2 // 5 or 6
  }

  // Raw equal cells
  const cw = W / cols
  const ch = H / rows
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      raw.push({ x: c * cw, y: r * ch, w: cw, h: ch, col: c, row: r })
    }
  }

  // For 5 images, drop the last cell (bottom-right) — leave blank.
  if (n === 5) raw = raw.slice(0, 5)

  // Inset each cell by G/2 on edges shared with a neighbor.
  return raw.map((cell) => {
    const left = cell.col > 0 ? GAP / 2 : 0
    const right = cell.col < cols - 1 ? GAP / 2 : 0
    const top = cell.row > 0 ? GAP / 2 : 0
    const bottom = cell.row < rows - 1 ? GAP / 2 : 0
    return {
      x: cell.x + left,
      y: cell.y + top,
      w: cell.w - left - right,
      h: cell.h - top - bottom,
    }
  })
}
