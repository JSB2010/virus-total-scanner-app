/**
 * Performance Monitor Service for DropSentinel
 * Tracks system performance, scan times, and provides optimization recommendations
 */

import os from 'os';
import { databaseService } from './databaseService';

export interface PerformanceMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  scanningActive: boolean;
  activeScans: number;
  queuedScans: number;
  avgScanTime: number;
  systemLoad: number;
}

export interface ScanPerformance {
  scanId: string;
  fileName: string;
  fileSize: number;
  scanDuration: number;
  engineCount: number;
  scanSpeed: number; // MB/s
  cpuUsageDuring: number;
  memoryUsageDuring: number;
  timestamp: string;
}

export interface PerformanceReport {
  summary: {
    avgScanTime: number;
    avgCpuUsage: number;
    avgMemoryUsage: number;
    totalScansToday: number;
    performanceScore: number; // 0-100
  };
  trends: {
    scanTimesTrend: 'improving' | 'stable' | 'degrading';
    resourceUsageTrend: 'improving' | 'stable' | 'degrading';
    throughputTrend: 'improving' | 'stable' | 'degrading';
  };
  recommendations: string[];
  bottlenecks: string[];
}

export class PerformanceMonitorService {
  private static instance: PerformanceMonitorService;
  private isMonitoring = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private scanPerformanceData: ScanPerformance[] = [];
  private currentScans = new Map<string, { startTime: number; fileName: string; fileSize: number }>();

  // Performance thresholds
  private readonly CPU_WARNING_THRESHOLD = 80; // %
  private readonly MEMORY_WARNING_THRESHOLD = 85; // %
  private readonly SLOW_SCAN_THRESHOLD = 30000; // 30 seconds
  private readonly MONITORING_INTERVAL = 5000; // 5 seconds

  private constructor() {}

