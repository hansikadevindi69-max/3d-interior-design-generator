import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { buildSceneGroup } from '../three/sceneBuilder';

/**
 * Renders a generated design scene in real time using Three.js, and exposes
 * "Export PNG" / "Export 3D model (GLTF)" actions for downloading the
 * result, satisfying the real-time preview and export requirements.
 */
export default function DesignViewer({ scene }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const groupRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 480;

    const threeScene = new THREE.Scene();
    threeScene.background = new THREE.Color('#e9ecef');
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(6, 6, 8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(2, 0, 2);
    controls.update();

    const hemiLight = new THREE.HemisphereLight('#ffffff', '#444444', 0.6);
    threeScene.add(hemiLight);

    rendererRef.current = renderer;
    sceneRef.current = threeScene;
    cameraRef.current = camera;

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(threeScene, camera);
    };
    animate();

    const handleResize = () => {
      const newWidth = container.clientWidth || width;
      const newHeight = container.clientHeight || height;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  useEffect(() => {
    const threeScene = sceneRef.current;
    if (!threeScene) return;

    if (groupRef.current) {
      threeScene.remove(groupRef.current);
    }
    if (scene) {
      const group = buildSceneGroup(scene);
      threeScene.add(group);
      groupRef.current = group;
    }
  }, [scene]);

  const handleExportImage = () => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    const link = document.createElement('a');
    link.download = 'interior-design.png';
    link.href = renderer.domElement.toDataURL('image/png');
    link.click();
  };

  const handleExportModel = () => {
    if (!sceneRef.current || !groupRef.current) return;
    const exporter = new GLTFExporter();
    exporter.parse(
      groupRef.current,
      (result) => {
        const output = JSON.stringify(result, null, 2);
        const blob = new Blob([output], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'interior-design.gltf';
        link.click();
      },
      (error) => {
        // eslint-disable-next-line no-console
        console.error('Failed to export GLTF model', error);
      },
      { binary: false }
    );
  };

  return (
    <div className="design-viewer">
      <div className="design-viewer__canvas" ref={containerRef} data-testid="three-canvas-container" />
      <div className="design-viewer__actions">
        <button type="button" onClick={handleExportImage} disabled={!scene}>
          Export PNG
        </button>
        <button type="button" onClick={handleExportModel} disabled={!scene}>
          Export 3D Model (glTF)
        </button>
      </div>
    </div>
  );
}
