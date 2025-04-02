// src/types/index.ts

export interface User {
    id: string | number; 
    name: string;
    postCount: number;
  }
  
export interface Post {
  id: string | number;         
  userId: string | number;     
  content: string;             
  commentCount?: number;       
  userName?: string;           
}

export interface HealthStatus {
    status: 'UP' | string; 
    dataReady: boolean;
}

export interface ApiError {
    error: string;
}

export function isApiError(obj: any): obj is ApiError {
    return typeof obj === 'object' && obj !== null && typeof obj.error === 'string';
}