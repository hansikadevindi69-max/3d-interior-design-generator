const { analyzeFloorPlan } = require('../src/services/floorPlanAnalyzer');
const { parsePrompt, generateDesignScene } = require('../src/services/designGenerator');
const path = require('path');

describe('designGenerator', () => {
  const fixture = path.join(__dirname, 'fixtures', 'sample-floorplan.png');

  describe('parsePrompt', () => {
    it('extracts color palette, style and materials from a prompt', () => {
      const intent = parsePrompt('A cozy scandinavian living room with blue walls and wood accents');
      expect(intent.style).toBe('scandinavian');
      expect(intent.materials).toContain('wood');
      expect(intent.palette.length).toBeGreaterThan(0);
    });

    it('falls back to sensible defaults for an empty prompt', () => {
      const intent = parsePrompt('');
      expect(intent.style).toBe('contemporary');
      expect(intent.palette.length).toBeGreaterThan(0);
      expect(intent.materials.length).toBeGreaterThan(0);
    });
  });

  describe('generateDesignScene', () => {
    it('produces furniture, lighting and decor for every room', () => {
      const analysis = analyzeFloorPlan(fixture, 'apartment-plan.png');
      const scene = generateDesignScene({
        analysis,
        prompt: 'modern living room with navy blue and gold accents',
      });

      expect(scene.style).toBe('modern');
      expect(scene.rooms.length).toBe(analysis.rooms.length);
      scene.rooms.forEach((room) => {
        expect(room.furniture.length).toBeGreaterThan(0);
        expect(room.lighting.length).toBeGreaterThan(0);
        expect(room.decor.length).toBeGreaterThan(0);
        room.furniture.forEach((item) => {
          expect(item.position.x).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});
