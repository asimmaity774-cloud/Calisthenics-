import { 
  localSet, 
  localGet, 
  localRemove, 
  localClearAll,
  collectionSet,
  collectionGet,
  collectionGetAll,
  collectionRemove,
  queueAction,
  getQueue,
  removeQueueItem
} from './local';
import { 
  cloudSetDoc, 
  cloudGetDoc, 
  cloudDeleteDoc, 
  cloudGetCollection 
} from './cloud';
import { auth } from '../firebase';

export { getQueue } from './local';

export type DataType = 'workout_history' | 'calorie_tracking' | 'meal_plans' | 'keyvalue';

interface SyncAction {
  id?: number;
  type: DataType;
  operation: 'SET' | 'DELETE';
  key: string; // docId or local key
  data?: any;
}

class StorageManager {
  private syncInProgress = false;
  
  // Generic key-value wrapper
  async saveData(key: string, data: any, sync: boolean = true) {
    // 1. Save locally instantly
    await localSet(key, data);
    
    // 2. Queue for cloud sync
    if (sync && auth.currentUser) {
      await this.queueSyncAction({
        type: 'keyvalue',
        operation: 'SET',
        key,
        data
      });
      this.triggerSync();
    }
  }

  async getData(key: string) {
    return localGet(key);
  }

  async removeData(key: string, sync: boolean = true) {
    await localRemove(key);
    
    if (sync && auth.currentUser) {
      await this.queueSyncAction({
        type: 'keyvalue',
        operation: 'DELETE',
        key
      });
      this.triggerSync();
    }
  }

  // Collection wrappers
  async saveCollectionItem(collection: DataType, id: string, data: any, sync: boolean = true) {
    if (collection === 'keyvalue') return this.saveData(id, data, sync);
    
    const payload = { id, ...data };
    await collectionSet(collection, payload);
    
    if (sync && auth.currentUser) {
      await this.queueSyncAction({
        type: collection,
        operation: 'SET',
        key: id,
        data: payload
      });
      this.triggerSync();
    }
  }

  async getCollectionItem(collection: DataType, id: string) {
    if (collection === 'keyvalue') return this.getData(id);
    return collectionGet(collection, id);
  }
  
  async getFullCollection(collection: DataType) {
    if (collection === 'keyvalue') return [];
    return collectionGetAll(collection);
  }

  async removeCollectionItem(collection: DataType, id: string, sync: boolean = true) {
    if (collection === 'keyvalue') return this.removeData(id, sync);
    
    await collectionRemove(collection, id);
    
    if (sync && auth.currentUser) {
      await this.queueSyncAction({
        type: collection,
        operation: 'DELETE',
        key: id
      });
      this.triggerSync();
    }
  }

  async clearAllData() {
    await localClearAll();
  }

  private async queueSyncAction(action: SyncAction) {
    await queueAction(action);
  }

  // Primary Synchronization Engine
  async triggerSync() {
    if (this.syncInProgress || !auth.currentUser || !navigator.onLine) return;
    
    this.syncInProgress = true;
    
    try {
      const queue = await getQueue();
      if (queue.length === 0) {
        this.syncInProgress = false;
        return;
      }
      
      const uid = auth.currentUser.uid;

      for (const item of queue) {
        const { id, type, operation, key, data } = item;
        const cloudPath = type === 'keyvalue' ? `users/${uid}/settings` : `users/${uid}/${type}`;
        
        try {
          if (operation === 'SET') {
            await cloudSetDoc(cloudPath, key, data);
          } else if (operation === 'DELETE') {
            await cloudDeleteDoc(cloudPath, key);
          }
          // Remove from local queue if cloud operation succeeds
          if (id) await removeQueueItem(id);
        } catch (error) {
          console.error(`Failed to sync item ${id}:`, error);
          // If error is deterministic (like permission denied), we might want to remove it
          // For now, if offline or retriable, leave in queue
        }
      }
    } finally {
      this.syncInProgress = false;
    }
  }

  // Restore everything from cloud to local
  async restoreBackup() {
    if (!auth.currentUser) throw new Error("Must be logged in to restore backup");
    
    const uid = auth.currentUser.uid;
    const collectionsToRestore: ('workout_history' | 'calorie_tracking' | 'meal_plans')[] = ['workout_history', 'calorie_tracking', 'meal_plans'];
    
    for (const col of collectionsToRestore) {
      const docs = await cloudGetCollection(`users/${uid}/${col}`, uid);
      if (docs) {
        for (const doc of docs) {
          await collectionSet(col, doc);
        }
      }
    }
    
    // For key-value, you'd iterate over users/{uid}/settings collection and save to localSet
    const settings = await cloudGetCollection(`users/${uid}/settings`, uid);
    if (settings) {
      for (const setting of settings) {
         await localSet(setting.id, setting);
      }
    }
  }
}

export const Storage = new StorageManager();

// Automatically listen for online status to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    Storage.triggerSync();
  });
}
