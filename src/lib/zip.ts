/**
 * Simple uncompressed ZIP generator.
 * Does not require external libraries. Uses STORE method (no compression).
 */
export function generateZip(files: { name: string; buffer: Uint8Array }[]): Blob {
  let offset = 0
  const localFileHeaders: Uint8Array[] = []
  const centralDirectoryHeaders: Uint8Array[] = []

  const crc32 = (buf: Uint8Array): number => {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i]
      for (let j = 0; j < 8; j++) {
        c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
      }
    }
    return (c ^ 0xffffffff) >>> 0
  }

  for (const file of files) {
    const nameBuf = new TextEncoder().encode(file.name)
    const dataBuf = file.buffer

    const lfh = new Uint8Array(30 + nameBuf.length + dataBuf.length)
    const lfhView = new DataView(lfh.buffer)
    lfhView.setUint32(0, 0x04034b50, true)
    lfhView.setUint16(4, 10, true)
    lfhView.setUint16(6, 1 << 11, true) // UTF-8 flag
    lfhView.setUint16(8, 0, true)
    lfhView.setUint16(10, 0, true)
    lfhView.setUint16(12, 0, true)

    const crc = crc32(dataBuf)
    lfhView.setUint32(14, crc, true)
    lfhView.setUint32(18, dataBuf.length, true)
    lfhView.setUint32(22, dataBuf.length, true)
    lfhView.setUint16(26, nameBuf.length, true)
    lfhView.setUint16(28, 0, true)

    lfh.set(nameBuf, 30)
    lfh.set(dataBuf, 30 + nameBuf.length)
    localFileHeaders.push(lfh)

    const cdh = new Uint8Array(46 + nameBuf.length)
    const cdhView = new DataView(cdh.buffer)
    cdhView.setUint32(0, 0x02014b50, true)
    cdhView.setUint16(4, 10, true)
    cdhView.setUint16(6, 10, true)
    cdhView.setUint16(8, 1 << 11, true)
    cdhView.setUint16(10, 0, true)
    cdhView.setUint16(12, 0, true)
    cdhView.setUint16(14, 0, true)
    cdhView.setUint32(16, crc, true)
    cdhView.setUint32(20, dataBuf.length, true)
    cdhView.setUint32(24, dataBuf.length, true)
    cdhView.setUint16(28, nameBuf.length, true)
    cdhView.setUint16(30, 0, true)
    cdhView.setUint16(32, 0, true)
    cdhView.setUint16(34, 0, true)
    cdhView.setUint16(36, 0, true)
    cdhView.setUint32(38, 0, true)
    cdhView.setUint32(42, offset, true)

    cdh.set(nameBuf, 46)
    centralDirectoryHeaders.push(cdh)

    offset += lfh.length
  }

  const eocd = new Uint8Array(22)
  const eocdView = new DataView(eocd.buffer)
  eocdView.setUint32(0, 0x06054b50, true)
  eocdView.setUint16(4, 0, true)
  eocdView.setUint16(6, 0, true)
  eocdView.setUint16(8, files.length, true)
  eocdView.setUint16(10, files.length, true)

  const cdSize = centralDirectoryHeaders.reduce((acc, h) => acc + h.length, 0)
  eocdView.setUint32(12, cdSize, true)
  eocdView.setUint32(16, offset, true)
  eocdView.setUint16(20, 0, true)

  return new Blob([...localFileHeaders, ...centralDirectoryHeaders, eocd], {
    type: 'application/zip',
  })
}
