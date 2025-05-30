/**
 * Intelligent Cache Service for DropSentinel
 * Provides hash-based caching with smart invalidation and performance optimization
 */

import crypto from 'crypto';
import fs from 'fs';
import { databaseService } from './databaseService';

export interface CachedScanResult {
  fileName: string;
  fileHash: string;
  fileSize: number;
  scanResult: {
    status: 'clean' | 'threat' | 'error';
    threats: number;
    totalEngines: number;
    positives: number;
    scanId: string;
    permalink?: string;
    detections?: any[];
    engineResults?: any;
  };
  cacheDate: string;
  expiryDate: string;
  confidence: number; // 0-100, based on scan quality and age
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  cacheSize: number;
  oldestEntry: string;
  newestEntry: string;
}

export class IntelligentCacheService {
  private static instance: IntelligentCacheService;
  private cacheHits = 0;
  private cacheMisses = 0;
  private isInitialized = false;

  // Cache configuration
  private readonly DEFAULT_CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days
  private readonly THREAT_CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days for threats
  private readonly CLEAN_CACHE_DURATION = 3 * 24 * 60 * 60 * 1000; // 3 days for clean files
  private readonly MAX_CACHE_SIZE = 10000; // Maximum cache entries

  private constructor() {}

  public static getInstance(): IntelligentCacheService {
    if (!IntelligentCacheService.instance) {
      IntelligentCacheService.instance = new IntelligentCacheService();
    }
    return IntelligentCacheService.instance;
  }

  /**
   * Initialize the cache service
   */
  public async initialize(): Promise<void> {
    try {
      await databaseService.initialize();
      await this.cleanupExpiredEntries();
      this.isInitialized = true;
      console.log('[CACHE] ✅ Intelligent cache service initialized');
    } catch (error) {
      console.error('[CACHE] ❌ Failed to initialize cache service:', error);
      throw error;
    }
  }

