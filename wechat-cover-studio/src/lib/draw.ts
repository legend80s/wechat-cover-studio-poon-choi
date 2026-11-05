export type FitMode = 'cover' | 'contain'

export type Cell = {
  x: number
  y: number
  w: number
  h: number
}

export const drawImageToCell = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cell: Cell,
  scale: number,
  fitMode: FitMode,
) => {
  if (fitMode === 'contain') drawContain(ctx, img, cell, scale)
  else drawCover(ctx, img, cell, scale)
}

const drawContain: typeof drawCover = (ctx, img, cell, scale = 1) => {
  const cx = cell.x * scale,
    cy = cell.y * scale
  const cw = cell.w * scale,
    ch = cell.h * scale
  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return
  const cellRatio = cw / ch,
    imgRatio = iw / ih
  let dw: number, dh: number
  if (imgRatio > cellRatio) {
    dw = cw
    dh = cw / imgRatio
  } else {
    dh = ch
    dw = ch * imgRatio
  }
  const dx = cx + (cw - dw) / 2
  const dy = cy + (ch - dh) / 2
  ctx.drawImage(img, 0, 0, iw, ih, dx, dy, dw, dh)
}

// ---------- Draw one image cover-cropped (center) into a rect on target ctx ----------
function drawCover(
  targetCtx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cell: Cell,
  scale = 1,
): void {
  const cx = cell.x * scale,
    cy = cell.y * scale
  const cw = cell.w * scale,
    ch = cell.h * scale

  const iw = img.naturalWidth || img.width
  const ih = img.naturalHeight || img.height
  if (!iw || !ih) return

  const cellRatio = cw / ch
  const imgRatio = iw / ih

  let sx: number, sy: number, sw: number, sh: number
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