  public static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService();
    }
    return PerformanceMonitorService.instance;
  }

  /**
   * Start performance monitoring
   */
  public async startMonitoring(): Promise<void> {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    console.log('[PERFORMANCE] 📊 Starting performance monitoring');

    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, this.MONITORING_INTERVAL);
  }

  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    console.log('[PERFORMANCE] 📊 Stopped performance monitoring');
  }

  /**
   * Collect current system metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        timestamp: new Date().toISOString(),
        cpuUsage: await this.getCpuUsage(),
        memoryUsage: this.getMemoryUsage(),
        diskUsage: await this.getDiskUsage(),
        scanningActive: this.currentScans.size > 0,
        activeScans: this.currentScans.size,
        queuedScans: 0, // Would need to integrate with scan queue
        avgScanTime: this.getAverageScanTime(),
        systemLoad: os.loadavg()[0]
      };

      // Store metrics in database
      await this.storeMetrics(metrics);

      // Check for performance issues
      await this.checkPerformanceIssues(metrics);

    } catch (error) {
      console.error('[PERFORMANCE] ❌ Error collecting metrics:', error);
    }
  }

  /**
   * Get CPU usage percentage
   */
  private async getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = this.cpuAverage();
      
      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const cpuPercentage = 100 - ~~(100 * idleDifference / totalDifference);
        resolve(cpuPercentage);
      }, 100);
    });
  }

  /**
   * Helper function for CPU measurement
   */
  private cpuAverage(): { idle: number; total: number } {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }

    return {
      idle: totalIdle / cpus.length,
      total: totalTick / cpus.length
    };
  }

  /**
   * Get memory usage percentage
   */
  private getMemoryUsage(): number {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    return (usedMemory / totalMemory) * 100;
  }

  /**
   * Get disk usage (simplified - would need platform-specific implementation)
   */
  private async getDiskUsage(): Promise<number> {
    // This is a simplified implementation
    // In a real app, you'd use platform-specific commands or libraries
    return 50; // Placeholder
  }

  /**
   * Get average scan time from recent scans
   */
  private getAverageScanTime(): number {
    if (this.scanPerformanceData.length === 0) {
      return 0;
    }

    const recentScans = this.scanPerformanceData.slice(-10); // Last 10 scans
    const totalTime = recentScans.reduce((sum, scan) => sum + scan.scanDuration, 0);
    return totalTime / recentScans.length;
  }

  /**
   * Store metrics in database
   */
  private async storeMetrics(metrics: PerformanceMetrics): Promise<void> {
    try {
      // This would use the database service to store metrics
      // await databaseService.storeSystemMetrics(metrics);
      console.log(`[PERFORMANCE] 📊 CPU: ${metrics.cpuUsage.toFixed(1)}%, Memory: ${metrics.memoryUsage.toFixed(1)}%, Active Scans: ${metrics.activeScans}`);
    } catch (error) {
      console.error('[PERFORMANCE] ❌ Error storing metrics:', error);
    }
  }

  /**
   * Check for performance issues and alert if necessary
   */
  private async checkPerformanceIssues(metrics: PerformanceMetrics): Promise<void> {
    const issues: string[] = [];

    if (metrics.cpuUsage > this.CPU_WARNING_THRESHOLD) {
      issues.push(`High CPU usage: ${metrics.cpuUsage.toFixed(1)}%`);
    }

    if (metrics.memoryUsage > this.MEMORY_WARNING_THRESHOLD) {
      issues.push(`High memory usage: ${metrics.memoryUsage.toFixed(1)}%`);
    }

    if (metrics.avgScanTime > this.SLOW_SCAN_THRESHOLD) {
      issues.push(`Slow scan performance: ${(metrics.avgScanTime / 1000).toFixed(1)}s average`);
    }

    if (issues.length > 0) {
      console.warn('[PERFORMANCE] ⚠️ Performance issues detected:', issues);
      // Could trigger notifications or automatic optimizations
    }
  }

  /**
   * Start tracking a scan
   */
  public startScanTracking(scanId: string, fileName: string, fileSize: number): void {
    this.currentScans.set(scanId, {
      startTime: Date.now(),
      fileName,
      fileSize
    });

    console.log(`[PERFORMANCE] 🔍 Started tracking scan: ${fileName} (${fileSize} bytes)`);
  }

  /**
   * End tracking a scan and record performance
   */
  public endScanTracking(scanId: string, engineCount: number): void {
    const scanData = this.currentScans.get(scanId);
    if (!scanData) {
      return;
    }

    const endTime = Date.now();
    const scanDuration = endTime - scanData.startTime;
    const scanSpeed = scanData.fileSize / (scanDuration / 1000); // bytes per second

    const performance: ScanPerformance = {
      scanId,
      fileName: scanData.fileName,
      fileSize: scanData.fileSize,
      scanDuration,
      engineCount,
      scanSpeed,
      cpuUsageDuring: 0, // Would need to track during scan
      memoryUsageDuring: 0, // Would need to track during scan
      timestamp: new Date().toISOString()
    };

    this.scanPerformanceData.push(performance);
    this.currentScans.delete(scanId);

    // Keep only last 100 scan records in memory
    if (this.scanPerformanceData.length > 100) {
      this.scanPerformanceData = this.scanPerformanceData.slice(-100);
    }

    console.log(`[PERFORMANCE] ✅ Scan completed: ${scanData.fileName} in ${scanDuration}ms (${(scanSpeed / 1024).toFixed(2)} KB/s)`);
  }

  /**
   * Generate performance report
   */
  public async generateReport(): Promise<PerformanceReport> {
    const recentScans = this.scanPerformanceData.slice(-50); // Last 50 scans
    
    const summary = {
      avgScanTime: recentScans.length > 0 ? 
        recentScans.reduce((sum, scan) => sum + scan.scanDuration, 0) / recentScans.length : 0,
      avgCpuUsage: 0, // Would calculate from stored metrics
      avgMemoryUsage: 0, // Would calculate from stored metrics
      totalScansToday: recentScans.filter(scan => 
        new Date(scan.timestamp).toDateString() === new Date().toDateString()
      ).length,
      performanceScore: this.calculatePerformanceScore()
    };

    const trends = {
      scanTimesTrend: this.analyzeTrend(recentScans.map(s => s.scanDuration)) as any,
      resourceUsageTrend: 'stable' as any, // Would analyze from metrics
      throughputTrend: this.analyzeTrend(recentScans.map(s => s.scanSpeed)) as any
    };

    const recommendations = await this.generateRecommendations(summary);
    const bottlenecks = await this.identifyBottlenecks();

    return {
      summary,
      trends,
      recommendations,
      bottlenecks
    };
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(): number {
    // Simplified scoring algorithm
    let score = 100;
    
    const avgScanTime = this.getAverageScanTime();
    if (avgScanTime > 20000) score -= 20; // Slow scans
    if (avgScanTime > 30000) score -= 20; // Very slow scans
    
    // Would factor in CPU, memory, and other metrics
    
    return Math.max(0, score);
  }

  /**
   * Analyze trend in data
   */
  private analyzeTrend(data: number[]): 'improving' | 'stable' | 'degrading' {
    if (data.length < 5) return 'stable';
    
    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (change < -0.1) return 'improving';
    if (change > 0.1) return 'degrading';
    return 'stable';
  }

  /**
   * Generate performance recommendations
   */
  private async generateRecommendations(summary: any): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (summary.avgScanTime > 20000) {
      recommendations.push('Consider enabling scan caching to improve performance');
      recommendations.push('Check if multiple scans are running simultaneously');
    }
    
    if (summary.performanceScore < 70) {
      recommendations.push('System performance is below optimal - consider closing other applications');
    }
    
    if (summary.totalScansToday > 100) {
      recommendations.push('High scan volume detected - consider batch processing');
    }
    
    return recommendations;
  }

  /**
   * Identify performance bottlenecks
   */
  private async identifyBottlenecks(): Promise<string[]> {
    const bottlenecks: string[] = [];
    
    // Analyze recent performance data
    const recentScans = this.scanPerformanceData.slice(-20);
    
    if (recentScans.some(scan => scan.scanDuration > 30000)) {
      bottlenecks.push('Slow scan times detected - possible network or API issues');
    }
    
    if (this.currentScans.size > 3) {
      bottlenecks.push('Multiple concurrent scans - consider scan queue management');
    }
    
    return bottlenecks;
  }

  /**
   * Get current performance status
   */
  public getCurrentStatus(): {
    isMonitoring: boolean;
    activeScans: number;
    avgScanTime: number;
    performanceScore: number;
  } {
    return {
      isMonitoring: this.isMonitoring,
      activeScans: this.currentScans.size,
      avgScanTime: this.getAverageScanTime(),
      performanceScore: this.calculatePerformanceScore()
    };
  }
}

// Export singleton instance
export const performanceMonitorService = PerformanceMonitorService.getInstance();
