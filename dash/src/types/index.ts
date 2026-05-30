export interface FileItem {
  Id?: string;
  Type: string;
  Name: string;
  Path: string;
  Size: number;
  Text?: string;
  Note?: string;
}

export interface ShareData {
  shareList: FileItem[];
}

export interface BrowseEntry {
  name: string;
  isDir: boolean;
  size: number;
  relPath: string;
}

export interface BrowseData {
  folderId: string;
  sub: string;
  entries: BrowseEntry[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  code?: number;
  message?: string;
}