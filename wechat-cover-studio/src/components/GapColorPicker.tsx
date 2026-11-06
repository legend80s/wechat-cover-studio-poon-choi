import { useState } from 'react'
import { PresetColorDropdown } from './PresetColorDropdown'

export function GapColorPicker({
  onChange,
  initialColor,
  presetColors,
}: {
  onChange: (color: string) => void
  initialColor: string
  presetColors: string[]
}) {
  const [value, setValue] = useState(initialColor)

  return (
    // to tailwind css "display: flex; align-items: center; gap: 8px; font-size: 13px; color: #555;"
    <div className="gap-color-wrap flex items-center gap-2 text-sm text-slate-600">
      <label htmlFor="gapColor" className="cursor-pointer">
        间隙颜色
      </label>
      <PresetColorDropdown
        presets={presetColors}
        curColor={value}
        onPick={(color) => {
          setValue(color)
          onChange(color)
        }}
      />

      <div
        className="flex items-center gap-2 ps-2 border border-gray-300 rounded-md"
        style={{ outline: `1px solid ${value}`, outlineOffset: '-2px' }}
      >
        🎨
        <input
          type="color"
          id="gapColor"
          value={value}
          onChange={(e) => {
            const gapColor = e.target.value
            setValue(gapColor)
            onChange(gapColor)
          }}
          // width: 34px; height: 34px; padding: 0; border: 1px solid #d5dae2; border-radius: 8px; background: none; cursor: pointer;
          className="h-8 w-8 aspect-square bg-transparent cursor-pointer
            [&::-webkit-color-swatch-wrapper]:p-0
            [&::-webkit-color-swatch]:rounded-md [&::-webkit-color-swatch]:border-0
          "
        />
      </div>
    </div>
  )
}
