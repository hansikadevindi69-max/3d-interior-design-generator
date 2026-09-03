import * as THREE from 'three';

/**
 * Builds a Three.js Group from the design "scene" JSON produced by the
 * backend's designGenerator service. Rooms are rendered as simple boxed
 * volumes (floor + walls) and furniture/decor items as labeled colored
 * boxes positioned according to the generated layout. This keeps rendering
 * fast and dependency-light while still giving an accurate, real-time
 * preview of room layout, color palette and furniture placement.
 */
export function buildSceneGroup(scene) {
  const group = new THREE.Group();
  if (!scene || !Array.isArray(scene.rooms)) return group;

  scene.rooms.forEach((room) => {
    group.add(buildRoom(room));
  });

  return group;
}

function buildRoom(room) {
  const roomGroup = new THREE.Group();
  roomGroup.name = room.label || room.type;

  const floorGeometry = new THREE.BoxGeometry(room.widthMeters, 0.05, room.depthMeters);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: room.floorColor || '#cccccc' });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.position.set(
    room.position.x + room.widthMeters / 2,
    -0.025,
    room.position.z + room.depthMeters / 2
  );
  roomGroup.add(floor);

  const wallMaterial = new THREE.MeshStandardMaterial({
    color: room.wallColor || '#f5f5f0',
    side: THREE.DoubleSide,
  });
  const wallThickness = 0.08;

  const backWall = new THREE.Mesh(
    new THREE.BoxGeometry(room.widthMeters, room.heightMeters, wallThickness),
    wallMaterial
  );
  backWall.position.set(
    room.position.x + room.widthMeters / 2,
    room.heightMeters / 2,
    room.position.z
  );
  roomGroup.add(backWall);

  const sideWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, room.heightMeters, room.depthMeters),
    wallMaterial
  );
  sideWall.position.set(room.position.x, room.heightMeters / 2, room.position.z + room.depthMeters / 2);
  roomGroup.add(sideWall);

  (room.furniture || []).forEach((item) => roomGroup.add(buildFurnitureMesh(item)));
  (room.decor || []).forEach((item) => roomGroup.add(buildDecorMesh(item)));
  (room.lighting || []).forEach((light) => roomGroup.add(buildLight(light)));

  return roomGroup;
}

function buildFurnitureMesh(item) {
  const height = item.type.includes('table') || item.type.includes('desk') ? 0.45 : 0.75;
  const geometry = new THREE.BoxGeometry(item.dimensions.width, height, item.dimensions.depth);
  const material = new THREE.MeshStandardMaterial({ color: item.color || '#a9784c' });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = item.type;
  mesh.position.set(item.position.x, height / 2, item.position.z);
  mesh.rotation.y = ((item.rotationY || 0) * Math.PI) / 180;
  return mesh;
}

function buildDecorMesh(item) {
  const geometry =
    item.type === 'plant'
      ? new THREE.ConeGeometry(0.25, 0.6, 8)
      : new THREE.BoxGeometry(0.6, 0.6, 0.05);
  const material = new THREE.MeshStandardMaterial({ color: item.color || '#4c7a4c' });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = item.type;
  mesh.position.set(item.position.x, item.position.y + 0.3, item.position.z);
  return mesh;
}

function buildLight(light) {
  let threeLight;
  if (light.type === 'ambient') {
    threeLight = new THREE.AmbientLight(light.color, light.intensity);
  } else if (light.type === 'directional') {
    threeLight = new THREE.DirectionalLight(light.color, light.intensity);
    if (light.position) threeLight.position.set(light.position.x, light.position.y, light.position.z);
  } else {
    threeLight = new THREE.PointLight(light.color, light.intensity, 8);
    if (light.position) threeLight.position.set(light.position.x, light.position.y, light.position.z);
  }
  threeLight.name = light.id;
  return threeLight;
}
