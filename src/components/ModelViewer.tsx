import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls, GLTFLoader, DRACOLoader, OBJLoader, MTLLoader, VOXLoader, VOXMesh } from 'three-stdlib';
import { Loader2, Maximize2, Minimize2 } from 'lucide-react';

interface ModelFormat {
  url: string;
  formatType: string;
  mtlUrl?: string;
}

interface ModelViewerProps {
  formats: ModelFormat[];
  className?: string;
}

export const ModelViewer: React.FC<ModelViewerProps> = ({ formats, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentFormatIndex, setCurrentFormatIndex] = useState(0);

  // Reset state when formats change
  useEffect(() => {
    setCurrentFormatIndex(0);
    setError(null);
    setLoading(true);
  }, [formats]);

  useEffect(() => {
    if (!containerRef.current || formats.length === 0) return;
    if (currentFormatIndex >= formats.length) {
      setError('Failed to load 3D model in any supported format');
      setLoading(false);
      return;
    }

    const currentFormat = formats[currentFormatIndex];
    const { url, formatType, mtlUrl } = currentFormat;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera setup
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Loaders
    const setupModel = (model: THREE.Object3D) => {
      // Scale model to fit view
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 3 / (maxDim || 1); // Prevent division by zero
      model.scale.set(scale, scale, scale);
      
      // Center model after scaling
      const scaledBox = new THREE.Box3().setFromObject(model);
      const center = scaledBox.getCenter(new THREE.Vector3());
      model.position.x -= center.x;
      model.position.y -= center.y;
      model.position.z -= center.z;
      
      scene.add(model);
      setLoading(false);
      setError(null);
    };

    const handleError = (err: any) => {
      console.warn(`Error loading format ${formatType} from ${url}:`, err);
      // Try next format
      setCurrentFormatIndex(prev => prev + 1);
    };

    const extension = url.split('.').pop()?.toLowerCase();
    const isObj = formatType?.includes('OBJ') || extension === 'obj';
    const isVox = formatType === 'VOX' || extension === 'vox';

    if (isObj) {
      if (mtlUrl) {
        const mtlLoader = new MTLLoader();
        mtlLoader.load(mtlUrl, (materials) => {
          materials.preload();
          const objLoader = new OBJLoader();
          objLoader.setMaterials(materials);
          objLoader.load(url, setupModel, undefined, handleError);
        }, undefined, handleError);
      } else {
        const objLoader = new OBJLoader();
        objLoader.load(url, setupModel, undefined, handleError);
      }
    } else if (isVox) {
      const voxLoader = new VOXLoader();
      voxLoader.load(url, (chunks) => {
        const group = new THREE.Group();
        for (let i = 0; i < chunks.length; i++) {
          const chunk = chunks[i];
          const mesh = new VOXMesh(chunk);
          group.add(mesh);
        }
        setupModel(group);
      }, undefined, handleError);
    } else {
      const dracoLoader = new DRACOLoader();
      dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      const loader = new GLTFLoader();
      loader.setDRACOLoader(dracoLoader);
      
      loader.load(
        url,
        (gltf) => setupModel(gltf.scene),
        undefined,
        handleError
      );
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [formats, currentFormatIndex]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className={`relative group ${className}`} ref={containerRef}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 text-white p-4 text-center">
          {error}
        </div>
      )}
      <button
        onClick={toggleFullscreen}
        className="absolute bottom-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-20 opacity-0 group-hover:opacity-100"
      >
        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
      </button>
    </div>
  );
};
