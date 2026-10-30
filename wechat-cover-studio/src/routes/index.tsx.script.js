{
  // ---------- Constants ----------
  const COVER_W = 1440
  const COVER_H = 720
  // const COVER_W = 900
  // const COVER_H = 383
  const THUMB_SIZE = 383
  const MAX_IMAGES = 6
  const JPEG_QUALITY = 0.92
  // const BG_COLOR = '#ffffff'
  const BG_COLOR = 'gray' // 图片间隙底色（深灰，白图上也清晰可见）
  const G = 4 // gap in px

  // console.log('I am here!')

  // ---------- State ----------
  /** @type {{ img: HTMLImageElement, url: string }[]} */
  let items = []
  let dragSrcIndex = -1

  // ---------- DOM ----------
  const stage = document.getElementById('stage')
  const canvas = document.getElementById('preview')
  // console.log('canvas:', canvas)
  const ctx = canvas.getContext('2d')
  const dropzone = document.getElementById('dropzone')
  const strip = document.getElementById('strip')
  const fileInput = document.getElementById('fileInput')
  const dlCover = document.getElementById('dlCover')
  const dlThumb = document.getElementById('dlThumb')
  const clearAll = document.getElementById('clearAll')
  const toasts = document.getElementById('toasts')

  canvas.addEventListener('click', () => {
    if (items.length > 0 && items.length < MAX_IMAGES) fileInput.click()
  })

  // ---------- Toast ----------
  function toast(msg, ms = 2600) {
    const el = document.createElement('div')
    el.className = 'toast'
    el.textContent = msg
    toasts.appendChild(el)
    setTimeout(() => {
      el.style.transition = 'opacity .25s'
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 260)
    }, ms)
  }

  // ---------- Preview canvas sizing (DPR-aware) ----------
  function sizePreviewCanvas() {
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    const cssW = rect.width || COVER_W
    const cssH = rect.height || COVER_H
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
  }

  // ---------- Layout: cell rects for n images ----------
  // Returns array of {x,y,w,h} in cover coordinates, one per image (may be fewer
  // than total cells when n is odd on a grid — e.g. 5 in 3×2 leaves one blank).
  function getCells(n) {
    const W = COVER_W,
      H = COVER_H

    // Build raw grid cells, then inset each by G/2 on shared edges.
    // Outer edges are not inset (no outer margin).
    let cols,
      rows,
      raw = []

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
      const left = cell.col > 0 ? G / 2 : 0
      const right = cell.col < cols - 1 ? G / 2 : 0
      const top = cell.row > 0 ? G / 2 : 0
      const bottom = cell.row < rows - 1 ? G / 2 : 0
      return {
        x: cell.x + left,
        y: cell.y + top,
        w: cell.w - left - right,
        h: cell.h - top - bottom,
      }
    })
  }

  // ---------- Draw one image cover-cropped (center) into a rect on target ctx ----------
  function drawCover(targetCtx, img, cell, scale = 1) {
    const cx = cell.x * scale,
      cy = cell.y * scale
    const cw = cell.w * scale,
      ch = cell.h * scale

    const iw = img.naturalWidth || img.width
    const ih = img.naturalHeight || img.height
    if (!iw || !ih) return

    const cellRatio = cw / ch
    const imgRatio = iw / ih

    let sx, sy, sw, sh
    if (imgRatio > cellRatio) {
      // image wider than cell → crop sides
      sh = ih
      sw = ih * cellRatio
      sx = (iw - sw) / 2
      sy = 0
    } else {
      // image taller than cell → crop top/bottom
      sw = iw
      sh = iw / cellRatio
      sx = 0
      sy = (ih - sh) / 2
    }
    targetCtx.drawImage(img, sx, sy, sw, sh, cx, cy, cw, ch)
  }

  // ---------- Render the composed cover onto a given ctx at a given size ----------
  function composeOnto(targetCtx, targetW, targetH) {
    const scale = targetW / COVER_W
    targetCtx.fillStyle = BG_COLOR
    targetCtx.fillRect(0, 0, targetW, targetH)

    if (items.length === 0) return

    const cells = getCells(items.length)
    for (let i = 0; i < items.length; i++) {
      drawCover(targetCtx, items[i].img, cells[i], scale)
    }
  }

  // ---------- Re-render preview ----------
  function render() {
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
    stage.classList.toggle('has-image', items.length > 0)
    dlCover.disabled = items.length === 0
    dlThumb.disabled = items.length === 0
    clearAll.disabled = items.length === 0
  }

  // ---------- Thumbnail strip ----------
  function renderStrip() {
    strip.innerHTML = ''
    items.forEach((item, i) => {
      const el = document.createElement('div')
      el.className = 'thumb'
      el.draggable = true
      el.dataset.index = i

      const img = document.createElement('img')
      img.src = item.url
      img.alt = `图片 ${i + 1}`
      el.appendChild(img)

      const idx = document.createElement('span')
      idx.className = 'idx'
      idx.textContent = i + 1
      el.appendChild(idx)

      const rm = document.createElement('button')
      rm.className = 'remove'
      rm.textContent = '×'
      rm.title = '移除'
      rm.addEventListener('click', (e) => {
        e.stopPropagation()
        removeAt(i)
      })
      el.appendChild(rm)

      // Mobile move buttons
      const move = document.createElement('div')
      move.className = 'move'
      const left = document.createElement('button')
      left.textContent = '←'
      left.title = '左移'
      left.addEventListener('click', (e) => {
        e.stopPropagation()
        moveItem(i, i - 1)
      })
      const right = document.createElement('button')
      right.textContent = '→'
      right.title = '右移'
      right.addEventListener('click', (e) => {
        e.stopPropagation()
        moveItem(i, i + 1)
      })
      move.appendChild(left)
      move.appendChild(right)
      el.appendChild(move)

      // Drag events
      el.addEventListener('dragstart', (e) => {
        dragSrcIndex = i
        el.classList.add('dragging')
        e.dataTransfer.effectAllowed = 'move'
        try {
          e.dataTransfer.setData('text/plain', String(i))
        } catch (_) {}
      })
      el.addEventListener('dragend', () => {
        el.classList.remove('dragging')
        dragSrcIndex = -1
        strip
          .querySelectorAll('.drop-target')
          .forEach((n) => n.classList.remove('drop-target'))
      })
      el.addEventListener('dragover', (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        if (dragSrcIndex !== -1 && dragSrcIndex !== i)
          el.classList.add('drop-target')
      })
      el.addEventListener('dragleave', () => el.classList.remove('drop-target'))
      el.addEventListener('drop', (e) => {
        e.preventDefault()
        el.classList.remove('drop-target')
        if (dragSrcIndex === -1 || dragSrcIndex === i) return
        moveItem(dragSrcIndex, i)
      })

      strip.appendChild(el)
    })

    // "+" add-more tile (only when under cap)
    if (items.length > 0 && items.length < MAX_IMAGES) {
      const add = document.createElement('button')
      add.className = 'thumb add-more'
      add.type = 'button'
      add.title = '继续添加图片'
      add.textContent = '+'
      add.addEventListener('click', () => fileInput.click())
      strip.appendChild(add)
    }
  }

  // ---------- Mutations ----------
  function moveItem(from, to) {
    if (to < 0 || to >= items.length || from === to) return
    const [it] = items.splice(from, 1)
    items.splice(to, 0, it)
    renderStrip()
    render()
  }

  function removeAt(i) {
    const [removed] = items.splice(i, 1)
    if (removed) URL.revokeObjectURL(removed.url)
    renderStrip()
    render()
  }

  function clearAllItems() {
    items.forEach((it) => URL.revokeObjectURL(it.url))
    items = []
    renderStrip()
    render()
  }

  // ---------- File intake ----------
  function isImageFile(file) {
    return file && file.type && file.type.startsWith('image/')
  }

  async function loadImageFromFile(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => resolve({ img, url })
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('decode failed'))
      }
      img.src = url
    })
  }

  async function addFiles(fileList) {
    const files = Array.from(fileList || [])
    if (files.length === 0) return

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
    const loaded = []
    for (const f of toLoad) {
      try {
        loaded.push(await loadImageFromFile(f))
      } catch (_) {
        toast(`无法读取图片：${f.name || '未命名'}`)
      }
    }
    document.body.style.cursor = prevCursor

    if (loaded.length === 0) return
    items = items.concat(loaded)
    renderStrip()
    render()
  }

  // ---------- Export helpers ----------
  function makeExportCanvas() {
    const c = document.createElement('canvas')
    c.width = COVER_W
    c.height = COVER_H
    const cx = c.getContext('2d')
    composeOnto(cx, COVER_W, COVER_H)
    return c
  }

  function makeThumbCanvas() {
    const cover = makeExportCanvas()
    const c = document.createElement('canvas')
    c.width = THUMB_SIZE
    c.height = THUMB_SIZE
    const cx = c.getContext('2d')
    cx.fillStyle = BG_COLOR
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

  function downloadCanvas(c, filename) {
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
  dropzone.addEventListener('click', () => fileInput.click())
  fileInput.addEventListener('change', (e) => {
    addFiles(e.target.files)
    fileInput.value = '' // allow re-selecting same file
  })

  // Whole-page drag & drop (so dropping anywhere in the stage works)
  let dragDepth = 0
  ;['dragenter', 'dragover'].forEach((ev) => {
    window.addEventListener(ev, (e) => {
      if (
        e.dataTransfer &&
        Array.from(e.dataTransfer.types).includes('Files')
      ) {
        e.preventDefault()
      }
    })
  })

  stage.addEventListener('dragenter', (e) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault()
      dragDepth++
      stage.classList.add('dragover')
    }
  })
  stage.addEventListener('dragover', (e) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault()
      e.dataTransfer.dropEffect = 'copy'
    }
  })
  stage.addEventListener('dragleave', (e) => {
    dragDepth = Math.max(0, dragDepth - 1)
    if (dragDepth === 0) stage.classList.remove('dragover')
  })
  stage.addEventListener('drop', (e) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
      e.preventDefault()
      dragDepth = 0
      stage.classList.remove('dragover')
      addFiles(e.dataTransfer.files)
    }
  })

  // Paste
  window.addEventListener('paste', (e) => {
    const itemsInClip = e.clipboardData && e.clipboardData.items
    if (!itemsInClip) return
    const files = []
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
  })

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
  dlCover.addEventListener('click', () => {
    if (!items.length) return
    downloadCanvas(makeExportCanvas(), 'wechat-cover-900x383.jpg')
  })
  dlThumb.addEventListener('click', () => {
    if (!items.length) return
    downloadCanvas(makeThumbCanvas(), 'wechat-cover-thumbnail-383x383.jpg')
  })
  clearAll.addEventListener('click', clearAllItems)

  // Resize → re-render at new DPR/size
  window.addEventListener('resize', () => {
    // Only re-render if we have images (or even empty state to keep crisp)
    render()
  })

  // ---------- Init ----------
  render()
}
