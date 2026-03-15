export interface IcosaAsset {
  assetId: string;
  name: string;
  displayName: string;
  description: string;
  authorName: string;
  authorId: string;
  createTime: string;
  updateTime: string;
  thumbnail: {
    url: string;
  };
  formats: {
    formatType: string;
    root: {
      url: string;
    };
    resources?: {
      relativePath: string;
      url: string;
    }[];
  }[];
}

export interface IcosaApiResponse {
  assets: IcosaAsset[];
  nextPageToken?: string;
}
