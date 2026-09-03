const fs = require('fs');

/**
 * Minimal, dependency-free image dimension reader for PNG and JPEG files.
 * Only the small header portion of the file is read, and all loops are
 * bounded by the buffer length, so this cannot be driven into an infinite
 * loop or excessive memory use by a malformed/malicious file - unlike some
 * general-purpose image metadata libraries which have had denial-of-service
 * advisories for exotic formats (ICNS, JXL, HEIF, ...). Formats we do not
 * explicitly parse simply fall back to `null`, letting the caller apply a
 * sensible default.
 */
function readImageDimensions(filePath) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const header = Buffer.alloc(65536);
    const bytesRead = fs.readSync(fd, header, 0, header.length, 0);
    const buffer = header.subarray(0, bytesRead);

    return readPng(buffer) || readJpeg(buffer) || readGif(buffer) || readBmp(buffer);
  } finally {
    fs.closeSync(fd);
  }
}

function readPng(buffer) {
  const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return null;
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

function readGif(buffer) {
  if (buffer.length < 10 || buffer.toString('ascii', 0, 3) !== 'GIF') return null;
  return {
    width: buffer.readUInt16LE(6),
    height: buffer.readUInt16LE(8),
  };
}

function readBmp(buffer) {
  if (buffer.length < 26 || buffer.toString('ascii', 0, 2) !== 'BM') return null;
  return {
    width: buffer.readInt32LE(18),
    height: Math.abs(buffer.readInt32LE(22)),
  };
}

function readJpeg(buffer) {
  if (buffer.length < 4 || buffer.readUInt16BE(0) !== 0xffd8) return null;

  let offset = 2;
  const maxOffset = buffer.length - 4;
  while (offset < maxOffset) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buffer[offset + 1];
    // Start-of-frame markers (baseline/progressive, excluding DHT/JPG ext).
    const isSofMarker =
      (marker >= 0xc0 && marker <= 0xcf) && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;

    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (isSofMarker && offset + 9 <= buffer.length) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      };
    }
    if (segmentLength < 2) break;
    offset += 2 + segmentLength;
  }
  return null;
}

module.exports = { readImageDimensions };
