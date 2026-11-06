// GapColorPicker.jsx 内
import { useEffect, useRef, useState } from 'react'

/**
 * color keyword to color value converter (eg. `'red'` -> `'#ff0000'`)
 * @param c
 * @returns
 */
const toColorValue = (c: string): string => {
  return c
  // const ctx = document.createElement('canvas').getContext('2d')
  // if (!ctx) return c
  // ctx.fillStyle = c
  // return ctx.fillStyle
}

interface PresetDropdownProps {
  onPick: (hex: string) => void
  presets: string[]
  curColor: string
}

export function PresetColorDropdown({
  onPick,
  presets: PRESETS,
  curColor,
}: PresetDropdownProps) {
  const [open, setOpen] = useState<boolean>(false)
  const ref = useRef<HTMLDivElement | null>(null)
  const [cycleIndex, setCycleIndex] = useState(0)
  // const [curColor, setCurColor] = useState<string>(PRESETS[0])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const handleCycle = (): void => {
    const next = PRESETS[cycleIndex % PRESETS.length]
    // setCurColor(next)
    // onChange(toColorValue(next))
    onPick(next)
    setCycleIndex((i) => (i + 1) % PRESETS.length)
  }

  return (
    <div ref={ref} className="relative flex gap-1">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-[13px]
                   text-slate-600 flex items-center gap-2 hover:bg-slate-50"
      >
        预设颜色
        <ColorPreviewerCube color={curColor} />
        <span className="text-slate-400">▾</span>
      </button>

      {open && (
        <div
          className="absolute z-20 mt-10 w-44 max-h-64 overflow-auto rounded-lg border
                        border-slate-200 bg-white shadow-lg p-1"
        >
          {PRESETS.map((c) => {
            const hex = toColorValue(c)
            return (
              <Option
                key={hex}
                curColor={curColor}
                color={c}
                onClick={(color) => {
                  onPick(color)
                  setOpen(false)
                }}
              ></Option>
            )
          })}
        </div>
      )}

      <button
        type="button"
        onClick={handleCycle}
        className="h-9 px-3 rounded-lg text-[13px] font-medium bg-white text-slate-700
                   border border-slate-200 transition hover:bg-slate-50"
      >
        逐个设置
      </button>
    </div>
  )
}

function ColorPreviewerCube({ color }: { color: string }) {
  return (
    <span
      className="w-4 h-4 rounded border border-slate-300 shrink-0"
      style={{ background: color }}
    />
  )
}

function Option({
  color: c,
  onClick,
  curColor,
}: {
  curColor: string
  color: string
  onClick: (hex: string) => void
}) {
  return (
    <button
      key={c}
      type="button"
      onClick={() => {
        onClick(c)
        // onPick(hex)
        // setCurColor(hex)
        // setOpen(false)
      }}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md
                  text-[13px] text-slate-700 hover:bg-slate-100 ${curColor === c ? 'bg-slate-100' : ''}`}
    >
      <ColorPreviewerCube color={c} />
      <code className="font-mono border-0!">{c}</code>
    </button>
  )
}

const isSameColor = (a: string, b: string) => {
  return a === b || toColorValue(a) === toColorValue(b)
}
