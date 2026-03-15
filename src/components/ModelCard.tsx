import React from 'react';
import { IcosaAsset } from '../types/icosa';
import { User, Calendar } from 'lucide-react';

interface ModelCardProps {
  asset: IcosaAsset;
  onClick: (asset: IcosaAsset) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ asset, onClick }) => {
  return (
    <div 
      onClick={() => onClick(asset)}
      className="bg-zinc-900 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all group"
    >
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={asset.thumbnail?.url || 'https://picsum.photos/seed/placeholder/400/400'} 
          alt={asset.displayName || asset.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <p className="text-white text-sm line-clamp-2">{asset.description || 'No description'}</p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-white font-medium truncate mb-2">{asset.displayName || asset.name}</h3>
        <div className="flex items-center justify-between text-zinc-400 text-xs">
          <div className="flex items-center gap-1">
            <User size={12} />
            <span className="truncate max-w-[100px]">{asset.authorName || 'Unknown'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{asset.createTime ? new Date(asset.createTime).toLocaleDateString() : 'Unknown'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
