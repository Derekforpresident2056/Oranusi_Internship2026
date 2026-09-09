export interface DiskInfo {
  total: string;
  used: string;
  free: string;
  percentUsed: string;
}

export interface FileItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  sizeMB: string;
  updatedAt: string | Date;
}

export interface IconCategory {
  id: number;
  img: string;
  alt: 'DOCUMENTS' | 'IMAGES' | 'VIDEOS' | 'AUDIO' | 'DOWNLOADS';
  bgcolor: string;
  text: string;
}

export interface ActiveCategoryContext {
  name: 'DOCUMENTS' | 'IMAGES' | 'VIDEOS' | 'AUDIO' | 'DOWNLOADS';
  bgcolor: string;
}