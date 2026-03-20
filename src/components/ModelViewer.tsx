import React, { useEffect, useRef } from 'react';
import '../lib/icosa-viewer.css';
// @ts-ignore - pre-built ES module, types provided separately
import { Viewer } from '../lib/icosa-viewer.module.js';

interface ModelFormat {
  url: string;
  formatType: string;
  mtlUrl?: string;
}

interface ModelViewerProps {
  formats: ModelFormat[];
  className?: string;
}

const ASSET_BASE_URL = 'https://icosa-foundation.github.io/icosa-sketch-assets/';

export const ModelViewer: React.FC<ModelViewerProps> = ({ formats, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || formats.length === 0) return;

    const { url, formatType, mtlUrl } = formats[0];
    if (!url) return;

    const viewer = new Viewer(ASSET_BASE_URL, containerRef.current);

    const fmt = formatType.toUpperCase();
    if (fmt === 'TILT') {
      viewer.loadTilt(url, {});
    } else if (fmt === 'OBJ' || fmt === 'OBJ_NGON') {
      mtlUrl ? viewer.loadObjWithMtl(url, mtlUrl, {}) : viewer.loadObj(url, {});
    } else if (fmt === 'FBX') {
      viewer.loadFbx(url, {});
    } else if (fmt === 'PLY') {
      viewer.loadPly(url, {});
    } else if (fmt === 'STL') {
      viewer.loadStl(url, {});
    } else if (fmt === 'USDZ') {
      viewer.loadUsdz(url, {});
    } else if (fmt === 'VOX') {
      viewer.loadVox(url, {});
    } else if (fmt === 'GLTF1') {
      viewer.loadGltf1(url, true, {});
    } else {
      viewer.loadGltf(url, true, {});
    }

    return () => {
      // The viewer doesn't expose a dispose method; clear the container
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [formats]);

  return <div ref={containerRef} className={className} style={{ position: 'relative' }} />;
};
