const COLOR_KEYWORDS = {
  white: '#f5f5f0',
  black: '#2b2b2b',
  gray: '#9a9a94',
  grey: '#9a9a94',
  beige: '#e8dcc8',
  cream: '#f2e8d5',
  brown: '#8a6240',
  wood: '#a9784c',
  blue: '#4a6b8a',
  navy: '#233c58',
  green: '#5c7a5c',
  sage: '#a9bfa0',
  yellow: '#e0c064',
  gold: '#c9a24b',
  red: '#a33f3f',
  pink: '#d99aa8',
  orange: '#d68a4c',
  purple: '#7d5a9a',
  teal: '#3f8a8a',
  pastel: '#f0dfe6',
  terracotta: '#c1683f',
  charcoal: '#3a3a3a',
};

const STYLE_KEYWORDS = [
  'modern',
  'minimalist',
  'scandinavian',
  'industrial',
  'rustic',
  'bohemian',
  'traditional',
  'contemporary',
  'luxury',
  'coastal',
  'farmhouse',
  'mid-century',
];

const MATERIAL_KEYWORDS = {
  marble: 'marble',
  wood: 'wood',
  wooden: 'wood',
  oak: 'wood',
  concrete: 'concrete',
  metal: 'metal',
  glass: 'glass',
  velvet: 'velvet',
  leather: 'leather',
  linen: 'linen',
  rattan: 'rattan',
  brick: 'brick',
};

const FURNITURE_BY_ROOM_TYPE = {
  living_room: [
    { name: 'sofa', footprint: { width: 2.0, depth: 0.9 }, defaultColorKey: 'gray' },
    { name: 'coffee_table', footprint: { width: 1.1, depth: 0.6 }, defaultColorKey: 'wood' },
    { name: 'tv_console', footprint: { width: 1.6, depth: 0.4 }, defaultColorKey: 'wood' },
    { name: 'armchair', footprint: { width: 0.8, depth: 0.8 }, defaultColorKey: 'beige' },
    { name: 'rug', footprint: { width: 2.4, depth: 1.6 }, defaultColorKey: 'cream' },
  ],
  bedroom: [
    { name: 'bed', footprint: { width: 1.6, depth: 2.0 }, defaultColorKey: 'white' },
    { name: 'wardrobe', footprint: { width: 1.2, depth: 0.6 }, defaultColorKey: 'wood' },
    { name: 'nightstand', footprint: { width: 0.45, depth: 0.4 }, defaultColorKey: 'wood' },
    { name: 'dresser', footprint: { width: 1.0, depth: 0.5 }, defaultColorKey: 'wood' },
  ],
  kitchen: [
    { name: 'kitchen_island', footprint: { width: 1.4, depth: 0.8 }, defaultColorKey: 'white' },
    { name: 'dining_table', footprint: { width: 1.4, depth: 0.8 }, defaultColorKey: 'wood' },
    { name: 'cabinet_run', footprint: { width: 2.4, depth: 0.6 }, defaultColorKey: 'white' },
  ],
  bathroom: [
    { name: 'vanity', footprint: { width: 1.0, depth: 0.5 }, defaultColorKey: 'white' },
    { name: 'bathtub', footprint: { width: 1.6, depth: 0.7 }, defaultColorKey: 'white' },
  ],
  dining_room: [
    { name: 'dining_table', footprint: { width: 1.8, depth: 0.9 }, defaultColorKey: 'wood' },
    { name: 'dining_chairs', footprint: { width: 0.45, depth: 0.45 }, count: 6, defaultColorKey: 'wood' },
    { name: 'sideboard', footprint: { width: 1.4, depth: 0.45 }, defaultColorKey: 'wood' },
  ],
  office: [
    { name: 'desk', footprint: { width: 1.4, depth: 0.7 }, defaultColorKey: 'wood' },
    { name: 'office_chair', footprint: { width: 0.6, depth: 0.6 }, defaultColorKey: 'black' },
    { name: 'bookshelf', footprint: { width: 0.9, depth: 0.3 }, defaultColorKey: 'wood' },
  ],
};

const DEFAULT_FURNITURE = [
  { name: 'accent_table', footprint: { width: 0.6, depth: 0.6 }, defaultColorKey: 'wood' },
];

/**
 * Parses a free-form design prompt into structured design intent: a color
 * palette, a decorating style and preferred materials. This keyword-based
 * extraction acts as the local fallback used whenever no external AI
 * provider is configured (see aiProvider.js), and is also used to enrich
 * whatever a remote AI model returns.
 */
