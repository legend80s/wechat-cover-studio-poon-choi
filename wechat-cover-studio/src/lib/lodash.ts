// clampNumber(prev + 1, [0, 100])
export const clampNumber = (value: number, range: [number, number]) => {
  // https://github.com/tc39/proposal-math-clamp
  if ('clamp' in Math && typeof Math.clamp === 'function') {
    return Math.clamp(value, range[0], range[1])
  }
  if (value < range[0]) {
    return range[0]
  }
  if (value > range[1]) {
    return range[1]
  }
  return value
}
