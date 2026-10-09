import type { Moment } from '@/lib/types'

export async function resizePhoto(file: File): Promise<{ thumb: string; full: string }> {
  const url = URL.createObjectURL(file)
  try {
    const image = await loadImage(url)
    return {
      full: paint(image, 1600, 0.8),
      thumb: paint(image, 400, 0.72),
    }
  } finally {
    URL.revokeObjectURL(url)
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('unreadable'))
    image.src = url
  })
}

function paint(image: HTMLImageElement, maxEdge: number, quality: number): string {
  const scale = Math.min(1, maxEdge / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('unreadable')
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', quality)
}

export function downloadAlbum(photos: Moment[], nameFor: (uploaderId: string) => string) {
  const files = photos.map((photo, index) => ({
    name: fileName(photo, nameFor(photo.uploaderId), index),
    data: dataUrlBytes(photo.full || photo.thumb),
  }))
  const blob = zipStore(files)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'gather-moments.zip'
  link.click()
  URL.revokeObjectURL(url)
}

function fileName(photo: Moment, uploader: string, index: number): string {
  const when = photo.createdAt.slice(0, 16).replace(/[:T]/g, '-')
  const who = uploader.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'guest'
  return `${String(index + 1).padStart(2, '0')}-${when}-${who}.jpg`
}

function dataUrlBytes(dataUrl: string): Uint8Array {
  const encoded = dataUrl.split(',')[1] ?? ''
  const binary = atob(encoded)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return bytes
}

function zipStore(files: { name: string; data: Uint8Array }[]): Blob {
  const locals: Uint8Array[] = []
  const centrals: Uint8Array[] = []
  let offset = 0
  for (const file of files) {
    const name = new TextEncoder().encode(file.name)
    const crc = crc32(file.data)
    const local = new Uint8Array(30 + name.length)
    const view = new DataView(local.buffer)
    view.setUint32(0, 0x04034b50, true)
    view.setUint16(4, 20, true)
    view.setUint16(8, 0, true)
    view.setUint32(14, crc, true)
    view.setUint32(18, file.data.length, true)
    view.setUint32(22, file.data.length, true)
    view.setUint16(26, name.length, true)
    local.set(name, 30)
    locals.push(local, file.data)

    const central = new Uint8Array(46 + name.length)
    const centralView = new DataView(central.buffer)
    centralView.setUint32(0, 0x02014b50, true)
    centralView.setUint16(4, 20, true)
    centralView.setUint16(6, 20, true)
    centralView.setUint32(16, crc, true)
    centralView.setUint32(20, file.data.length, true)
    centralView.setUint32(24, file.data.length, true)
    centralView.setUint16(28, name.length, true)
    centralView.setUint32(42, offset, true)
    central.set(name, 46)
    centrals.push(central)
    offset += local.length + file.data.length
  }
  const centralSize = centrals.reduce((sum, part) => sum + part.length, 0)
  const end = new Uint8Array(22)
  const endView = new DataView(end.buffer)
  endView.setUint32(0, 0x06054b50, true)
  endView.setUint16(8, files.length, true)
  endView.setUint16(10, files.length, true)
  endView.setUint32(12, centralSize, true)
  endView.setUint32(16, offset, true)
  const parts: BlobPart[] = []
  for (const part of locals) parts.push(part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength) as ArrayBuffer)
  for (const part of centrals) parts.push(part.buffer.slice(part.byteOffset, part.byteOffset + part.byteLength) as ArrayBuffer)
  parts.push(end.buffer.slice(0) as ArrayBuffer)
  return new Blob(parts, { type: 'application/zip' })
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let value = 0; value < 256; value += 1) {
    let crc = value
    for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
    table[value] = crc >>> 0
  }
  return table
})()

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let index = 0; index < data.length; index += 1) crc = CRC_TABLE[(crc ^ data[index]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}
