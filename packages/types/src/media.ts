export type MediaDisk = 'Local' | 'Cloudflare R2';

export interface Media {
  id: string;
  disk: MediaDisk;
  path: string;
  filename: string;
  mimeType: string;
  extension: string;
  size: number;
  width: number | null;
  height: number | null;
  uploadedBy: string;
  createdAt: string;
}

export type CreateMediaInput = {
  disk: MediaDisk;
  path: string;
  filename: string;
  mimeType: string;
  extension: string;
  size: number;
  uploadedBy: string;
};
