import { IcosaApiResponse, IcosaAsset } from '../types/icosa';

const BASE_URL = import.meta.env.DEV
  ? `${window.location.origin}/api/v1`
  : 'https://api.icosa.gallery/v1';

const SUPPORTED_FORMATS = ['GLB', 'GLTF2', 'OBJ', 'OBJ_NGON', 'VOX'];

const filterSupportedAssets = (response: IcosaApiResponse): IcosaApiResponse => {
  return {
    ...response,
    assets: response.assets.filter(asset => {
      // Check if the asset has any supported format that is NOT on web.archive.org
      const hasValidFormat = asset.formats.some(format => {
        const isSupportedType = SUPPORTED_FORMATS.includes(format.formatType);
        const isNotArchive = !format.root?.url?.includes('web.archive.org');
        return isSupportedType && isNotArchive;
      });
      return hasValidFormat;
    })
  };
};

export interface FetchAssetsParams {
  pageToken?: string;
  orderBy?: string;
  category?: string;
  format?: string;
  curated?: boolean;
}

export const icosaApi = {
  async getAssets(params: FetchAssetsParams = {}): Promise<IcosaApiResponse> {
    const url = new URL(`${BASE_URL}/assets`);
    if (params.pageToken) url.searchParams.append('pageToken', params.pageToken);
    if (params.orderBy) url.searchParams.append('orderBy', params.orderBy);
    if (params.category) url.searchParams.append('category', params.category);
    if (params.format) url.searchParams.append('format', params.format);
    if (params.curated !== undefined) url.searchParams.append('curated', params.curated.toString());
    
    url.searchParams.append('pageSize', '20');
    
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch assets');
    const data = await response.json();
    return filterSupportedAssets(data);
  },

  async getAsset(urlName: string): Promise<IcosaAsset> {
    const response = await fetch(`${BASE_URL}/assets/${urlName}`);
    if (!response.ok) throw new Error('Failed to fetch asset');
    return response.json();
  },

  async searchAssets(query: string, params: FetchAssetsParams = {}): Promise<IcosaApiResponse> {
    const url = new URL(`${BASE_URL}/assets`);
    url.searchParams.append('keywords', query);
    if (params.pageToken) url.searchParams.append('pageToken', params.pageToken);
    if (params.orderBy) url.searchParams.append('orderBy', params.orderBy);
    if (params.category) url.searchParams.append('category', params.category);
    if (params.format) url.searchParams.append('format', params.format);
    if (params.curated !== undefined) url.searchParams.append('curated', params.curated.toString());
    
    url.searchParams.append('pageSize', '20');

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to search assets');
    const data = await response.json();
    return filterSupportedAssets(data);
  }
};