function parsePrompt(prompt = '') {
  const lower = prompt.toLowerCase();

  const colors = Object.keys(COLOR_KEYWORDS).filter((keyword) => lower.includes(keyword));
  const style = STYLE_KEYWORDS.find((keyword) => lower.includes(keyword)) || 'contemporary';
  const materials = Object.keys(MATERIAL_KEYWORDS).filter((keyword) => lower.includes(keyword));

  const palette = colors.length
    ? colors.map((c) => COLOR_KEYWORDS[c])
    : [COLOR_KEYWORDS.white, COLOR_KEYWORDS.beige, COLOR_KEYWORDS.wood];

  const materialList = materials.length
    ? Array.from(new Set(materials.map((m) => MATERIAL_KEYWORDS[m])))
    : ['wood', 'linen'];

  return {
    style,
    palette,
    materials: materialList,
    raw: prompt,
  };
}

/**
 * Generates furniture placements for a single room based on its type and
 * dimensions. Furniture is arranged along the room walls, leaving a central
 * walkway, and is scaled down automatically if it would not fit.
 */
function placeFurniture(room, designIntent) {
  const catalog = FURNITURE_BY_ROOM_TYPE[room.type] || DEFAULT_FURNITURE;
  const placements = [];
  let edgeCursor = 0.2;

  catalog.forEach((item, index) => {
    const count = item.count || 1;
    for (let i = 0; i < count; i += 1) {
      const color = designIntent.palette[(index + i) % designIntent.palette.length];
      const material = designIntent.materials[(index + i) % designIntent.materials.length];

      const posX = Math.min(edgeCursor + item.footprint.width / 2, room.widthMeters - item.footprint.width / 2);
      const posZ = item.footprint.depth / 2 + 0.15;

      placements.push({
        id: `${room.id}-${item.name}-${i + 1}`,
        type: item.name,
        color,
        material,
        dimensions: item.footprint,
        position: {
          x: round1(room.position.x + posX),
          y: 0,
          z: round1(room.position.z + posZ),
        },
        rotationY: 0,
      });

      edgeCursor += item.footprint.width + 0.25;
    }
  });

  return placements;
}

function buildLighting(room, designIntent) {
  const isDark = ['navy', 'charcoal', 'black'].some((k) => designIntent.style === k);
  return [
    {
      id: `${room.id}-ambient`,
      type: 'ambient',
      intensity: isDark ? 0.35 : 0.5,
      color: '#ffffff',
    },
    {
      id: `${room.id}-ceiling`,
      type: 'point',
      intensity: 0.9,
      color: designIntent.style === 'industrial' ? '#ffd9a0' : '#fff4e0',
      position: {
        x: round1(room.position.x + room.widthMeters / 2),
        y: room.heightMeters - 0.2,
        z: round1(room.position.z + room.depthMeters / 2),
      },
    },
    {
      id: `${room.id}-window`,
      type: 'directional',
      intensity: 0.4,
      color: '#dceeff',
      position: { x: room.position.x, y: 1.6, z: room.position.z + room.depthMeters },
    },
  ];
}

function buildDecor(room, designIntent) {
  const decor = [
    {
      id: `${room.id}-wall-art`,
      type: 'wall_art',
      color: designIntent.palette[0],
      position: { x: round1(room.position.x + room.widthMeters / 2), y: 1.6, z: room.position.z },
    },
  ];

  if (['living_room', 'bedroom', 'dining_room'].includes(room.type)) {
    decor.push({
      id: `${room.id}-plant`,
      type: 'plant',
      color: '#4c7a4c',
      position: { x: round1(room.position.x + 0.3), y: 0, z: round1(room.position.z + room.depthMeters - 0.3) },
    });
  }

  return decor;
}

/**
 * Builds the full 3D scene description for a floor plan analysis and a
 * design prompt. The output is a provider-agnostic JSON structure that the
 * frontend renders using Three.js, and that can be exported as a glTF scene.
 */
function generateDesignScene({ analysis, prompt }) {
  const designIntent = parsePrompt(prompt);

  const rooms = analysis.rooms.map((room) => ({
    ...room,
    wallColor: designIntent.palette[0],
    floorColor: designIntent.palette[designIntent.palette.length - 1],
    furniture: placeFurniture(room, designIntent),
    lighting: buildLighting(room, designIntent),
    decor: buildDecor(room, designIntent),
  }));

  return {
    style: designIntent.style,
    palette: designIntent.palette,
    materials: designIntent.materials,
    prompt,
    floorPlanSummary: {
      estimatedAreaSqm: analysis.estimatedAreaSqm,
      roomCount: analysis.roomCount,
    },
    rooms,
  };
}

function round1(value) {
  return Math.round(value * 10) / 10;
}

module.exports = {
  parsePrompt,
  generateDesignScene,
};