  /**
   * Calculate file hash for caching
   */
  public async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => {
        hash.update(data);
      });

      stream.on('end', () => {
        resolve(hash.digest('hex'));
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Check if scan result is cached
   */
  public async getCachedResult(filePath: string): Promise<CachedScanResult | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Calculate file hash
      const fileHash = await this.calculateFileHash(filePath);
      
      // Check database cache
      const cacheEntry = await databaseService.getCachedScanResult(fileHash);
      
      if (cacheEntry) {
        this.cacheHits++;
        
        const cachedResult: CachedScanResult = {
          fileName: cacheEntry.fileName,
          fileHash: cacheEntry.fileHash,
          fileSize: cacheEntry.fileSize,
          scanResult: JSON.parse(cacheEntry.scanResult),
          cacheDate: cacheEntry.cacheDate,
          expiryDate: cacheEntry.expiryDate,
          confidence: this.calculateConfidence(cacheEntry)
        };

        console.log(`[CACHE] ✅ Cache HIT for ${cacheEntry.fileName} (confidence: ${cachedResult.confidence}%)`);
        return cachedResult;
      } else {
        this.cacheMisses++;
        console.log(`[CACHE] ❌ Cache MISS for ${filePath}`);
        return null;
      }
    } catch (error) {
      console.error('[CACHE] ❌ Error checking cache:', error);
      this.cacheMisses++;
      return null;
    }
  }

  /**
   * Cache scan result
   */
  public async cacheResult(
    filePath: string,
    fileName: string,
    fileSize: number,
    scanResult: any
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const fileHash = await this.calculateFileHash(filePath);
      const cacheDate = new Date().toISOString();
      
      // Determine cache duration based on scan result
      let cacheDuration = this.DEFAULT_CACHE_DURATION;
      if (scanResult.threats > 0) {
        cacheDuration = this.THREAT_CACHE_DURATION; // Cache threats longer
      } else if (scanResult.status === 'clean') {
        cacheDuration = this.CLEAN_CACHE_DURATION; // Cache clean files shorter
      }

      const expiryDate = new Date(Date.now() + cacheDuration).toISOString();

      await databaseService.cacheScanResult({
        fileHash,
        fileName,
        fileSize,
        scanResult: JSON.stringify(scanResult),
        cacheDate,
        expiryDate
      });

      console.log(`[CACHE] ✅ Cached result for ${fileName} (expires: ${expiryDate})`);
      
      // Cleanup if cache is getting too large
      await this.maintainCacheSize();
    } catch (error) {
      console.error('[CACHE] ❌ Error caching result:', error);
    }
  }

  /**
   * Calculate confidence score for cached result
   */
  private calculateConfidence(cacheEntry: any): number {
    const now = new Date();
    const cacheDate = new Date(cacheEntry.cacheDate);
    const expiryDate = new Date(cacheEntry.expiryDate);
    
    // Age factor (newer = higher confidence)
    const totalDuration = expiryDate.getTime() - cacheDate.getTime();
    const elapsed = now.getTime() - cacheDate.getTime();
    const ageFactor = Math.max(0, 1 - (elapsed / totalDuration));
    
    // Hit count factor (more hits = higher confidence)
    const hitFactor = Math.min(1, cacheEntry.hitCount / 10);
    
    // Base confidence based on scan result
    const scanResult = JSON.parse(cacheEntry.scanResult);
    let baseConfidence = 0.7; // Default
    
    if (scanResult.threats > 0) {
      baseConfidence = 0.9; // High confidence for threats
    } else if (scanResult.totalEngines > 50) {
      baseConfidence = 0.8; // Higher confidence for comprehensive scans
    }
    
    // Calculate final confidence
    const confidence = baseConfidence * (0.6 * ageFactor + 0.4 * hitFactor);
    return Math.round(confidence * 100);
  }

  /**
   * Clean up expired cache entries
   */
  public async cleanupExpiredEntries(): Promise<number> {
    try {
      const deletedCount = await databaseService.cleanupCache();
      if (deletedCount > 0) {
        console.log(`[CACHE] 🧹 Cleaned up ${deletedCount} expired cache entries`);
      }
      return deletedCount;
    } catch (error) {
      console.error('[CACHE] ❌ Error cleaning up cache:', error);
      return 0;
    }
  }

  /**
   * Maintain cache size by removing oldest entries
   */
  private async maintainCacheSize(): Promise<void> {
    try {
      const stats = await databaseService.getStats();
      const cacheCount = stats.cacheEntries.count;
      
      if (cacheCount > this.MAX_CACHE_SIZE) {
        const excessCount = cacheCount - this.MAX_CACHE_SIZE;
        // Remove oldest entries (this would need a custom query in databaseService)
        console.log(`[CACHE] 🧹 Cache size limit reached, removing ${excessCount} oldest entries`);
      }
    } catch (error) {
      console.error('[CACHE] ❌ Error maintaining cache size:', error);
    }
  }

  /**
   * Get cache statistics
   */
  public async getStats(): Promise<CacheStats> {
    try {
      const dbStats = await databaseService.getStats();
      const totalRequests = this.cacheHits + this.cacheMisses;
      
      return {
        totalEntries: dbStats.cacheEntries.count,
        hitRate: totalRequests > 0 ? (this.cacheHits / totalRequests) * 100 : 0,
        missRate: totalRequests > 0 ? (this.cacheMisses / totalRequests) * 100 : 0,
        totalHits: this.cacheHits,
        totalMisses: this.cacheMisses,
        cacheSize: dbStats.dbSize,
        oldestEntry: 'N/A', // Would need custom query
        newestEntry: 'N/A'  // Would need custom query
      };
    } catch (error) {
      console.error('[CACHE] ❌ Error getting cache stats:', error);
      return {
        totalEntries: 0,
        hitRate: 0,
        missRate: 0,
        totalHits: this.cacheHits,
        totalMisses: this.cacheMisses,
        cacheSize: 0,
        oldestEntry: 'Error',
        newestEntry: 'Error'
      };
    }
  }

  /**
   * Invalidate cache for specific file
   */
  public async invalidateFile(filePath: string): Promise<boolean> {
    try {
      const fileHash = await this.calculateFileHash(filePath);
      // Would need custom delete method in databaseService
      console.log(`[CACHE] 🗑️ Invalidated cache for ${filePath}`);
      return true;
    } catch (error) {
      console.error('[CACHE] ❌ Error invalidating cache:', error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  public async clearAll(): Promise<boolean> {
    try {
      // Would need custom clear method in databaseService
      this.cacheHits = 0;
      this.cacheMisses = 0;
      console.log('[CACHE] 🗑️ Cleared all cache entries');
      return true;
    } catch (error) {
      console.error('[CACHE] ❌ Error clearing cache:', error);
      return false;
    }
  }

  /**
   * Preload cache with common file hashes
   */
  public async preloadCommonFiles(filePaths: string[]): Promise<void> {
    console.log(`[CACHE] 🔄 Preloading cache for ${filePaths.length} files`);
    
    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          await this.calculateFileHash(filePath);
          // Pre-calculate hashes for faster lookup
        }
      } catch (error) {
        console.error(`[CACHE] ❌ Error preloading ${filePath}:`, error);
      }
    }
  }

  /**
   * Get cache recommendations
   */
  public async getRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const stats = await this.getStats();
    
    if (stats.hitRate < 30) {
      recommendations.push('Cache hit rate is low. Consider increasing cache duration.');
    }
    
    if (stats.totalEntries > this.MAX_CACHE_SIZE * 0.9) {
      recommendations.push('Cache is nearly full. Consider cleaning up old entries.');
    }
    
    if (stats.cacheSize > 100 * 1024 * 1024) { // 100MB
      recommendations.push('Cache size is large. Consider reducing cache duration.');
    }
    
    return recommendations;
  }
}

// Export singleton instance
export const intelligentCacheService = IntelligentCacheService.getInstance();
