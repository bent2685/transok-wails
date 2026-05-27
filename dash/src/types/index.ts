export interface FileItem {
  Type: string;
  Name: string;
  Path: string;
  Size: number;
  Text?: string;
}

export interface ShareData {
  shareList: FileItem[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  code?: number;
  message?: string;
}