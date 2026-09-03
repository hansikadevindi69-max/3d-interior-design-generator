import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { buildSceneGroup } from '../three/sceneBuilder';

const sampleScene = {
  style: 'modern',
  palette: ['#ffffff', '#4a6b8a'],
  materials: ['wood'],
  rooms: [
    {
      id: 'room-1',
      type: 'living_room',
      label: 'Living Room',
      widthMeters: 4,
      depthMeters: 3,
      heightMeters: 2.7,
      areaSqm: 12,
      position: { x: 0, y: 0, z: 0 },
      wallColor: '#f5f5f0',
      floorColor: '#a9784c',
      furniture: [
        {
          id: 'room-1-sofa-1',
          type: 'sofa',
          color: '#9a9a94',
          material: 'wood',
          dimensions: { width: 2.0, depth: 0.9 },
          position: { x: 1.2, y: 0, z: 0.6 },
          rotationY: 0,
        },
      ],
      lighting: [
        { id: 'room-1-ambient', type: 'ambient', intensity: 0.5, color: '#ffffff' },
        {
          id: 'room-1-ceiling',
          type: 'point',
          intensity: 0.9,
          color: '#fff4e0',
          position: { x: 2, y: 2.5, z: 1.5 },
        },
      ],
      decor: [
        { id: 'room-1-plant', type: 'plant', color: '#4c7a4c', position: { x: 0.3, y: 0, z: 2.7 } },
      ],
    },
  ],
};

describe('buildSceneGroup', () => {
  it('returns an empty group when scene is missing', () => {
    const group = buildSceneGroup(null);
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.children.length).toBe(0);
  });

  it('builds a room group containing floor, walls, furniture, decor and lights', () => {
    const group = buildSceneGroup(sampleScene);
    expect(group.children.length).toBe(1);

    const roomGroup = group.children[0];
    const meshNames = roomGroup.children.map((child) => child.name);
    expect(meshNames).toContain('sofa');
    expect(meshNames).toContain('plant');
    expect(meshNames).toContain('room-1-ambient');
    expect(meshNames).toContain('room-1-ceiling');
  });
});
