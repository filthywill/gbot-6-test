import { useRef } from 'react';
import { ProcessedSvg, SvgCacheItem } from '../types';

// Cache expiration time in milliseconds (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

export const useSvgCache = () => {
  // Using a ref instead of state to avoid re-renders when cache updates
  const cacheRef = useRef<Record<string, SvgCacheItem>>({});
  
  const getCachedSvg = (key: string): ProcessedSvg | null => {
    const now = Date.now();
    const cachedItem = cacheRef.current[key];
    
    if (!cachedItem) return null;
    
    // Check if cached item has expired
    if (now - cachedItem.timestamp > CACHE_EXPIRATION) {
      delete cacheRef.current[key];
      return null;
    }
    
    return cachedItem.svg;
  };
  
  const cacheSvg = (key: string, svg: ProcessedSvg): void => {
    cacheRef.current[key] = {
      svg,
      timestamp: Date.now()
    };
  };
  
  const clearCache = (): void => {
    cacheRef.current = {};
  };
  
  return {
    getCachedSvg,
    cacheSvg,
    clearCache
  };
};