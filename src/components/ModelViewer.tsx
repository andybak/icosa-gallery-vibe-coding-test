import React, { useMemo } from 'react';

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
  const viewerSrc = useMemo(() => {
    if (formats.length === 0) return null;

    // Use the first (highest-priority) format
    const { url, formatType, mtlUrl } = formats[0];
    if (!url) return null;

    const params = new URLSearchParams({ url, format: formatType });
    if (mtlUrl) params.set('mtlUrl', mtlUrl);

    return `viewer.html?${params.toString()}`;
  }, [formats]);

  if (!viewerSrc) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 text-zinc-500 ${className}`}>
        No viewable format available
      </div>
    );
  }

  return (
    <iframe
      key={viewerSrc}
      src={viewerSrc}
      className={className}
      style={{ border: 'none', display: 'block' }}
      allow="xr-spatial-tracking; fullscreen"
      title="3D Model Viewer"
    />
  );
};
