// ============================================================================
// PREPOS BROWSER NOTIFICATION ADAPTER (PHASE 6.16)
// Client-Safe Web Notification Adapter with Explicit Permission Gates
// Never Automatically Prompts or Fabricates Server-Side Push
// ============================================================================

export type BrowserPermissionState = 'default' | 'granted' | 'denied' | 'unsupported';

export interface NotificationAdapter {
  isSupported(): boolean;
  getPermission(): BrowserPermissionState;
  requestPermission(): Promise<BrowserPermissionState>;
  sendNotification(title: string, options?: NotificationOptions): boolean;
}

class BrowserNotificationAdapter implements NotificationAdapter {
  isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    return 'Notification' in window;
  }

  getPermission(): BrowserPermissionState {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission as BrowserPermissionState;
  }

  async requestPermission(): Promise<BrowserPermissionState> {
    if (!this.isSupported()) return 'unsupported';
    try {
      const permission = await Notification.requestPermission();
      return permission as BrowserPermissionState;
    } catch {
      return 'denied';
    }
  }

  sendNotification(title: string, options?: NotificationOptions): boolean {
    if (!this.isSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch {
      return false;
    }
  }
}

export const browserNotificationAdapter = new BrowserNotificationAdapter();

/**
 * Returns user's detected client timezone (for optional suggestion).
 */
export function getDetectedClientTimezone(): string {
  try {
    if (typeof window !== 'undefined' && Intl && Intl.DateTimeFormat) {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }
  } catch {
    // fallback
  }
  return 'UTC';
}
