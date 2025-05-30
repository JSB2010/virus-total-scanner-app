// Native system notification service for cross-platform notifications
export class NotificationService {
  private static instance: NotificationService;
  private isElectron: boolean;
  private electronAPI: any;

  private constructor() {
    this.isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    this.electronAPI = this.isElectron ? window.electronAPI : null;
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Show a native system notification
   */
  public async showNotification(options: {
    title: string;
    body: string;
    icon?: string;
    urgency?: 'low' | 'normal' | 'critical';
    actions?: Array<{ type: string; text: string }>;
  }): Promise<void> {
    try {
      if (this.isElectron && this.electronAPI?.showNotification) {
        // Use Electron's native notification system
        await this.electronAPI.showNotification({
          title: options.title,
          body: options.body,
          icon: options.icon || 'assets/icon.png',
          urgency: options.urgency || 'normal',
          actions: options.actions || []
        });
      } else if ('Notification' in window) {
        // Fallback to web notifications
        if (Notification.permission === 'granted') {
          new Notification(options.title, {
            body: options.body,
            icon: options.icon || '/icon.png'
          });
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            new Notification(options.title, {
              body: options.body,
              icon: options.icon || '/icon.png'
            });
          }
        }
      }
    } catch (error) {
      console.error('Failed to show notification:', error);
    }
  }

  /**
   * Show file detection notification with scan prompt
   */
  public async showFileDetectionDialog(filePath: string): Promise<boolean> {
    try {
      if (this.isElectron && this.electronAPI?.showFileDetectionDialog) {
        const result = await this.electronAPI.showFileDetectionDialog({
          title: 'New File Detected',
          message: `A new file has been detected:\n\n${filePath}\n\nWould you like to scan this file for threats?`,
          buttons: ['Scan Now', 'Skip', 'Always Skip'],
          defaultId: 0,
          cancelId: 1,
          type: 'question',
          icon: 'assets/icon.png'
        });

        return result.response === 0; // Return true if "Scan Now" was clicked
      } else {
        // Fallback to web confirm dialog
        return confirm(`New file detected: ${filePath}\n\nWould you like to scan this file?`);
      }
    } catch (error) {
      console.error('Failed to show file detection dialog:', error);
      return false;
    }
  }

  /**
   * Show scan start notification
   */
  public async notifyScanStart(fileName: string): Promise<void> {
    await this.showNotification({
      title: 'DropSentinel - Scan Started',
      body: `Scanning ${fileName} for threats...`,
      urgency: 'normal'
    });
  }

  /**
   * Show scan completion notification
   */
  public async notifyScanComplete(fileName: string, result: 'clean' | 'threat' | 'error', details?: string): Promise<void> {
    const notifications = {
      clean: {
        title: 'DropSentinel - File Clean',
        body: `${fileName} is safe - no threats detected.`,
        urgency: 'low' as const
      },
      threat: {
        title: 'DropSentinel - Threat Detected!',
        body: `⚠️ THREAT FOUND in ${fileName}${details ? `\n${details}` : ''}`,
        urgency: 'critical' as const
      },
      error: {
        title: 'DropSentinel - Scan Error',
        body: `Failed to scan ${fileName}. Please try again.`,
        urgency: 'normal' as const
      }
    };

    const notification = notifications[result];
    await this.showNotification(notification);
  }

  /**
   * Show threat quarantine notification
   */
  public async notifyThreatQuarantined(fileName: string): Promise<void> {
    await this.showNotification({
      title: 'DropSentinel - Threat Quarantined',
      body: `🛡️ ${fileName} has been safely quarantined.`,
      urgency: 'normal'
    });
  }

  /**
   * Show monitoring status change notification
   */
  public async notifyMonitoringStatusChange(isActive: boolean): Promise<void> {
    await this.showNotification({
      title: 'DropSentinel - Monitoring Status',
      body: isActive
        ? '🟢 Real-time file monitoring is now active'
        : '🔴 Real-time file monitoring has been paused',
      urgency: 'low'
    });
  }

  /**
   * Request notification permissions
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (this.isElectron) {
        // Electron handles permissions automatically
        return true;
      } else if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
