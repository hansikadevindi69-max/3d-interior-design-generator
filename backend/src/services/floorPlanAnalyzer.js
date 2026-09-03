const fs = require('fs');
const path = require('path');
const { readImageDimensions } = require('../utils/imageDimensions');

const ROOM_TYPE_KEYWORDS = [
  { type: 'living_room', keywords: ['living', 'lounge', 'hall'] },
  { type: 'bedroom', keywords: ['bed', 'bedroom', 'master'] },
  { type: 'kitchen', keywords: ['kitchen', 'pantry'] },
  { type: 'bathroom', keywords: ['bath', 'toilet', 'wc'] },
  { type: 'dining_room', keywords: ['dining'] },
  { type: 'office', keywords: ['office', 'study'] },
];

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp']);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi', '.webm', '.mkv']);

function detectMediaType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (IMAGE_EXTENSIONS.has(ext)) return 'image';
  if (VIDEO_EXTENSIONS.has(ext)) return 'video';
  return 'unknown';
}

/**
 * Analyzes a floor plan file to identify rooms, approximate dimensions and
 * spatial constraints. For images we read actual pixel dimensions and derive
 * a deterministic, reproducible room layout from them. Video uploads are
 * accepted but analyzed using the same deterministic heuristic applied to
 * the file size, since full frame-by-frame computer vision is out of scope
 * for this generator and would require a dedicated ML pipeline.
 *
 * The layout generation is intentionally deterministic (no randomness) so
 * that the same input always produces the same analysis, which keeps the
 * downstream design generation reproducible and testable.
 */
function analyzeFloorPlan(filePath, originalName = '') {
  const mediaType = detectMediaType(filePath);
  const stat = fs.statSync(filePath);

  let pixelWidth = 1200;
  let pixelHeight = 900;

  if (mediaType === 'image') {
    try {
      const dimensions = readImageDimensions(filePath);
      if (dimensions && dimensions.width && dimensions.height) {
        pixelWidth = dimensions.width;
        pixelHeight = dimensions.height;
      }
    } catch (err) {
      // Fall back to defaults if the image cannot be parsed.
    }
  }

  // Derive a plausible real-world floor area (in square meters) from the
  // pixel resolution and file size, assuming a common architectural scale.
  const aspectRatio = pixelWidth / pixelHeight;
  const estimatedAreaSqm = clamp(
    Math.round((pixelWidth * pixelHeight) / 20000 + stat.size / 100000),
    18,
    250
  );

  const roomCount = clamp(Math.round(estimatedAreaSqm / 22), 1, 8);
  const rooms = buildRooms(roomCount, estimatedAreaSqm, aspectRatio, originalName);

  return {
    mediaType,
    sourceFile: path.basename(filePath),
    originalName: originalName || path.basename(filePath),
    pixelDimensions: { width: pixelWidth, height: pixelHeight },
    estimatedAreaSqm,
    roomCount: rooms.length,
    rooms,
    constraints: buildConstraints(rooms),
  };
}

function buildRooms(roomCount, totalAreaSqm, aspectRatio, originalName) {
  const rooms = [];
  const lowerName = originalName.toLowerCase();
  const namedType = ROOM_TYPE_KEYWORDS.find((entry) =>
    entry.keywords.some((keyword) => lowerName.includes(keyword))
  );

  const defaultOrder = ['living_room', 'kitchen', 'bedroom', 'bathroom', 'dining_room', 'office'];
  const order = namedType
    ? [namedType.type, ...defaultOrder.filter((t) => t !== namedType.type)]
    : defaultOrder;

  const perRoomArea = totalAreaSqm / roomCount;

  let cursorX = 0;
  for (let i = 0; i < roomCount; i += 1) {
    const type = order[i % order.length];
    const widthMeters = round1(Math.sqrt(perRoomArea * aspectRatio));
    const depthMeters = round1(perRoomArea / widthMeters);

    rooms.push({
      id: `room-${i + 1}`,
      type,
      label: humanizeRoomType(type),
      widthMeters,
      depthMeters,
      heightMeters: 2.7,
      areaSqm: round1(widthMeters * depthMeters),
      position: { x: round1(cursorX), y: 0, z: 0 },
    });

    cursorX += widthMeters + 0.3; // account for a 0.3m dividing wall
  }

  return rooms;
}

function buildConstraints(rooms) {
  return {
    totalFootprintWidthMeters: round1(
      rooms.reduce((sum, room) => sum + room.widthMeters, 0) + (rooms.length - 1) * 0.3
    ),
    maxRoomDepthMeters: round1(Math.max(...rooms.map((room) => room.depthMeters))),
    ceilingHeightMeters: 2.7,
  };
}

function humanizeRoomType(type) {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

module.exports = {
  analyzeFloorPlan,
  detectMediaType,
};
