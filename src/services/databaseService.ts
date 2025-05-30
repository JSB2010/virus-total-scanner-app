/**
 * Enhanced Database Service for DropSentinel
 * Provides SQLite-based data management with caching and analytics
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import os from 'os';

export interface ScanRecord {
  id?: number;
  fileName: string;
  filePath: string;
  fileHash: string;
  fileSize: number;
  scanDate: string;
  status: 'clean' | 'threat' | 'error' | 'pending';
  threats: number;
  totalEngines: number;
  scanId: string;
  permalink?: string;
  detections?: string; // JSON string
  scanDuration: number;
  engineResults?: string; // JSON string
  quarantined: boolean;
  quarantinePath?: string;
}

export interface ThreatRecord {
  id?: number;
  scanId: number;
  engineName: string;
  threatName: string;
  threatType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectionDate: string;
  resolved: boolean;
}

export interface SystemMetrics {
  id?: number;
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  scanningActive: boolean;
  threatsDetected: number;
  filesScanned: number;
}

export interface CacheEntry {
  id?: number;
  fileHash: string;
  fileName: string;
  fileSize: number;
  scanResult: string; // JSON string
  cacheDate: string;
  expiryDate: string;
  hitCount: number;
}

export class DatabaseService {
  private db: Database.Database | null = null;
  private dbPath: string;
  private isInitialized = false;

  constructor() {
    // Create database in user data directory
    const userDataPath = path.join(os.homedir(), '.dropsentinel');
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    this.dbPath = path.join(userDataPath, 'dropsentinel.db');
  }

  /**
   * Initialize the database and create tables
   */
  public async initialize(): Promise<void> {
    try {
      this.db = new Database(this.dbPath);
      
      // Enable WAL mode for better performance
      this.db.pragma('journal_mode = WAL');
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 10000');
      this.db.pragma('temp_store = MEMORY');

      await this.createTables();
      await this.createIndexes();
      this.isInitialized = true;

      console.log('[DATABASE] ✅ Database initialized successfully');
    } catch (error) {
      console.error('[DATABASE] ❌ Failed to initialize database:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Scan records table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scan_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileName TEXT NOT NULL,
        filePath TEXT NOT NULL,
        fileHash TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        scanDate TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('clean', 'threat', 'error', 'pending')),
        threats INTEGER DEFAULT 0,
        totalEngines INTEGER DEFAULT 0,
        scanId TEXT UNIQUE NOT NULL,
        permalink TEXT,
        detections TEXT,
        scanDuration INTEGER DEFAULT 0,
        engineResults TEXT,
        quarantined BOOLEAN DEFAULT FALSE,
        quarantinePath TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Threat records table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS threat_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        scanId INTEGER NOT NULL,
        engineName TEXT NOT NULL,
        threatName TEXT NOT NULL,
        threatType TEXT NOT NULL,
        severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
        detectionDate TEXT NOT NULL,
        resolved BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (scanId) REFERENCES scan_records (id) ON DELETE CASCADE
      )
    `);

    // System metrics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        cpuUsage REAL NOT NULL,
        memoryUsage REAL NOT NULL,
        diskUsage REAL NOT NULL,
        scanningActive BOOLEAN DEFAULT FALSE,
        threatsDetected INTEGER DEFAULT 0,
        filesScanned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Cache table for scan results
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scan_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fileHash TEXT UNIQUE NOT NULL,
        fileName TEXT NOT NULL,
        fileSize INTEGER NOT NULL,
        scanResult TEXT NOT NULL,
        cacheDate TEXT NOT NULL,
        expiryDate TEXT NOT NULL,
        hitCount INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Settings table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'string',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Analytics table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_type TEXT NOT NULL,
        event_data TEXT,
        timestamp TEXT NOT NULL,
        session_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  /**
   * Create database indexes for better performance
   */
  private async createIndexes(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_scan_records_hash ON scan_records(fileHash);
      CREATE INDEX IF NOT EXISTS idx_scan_records_date ON scan_records(scanDate);
      CREATE INDEX IF NOT EXISTS idx_scan_records_status ON scan_records(status);
      CREATE INDEX IF NOT EXISTS idx_threat_records_scan ON threat_records(scanId);
      CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
      CREATE INDEX IF NOT EXISTS idx_cache_hash ON scan_cache(fileHash);
      CREATE INDEX IF NOT EXISTS idx_cache_expiry ON scan_cache(expiryDate);
      CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics(event_type);
      CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON analytics(timestamp);
    `);
  }

  /**
   * Add a scan record to the database
   */
  public async addScanRecord(record: Omit<ScanRecord, 'id'>): Promise<number> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const stmt = this.db.prepare(`
      INSERT INTO scan_records (
        fileName, filePath, fileHash, fileSize, scanDate, status, threats,
        totalEngines, scanId, permalink, detections, scanDuration, engineResults,
        quarantined, quarantinePath
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      record.fileName,
      record.filePath,
      record.fileHash,
      record.fileSize,
      record.scanDate,
      record.status,
      record.threats,
      record.totalEngines,
      record.scanId,
      record.permalink || null,
      record.detections || null,
      record.scanDuration,
      record.engineResults || null,
      record.quarantined,
      record.quarantinePath || null
    );

    return result.lastInsertRowid as number;
  }

  /**
   * Get scan records with pagination and filtering
   */
  public async getScanRecords(options: {
    limit?: number;
    offset?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}): Promise<ScanRecord[]> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    let query = 'SELECT * FROM scan_records WHERE 1=1';
    const params: any[] = [];

    if (options.status) {
      query += ' AND status = ?';
      params.push(options.status);
    }

    if (options.dateFrom) {
      query += ' AND scanDate >= ?';
      params.push(options.dateFrom);
    }

    if (options.dateTo) {
      query += ' AND scanDate <= ?';
      params.push(options.dateTo);
    }

    query += ' ORDER BY scanDate DESC';

    if (options.limit) {
      query += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options.offset) {
      query += ' OFFSET ?';
      params.push(options.offset);
    }

    const stmt = this.db.prepare(query);
    return stmt.all(...params) as ScanRecord[];
  }

  /**
   * Check cache for existing scan result
   */
  public async getCachedScanResult(fileHash: string): Promise<CacheEntry | null> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const stmt = this.db.prepare(`
      SELECT * FROM scan_cache 
      WHERE fileHash = ? AND expiryDate > datetime('now')
    `);

    const result = stmt.get(fileHash) as CacheEntry | undefined;
    
    if (result) {
      // Update hit count
      const updateStmt = this.db.prepare(`
        UPDATE scan_cache SET hitCount = hitCount + 1, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);
      updateStmt.run(result.id);
    }

    return result || null;
  }

  /**
   * Cache scan result
   */
  public async cacheScanResult(entry: Omit<CacheEntry, 'id' | 'hitCount'>): Promise<void> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO scan_cache (
        fileHash, fileName, fileSize, scanResult, cacheDate, expiryDate, hitCount
      ) VALUES (?, ?, ?, ?, ?, ?, 0)
    `);

    stmt.run(
      entry.fileHash,
      entry.fileName,
      entry.fileSize,
      entry.scanResult,
      entry.cacheDate,
      entry.expiryDate
    );
  }

  /**
   * Get dashboard statistics
   */
  public async getDashboardStats(): Promise<any> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const stats = this.db.prepare(`
      SELECT 
        COUNT(*) as totalScans,
        SUM(CASE WHEN threats > 0 THEN 1 ELSE 0 END) as threatsDetected,
        SUM(CASE WHEN quarantined = 1 THEN 1 ELSE 0 END) as filesQuarantined,
        MAX(scanDate) as lastScan,
        AVG(scanDuration) as avgScanTime
      FROM scan_records
      WHERE scanDate >= date('now', '-30 days')
    `).get();

    return stats;
  }

  /**
   * Clean up expired cache entries
   */
  public async cleanupCache(): Promise<number> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const stmt = this.db.prepare(`
      DELETE FROM scan_cache WHERE expiryDate <= datetime('now')
    `);

    const result = stmt.run();
    return result.changes;
  }

  /**
   * Close database connection
   */
  public async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      console.log('[DATABASE] ✅ Database connection closed');
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<any> {
    if (!this.db || !this.isInitialized) {
      throw new Error('Database not initialized');
    }

    const stats = {
      scanRecords: this.db.prepare('SELECT COUNT(*) as count FROM scan_records').get(),
      threatRecords: this.db.prepare('SELECT COUNT(*) as count FROM threat_records').get(),
      cacheEntries: this.db.prepare('SELECT COUNT(*) as count FROM scan_cache').get(),
      dbSize: fs.statSync(this.dbPath).size
    };

    return stats;
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
