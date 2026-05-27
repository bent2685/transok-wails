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

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  code?: number;
  message?: string;
}