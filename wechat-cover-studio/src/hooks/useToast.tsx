import { useCallback, useRef } from 'react'

export function useToast() {
  const containerRef = useRef<HTMLDivElement>(null)

  const toast = (msg: string, ms = 2600) => {
    const container = containerRef.current
    if (!container) return

    const el = document.createElement('div')
    el.className = 'toast'
    el.textContent = msg
    container.appendChild(el)

    setTimeout(() => {
      el.style.transition = 'opacity .25s'
      el.style.opacity = '0'
      setTimeout(() => el.remove(), 260)
    }, ms)
  }

  return { containerRef, toast: useCallback(toast, []) }
}
