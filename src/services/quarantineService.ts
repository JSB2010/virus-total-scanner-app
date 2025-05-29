// Secure quarantine service for isolating threat files
export class QuarantineService {
  private static instance: QuarantineService;
  private isElectron: boolean;
  private electronAPI: any;

  private constructor() {
    this.isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    this.electronAPI = this.isElectron ? window.electronAPI : null;
  }

  public static getInstance(): QuarantineService {
    if (!QuarantineService.instance) {
      QuarantineService.instance = new QuarantineService();
    }
    return QuarantineService.instance;
  }

  /**
   * Quarantine a threat file by moving it to a secure location
   */
  public async quarantineFile(filePath: string, threatInfo: {
    fileName: string;
    threats: number;
    scanId: string;
    detections: any[];
  }): Promise<{ success: boolean; quarantinePath?: string; error?: string }> {
    try {
      if (!this.isElectron || !this.electronAPI?.quarantineFile) {
        throw new Error('Quarantine functionality not available');
      }

      console.log(`[QUARANTINE] Quarantining file: ${filePath}`);

      const result = await this.electronAPI.quarantineFile({
        filePath,
        threatInfo,
        timestamp: new Date().toISOString()
      });

      if (result.success) {
        console.log(`[QUARANTINE] ✅ File quarantined successfully: ${result.quarantinePath}`);

        // Update quarantine statistics
        await this.updateQuarantineStats();

        return {
          success: true,
          quarantinePath: result.quarantinePath
        };
      } else {
        console.error(`[QUARANTINE] ❌ Failed to quarantine file: ${result.error}`);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error quarantining file:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get list of quarantined files
   */
  public async getQuarantinedFiles(): Promise<any[]> {
    try {
      if (!this.isElectron || !this.electronAPI?.getQuarantinedFiles) {
        return [];
      }

      const files = await this.electronAPI.getQuarantinedFiles();
      return files || [];
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error getting quarantined files:`, error);
      return [];
    }
  }

  /**
   * Restore a quarantined file to its original location
   */
  public async restoreFile(quarantineId: string, originalPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isElectron || !this.electronAPI?.restoreQuarantinedFile) {
        throw new Error('Restore functionality not available');
      }

      console.log(`[QUARANTINE] Restoring file: ${quarantineId}`);

      const result = await this.electronAPI.restoreQuarantinedFile({
        quarantineId,
        originalPath
      });

      if (result.success) {
        console.log(`[QUARANTINE] ✅ File restored successfully`);
        await this.updateQuarantineStats();
        return { success: true };
      } else {
        console.error(`[QUARANTINE] ❌ Failed to restore file: ${result.error}`);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error restoring file:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Permanently delete a quarantined file
   */
  public async deleteQuarantinedFile(quarantineId: string): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.isElectron || !this.electronAPI?.deleteQuarantinedFile) {
        throw new Error('Delete functionality not available');
      }

      console.log(`[QUARANTINE] Permanently deleting quarantined file: ${quarantineId}`);

      const result = await this.electronAPI.deleteQuarantinedFile(quarantineId);

      if (result.success) {
        console.log(`[QUARANTINE] ✅ File permanently deleted`);
        await this.updateQuarantineStats();
        return { success: true };
      } else {
        console.error(`[QUARANTINE] ❌ Failed to delete file: ${result.error}`);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error deleting quarantined file:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Get quarantine statistics
   */
  public async getQuarantineStats(): Promise<{
    totalQuarantined: number;
    totalRestored: number;
    totalDeleted: number;
    diskSpaceUsed: number;
  }> {
    try {
      if (!this.isElectron || !this.electronAPI?.getQuarantineStats) {
        return {
          totalQuarantined: 0,
          totalRestored: 0,
          totalDeleted: 0,
          diskSpaceUsed: 0
        };
      }

      const stats = await this.electronAPI.getQuarantineStats();
      return stats || {
        totalQuarantined: 0,
        totalRestored: 0,
        totalDeleted: 0,
        diskSpaceUsed: 0
      };
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error getting quarantine stats:`, error);
      return {
        totalQuarantined: 0,
        totalRestored: 0,
        totalDeleted: 0,
        diskSpaceUsed: 0
      };
    }
  }

  /**
   * Update quarantine statistics in the dashboard
   */
  private async updateQuarantineStats(): Promise<void> {
    try {
      const stats = await this.getQuarantineStats();

      if (this.electronAPI?.updateDashboardStats) {
        await this.electronAPI.updateDashboardStats({
          filesQuarantined: stats.totalQuarantined
        });
      }
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error updating quarantine stats:`, error);
    }
  }

  /**
   * Clean up old quarantined files (older than specified days)
   */
  public async cleanupOldFiles(daysOld: number = 30): Promise<{ cleaned: number; error?: string }> {
    try {
      if (!this.isElectron || !this.electronAPI?.cleanupQuarantine) {
        throw new Error('Cleanup functionality not available');
      }

      console.log(`[QUARANTINE] Cleaning up files older than ${daysOld} days`);

      const result = await this.electronAPI.cleanupQuarantine(daysOld);

      if (result.success) {
        console.log(`[QUARANTINE] ✅ Cleaned up ${result.cleaned} old files`);
        await this.updateQuarantineStats();
        return { cleaned: result.cleaned };
      } else {
        console.error(`[QUARANTINE] ❌ Failed to cleanup: ${result.error}`);
        return {
          cleaned: 0,
          error: result.error
        };
      }
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error during cleanup:`, error);
      return {
        cleaned: 0,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check if quarantine is available and properly configured
   */
  public async isQuarantineAvailable(): Promise<boolean> {
    try {
      if (!this.isElectron || !this.electronAPI?.isQuarantineAvailable) {
        return false;
      }

      return await this.electronAPI.isQuarantineAvailable();
    } catch (error) {
      console.error(`[QUARANTINE] ❌ Error checking quarantine availability:`, error);
      return false;
    }
  }
}

// Export singleton instance
export const quarantineService = QuarantineService.getInstance();
