// Offline functionality utility
export class OfflineService {
  private static STORAGE_KEY = 'productivity-planner-offline-data';
  private static SYNC_QUEUE_KEY = 'productivity-planner-sync-queue';

  static isOnline(): boolean {
    return navigator.onLine;
  }

  static initializeOfflineSupport() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);

    // Check if service worker is available
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
  }

  private static registerServiceWorker() {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  }

  private static handleOnline() {
    console.log('App is back online');
    // Sync offline data when back online
    this.syncOfflineData();
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('app-online'));
  }

  private static handleOffline() {
    console.log('App is offline');
    
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('app-offline'));
  }

  static saveOfflineData(key: string, data: any) {
    try {
      const offlineData = this.getOfflineData();
      offlineData[key] = {
        data,
        timestamp: new Date().toISOString(),
        synced: false
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineData));
      return true;
    } catch (error) {
      console.error('Failed to save offline data:', error);
      return false;
    }
  }

  static getOfflineData(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Failed to get offline data:', error);
      return {};
    }
  }

  static addToSyncQueue(action: string, data: any) {
    try {
      const queue = this.getSyncQueue();
      queue.push({
        id: crypto.randomUUID(),
        action,
        data,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
    }
  }

  static getSyncQueue(): any[] {
    try {
      const queue = localStorage.getItem(this.SYNC_QUEUE_KEY);
      return queue ? JSON.parse(queue) : [];
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      return [];
    }
  }

  static clearSyncQueue() {
    try {
      localStorage.removeItem(this.SYNC_QUEUE_KEY);
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
    }
  }

  private static async syncOfflineData() {
    const queue = this.getSyncQueue();
    
    if (queue.length === 0) return;

    try {
      // This would sync with your backend when online
      console.log('Syncing offline data...', queue);
      
      // For now, we'll just clear the queue as data is in localStorage
      this.clearSyncQueue();
      
      // Dispatch sync complete event
      window.dispatchEvent(new CustomEvent('sync-complete', { 
        detail: { syncedItems: queue.length } 
      }));
    } catch (error) {
      console.error('Failed to sync offline data:', error);
    }
  }

  static getStorageInfo() {
    try {
      const totalSize = JSON.stringify(localStorage).length;
      const appData = localStorage.getItem('productivity-planner-tasks') || '';
      const offlineData = localStorage.getItem(this.STORAGE_KEY) || '';
      
      return {
        totalStorageSize: totalSize,
        appDataSize: appData.length,
        offlineDataSize: offlineData.length,
        availableSpace: 5 * 1024 * 1024 - totalSize // Roughly 5MB limit
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return null;
    }
  }
}

// Initialize offline support when module loads
if (typeof window !== 'undefined') {
  OfflineService.initializeOfflineSupport();
}