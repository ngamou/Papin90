import { useState, useEffect } from 'react';
import { db } from './db';
import { SyncQueueItem, WhatsAppNotificationQueueItem } from '../types';

export interface SyncStatus {
  isOnline: boolean;
  isSimulatedOffline: boolean;
  pendingSyncCount: number;
  lastSyncTimestamp: number | null;
  isSyncing: boolean;
  serverRegion: string;
}

// Global listener for sync status
const listeners = new Set<() => void>();

let simulatedOfflineState = false;
let isSyncingState = false;
let lastSyncTimestampState: number | null = Date.now() - 1000 * 60 * 3; // 3 mins ago

export const syncEngine = {
  getIsOnline(): boolean {
    if (simulatedOfflineState) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  },

  setSimulatedOffline(val: boolean) {
    simulatedOfflineState = val;
    listeners.forEach((cb) => cb());
    if (!val && this.getIsOnline()) {
      this.triggerDifferentialSync();
    }
  },

  getPendingCount(): number {
    return db.getSyncQueue().length;
  },

  getLastSyncTime(): number | null {
    return lastSyncTimestampState;
  },

  getIsSyncing(): boolean {
    return isSyncingState;
  },

  async triggerDifferentialSync(): Promise<{ syncedCount: number; conflictResolved: number }> {
    if (!this.getIsOnline() || isSyncingState) {
      return { syncedCount: 0, conflictResolved: 0 };
    }

    const queue = db.getSyncQueue();
    if (queue.length === 0) {
      lastSyncTimestampState = Date.now();
      listeners.forEach((cb) => cb());
      return { syncedCount: 0, conflictResolved: 0 };
    }

    isSyncingState = true;
    listeners.forEach((cb) => cb());

    // Differential sync simulation with server
    await new Promise((resolve) => setTimeout(resolve, 900));

    const syncedIds: string[] = [];
    let conflictResolved = 0;

    for (const item of queue) {
      // Simulate differential sync validation
      syncedIds.push(item.id);
      if (item.operation === 'UPDATE') {
        // Differential conflict check: server has verified version
        conflictResolved++;
      }
    }

    db.clearSyncedItems(syncedIds);
    lastSyncTimestampState = Date.now();
    isSyncingState = false;
    listeners.forEach((cb) => cb());

    // Flush any pending async WhatsApp notifications on server side
    this.flushAsyncNotificationQueue();

    return { syncedCount: syncedIds.length, conflictResolved };
  },

  flushAsyncNotificationQueue() {
    // Process server-side queue for WhatsApp / SMS dispatches
    const notifications: WhatsAppNotificationQueueItem[] = db.getStored('notificationQueue', []);
    const updated = notifications.map((n) => (n.status === 'pending' ? { ...n, status: 'sent' as const, sentAt: new Date().toISOString() } : n));
    db.setStored('notificationQueue', updated);
  },

  queueAsyncWhatsAppNotification(notification: Omit<WhatsAppNotificationQueueItem, 'id' | 'status'>) {
    const notifications: WhatsAppNotificationQueueItem[] = db.getStored('notificationQueue', []);
    const newItem: WhatsAppNotificationQueueItem = {
      ...notification,
      id: 'notif_' + Date.now(),
      status: this.getIsOnline() ? 'sent' : 'pending',
      sentAt: this.getIsOnline() ? new Date().toISOString() : undefined,
    };
    notifications.unshift(newItem);
    db.setStored('notificationQueue', notifications.slice(0, 50));
  },
};

export function useSyncEngine(): SyncStatus & {
  triggerSync: () => Promise<{ syncedCount: number; conflictResolved: number }>;
  toggleSimulatedOffline: (val?: boolean) => void;
} {
  const [, setTick] = useState(0);

  useEffect(() => {
    const update = () => setTick((t) => t + 1);
    listeners.add(update);

    const onOnline = () => {
      if (!simulatedOfflineState) {
        syncEngine.triggerDifferentialSync();
      }
      update();
    };

    const onOffline = () => update();

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      listeners.delete(update);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  return {
    isOnline: syncEngine.getIsOnline(),
    isSimulatedOffline: simulatedOfflineState,
    pendingSyncCount: syncEngine.getPendingCount(),
    lastSyncTimestamp: syncEngine.getLastSyncTime(),
    isSyncing: syncEngine.getIsSyncing(),
    serverRegion: 'CEMAC-Douala (CAMTEL / MTN Tier-III)',
    triggerSync: () => syncEngine.triggerDifferentialSync(),
    toggleSimulatedOffline: (val) => {
      syncEngine.setSimulatedOffline(val !== undefined ? val : !simulatedOfflineState);
    },
  };
}
