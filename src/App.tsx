import React, { useEffect, useState, useCallback } from 'react';
import { Search, Box, Loader2, ArrowLeft, Download, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { icosaApi } from './services/icosaApi';
import { IcosaAsset } from './types/icosa';
import { ModelCard } from './components/ModelCard';
import { ModelViewer } from './components/ModelViewer';

export default function App() {
  const [assets, setAssets] = useState<IcosaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<IcosaAsset | null>(null);
  const [pageToken, setPageToken] = useState<string | undefined>(undefined);
  const [isSearching, setIsSearching] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [orderBy, setOrderBy] = useState<string>('BEST');
  const [category, setCategory] = useState<string>('');
  const [curated, setCurated] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const fetchAssets = useCallback(async (token?: string, query?: string, order?: string, cat?: string, isCurated?: boolean) => {
    try {
      setLoading(true);
      const params = {
        pageToken: token,
        orderBy: order,
        category: cat || undefined,
        curated: isCurated || undefined,
      };
      
      const response = query 
        ? await icosaApi.searchAssets(query, params)
        : await icosaApi.getAssets(params);
      
      if (token) {
        setAssets(prev => [...prev, ...response.assets]);
      } else {
        setAssets(response.assets);
      }
      setPageToken(response.nextPageToken);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  // Initial load and when filters change
  useEffect(() => {
    fetchAssets(undefined, searchQuery, orderBy, category, curated);
  }, [orderBy, category, curated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    fetchAssets(undefined, searchQuery, orderBy, category, curated);
  };

  const loadMore = () => {
    if (pageToken && !loading) {
      fetchAssets(pageToken, searchQuery, orderBy, category, curated);
    }
  };

  const getSortedFormats = (asset: IcosaAsset) => {
    // Prefer GLB or GLTF2, then OBJ, then VOX. Ignore web.archive.org URLs.
    const validFormats = asset.formats.filter(f => !f.root?.url?.includes('web.archive.org') && ['GLB', 'GLTF2', 'OBJ', 'OBJ_NGON', 'VOX'].includes(f.formatType));
    
    return [...validFormats].sort((a, b) => {
      const typeScore = (type: string) => {
        if (type === 'GLB') return 0;
        if (type === 'GLTF2') return 1;
        if (type === 'OBJ' || type === 'OBJ_NGON') return 2;
        if (type === 'VOX') return 3;
        return 4;
      };
      return typeScore(a.formatType) - typeScore(b.formatType);
    }).map(f => ({
      url: f.root?.url || '',
      formatType: f.formatType,
      mtlUrl: f.resources?.find(r => r.relativePath.endsWith('.mtl'))?.url
    })).filter(f => f.url !== '');
  };

  const sortedFormats = selectedAsset ? getSortedFormats(selectedAsset) : [];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-bottom border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Box className="text-black" size={20} />
            </div>
            <h1 className="text-lg font-bold tracking-tight hidden sm:block">Icosa Explorer</h1>
          </div>

          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search 3D models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-emerald-500 transition-all text-sm outline-none"
            />
          </form>

          <div className="flex items-center gap-4 shrink-0">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors">
              <Info size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters and Sorting */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Sort by:</span>
            <select
              value={orderBy}
              onChange={(e) => setOrderBy(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="BEST">Best Match</option>
              <option value="NEWEST">Newest</option>
              <option value="OLDEST">Oldest</option>
              <option value="-LIKES">Most Liked</option>
              <option value="-DOWNLOADS">Most Downloaded</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-400">Category:</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer hover:bg-zinc-800 transition-colors"
            >
              <option value="">All Categories</option>
              <option value="ANIMALS">Animals</option>
              <option value="ARCHITECTURE">Architecture</option>
              <option value="ART">Art</option>
              <option value="CULTURE">Culture</option>
              <option value="EVENTS">Events</option>
              <option value="FOOD">Food</option>
              <option value="HISTORY">History</option>
              <option value="HOME">Home</option>
              <option value="NATURE">Nature</option>
              <option value="OBJECTS">Objects</option>
              <option value="PEOPLE">People</option>
              <option value="PLACES">Places</option>
              <option value="SCIENCE">Science</option>
              <option value="SPORTS">Sports</option>
              <option value="TECH">Tech</option>
              <option value="TRANSPORT">Transport</option>
              <option value="TRAVEL">Travel</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={curated}
              onChange={(e) => setCurated(e.target.checked)}
              className="w-4 h-4 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-zinc-950"
            />
            <span className="text-sm text-zinc-400">Curated only</span>
          </label>
        </div>

        {assets.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Box size={48} className="mb-4 opacity-20" />
            <p>No models found. Try a different search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {assets.map((asset, index) => (
              <motion.div
                key={`${asset.name}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index % 12 * 0.05 }}
              >
                <ModelCard asset={asset} onClick={setSelectedAsset} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        {/* Load More */}
        {pageToken && !loading && (
          <div className="flex justify-center py-12">
            <button
              onClick={loadMore}
              className="px-8 py-3 bg-zinc-900 hover:bg-zinc-800 rounded-full text-sm font-medium transition-colors border border-zinc-800"
            >
              Load More
            </button>
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedAsset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-8"
          >
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setSelectedAsset(null)} />
            
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full h-full max-w-6xl bg-zinc-950 sm:rounded-2xl overflow-hidden flex flex-col md:flex-row border border-zinc-800 shadow-2xl"
            >
              {/* Viewer Area */}
              <div className="flex-1 bg-black relative min-h-[40vh] md:min-h-0">
                <button
                  onClick={() => setSelectedAsset(null)}
                  className="absolute top-4 left-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                </button>
                
                {sortedFormats.length > 0 ? (
                  <ModelViewer formats={sortedFormats} className="w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-500 flex-col gap-4">
                    <Box size={48} className="opacity-20" />
                    <p>3D Preview not available for this format.</p>
                  </div>
                )}
              </div>

              {/* Info Sidebar */}
              <div className="w-full md:w-80 lg:w-96 p-6 overflow-y-auto bg-zinc-950 border-l border-zinc-800">
                <h2 className="text-2xl font-bold mb-2">{selectedAsset.displayName || selectedAsset.name}</h2>
                <div className="flex items-center gap-2 mb-6 text-emerald-500 text-sm">
                  <span>by {selectedAsset.authorName || 'Unknown'}</span>
                </div>

                <p className="text-zinc-400 text-sm leading-relaxed mb-8">
                  {selectedAsset.description || "No description provided."}
                </p>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">Available Formats</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedAsset.formats.map((format, i) => (
                      <div key={i} className="px-3 py-2 bg-zinc-900 rounded-lg text-xs flex items-center justify-between border border-zinc-800">
                        <span className="font-mono">{format.formatType}</span>
                        {format.root?.url && (
                          <a href={format.root.url} download className="text-zinc-500 hover:text-emerald-500">
                            <Download size={14} />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-zinc-800">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span>Published</span>
                    <span>{selectedAsset.createTime ? new Date(selectedAsset.createTime).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PWA Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50 bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shrink-0">
                <Box className="text-black" size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Install App</h4>
                <p className="text-xs text-zinc-400">Add to home screen for quick access</p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold rounded-full transition-colors shrink-0"
            >
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors border border-zinc-700"
            >
              &times;
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
