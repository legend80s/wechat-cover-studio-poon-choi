export type ImageItem = { img: HTMLImageElement; url: string; id: string }

// ---------- File intake ----------
export function isImageFile(file: File) {
  // biome-ignore lint/complexity/useOptionalChain: <explanation>
  return file && file.type && file.type.startsWith('image/')
}

export async function loadImageFromFile(file: File): Promise<ImageItem> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () =>
      resolve({ img, url, id: `${file.name}_${Math.random()}` })

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode failed'))
    }
    img.src = url
  })
}
