import type { FitMode } from '#/lib/draw'

/**
 * 受控的模式切换按钮。
 * value: 'cover' | 'contain'
 * onChange: (next: 'cover' | 'contain') => void
 */
export function FitModeToggle({
  value,
  onChange,
  className = '',
}: {
  value: FitMode
  onChange: (next: FitMode) => void
  className?: string
}) {
  const next = value === 'cover' ? 'contain' : 'cover'
  const label = value === 'cover' ? 'Cover' : 'Contain'
  return (
    <button
      type="button"
      onClick={() => onChange(next)}
      aria-pressed={value === 'contain'}
      className={
        'cursor-pointer ' +
        'px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-slate-700 ' +
        'border border-slate-200 transition hover:bg-slate-50 ' +
        className
      }
    >
      裁剪模式：{label}
    </button>
  )
}
