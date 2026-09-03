const { analyzeFloorPlan, detectMediaType } = require('../src/services/floorPlanAnalyzer');
const path = require('path');

describe('floorPlanAnalyzer', () => {
  const fixture = path.join(__dirname, 'fixtures', 'sample-floorplan.png');

  it('analyzes an image floor plan and returns rooms with dimensions', () => {
    const analysis = analyzeFloorPlan(fixture, 'living-room-plan.png');

    expect(analysis.mediaType).toBe('image');
    expect(analysis.roomCount).toBeGreaterThan(0);
    expect(analysis.rooms.length).toBe(analysis.roomCount);
    expect(analysis.rooms[0].type).toBe('living_room');
    analysis.rooms.forEach((room) => {
      expect(room.widthMeters).toBeGreaterThan(0);
      expect(room.depthMeters).toBeGreaterThan(0);
      expect(room.areaSqm).toBeGreaterThan(0);
    });
    expect(analysis.constraints.totalFootprintWidthMeters).toBeGreaterThan(0);
  });

  it('is deterministic for the same input', () => {
    const first = analyzeFloorPlan(fixture, 'plan.png');
    const second = analyzeFloorPlan(fixture, 'plan.png');
    expect(second.rooms).toEqual(first.rooms);
  });

  it('detects media types from file extensions', () => {
    expect(detectMediaType('plan.png')).toBe('image');
    expect(detectMediaType('walkthrough.mp4')).toBe('video');
    expect(detectMediaType('notes.txt')).toBe('unknown');
  });
});
