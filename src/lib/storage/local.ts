import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'AppStorageDB';
const DB_VERSION = 1;

interface StorageSchema {
  keyvalue: {
    key: string;
    value: any;
  };
  workout_history: {
    key: string;
    value: any;
  };
  calorie_tracking: {
    key: string;
    value: any;
  };
  meal_plans: {
    key: string;
    value: any;
  };
  sync_queue: {
    key: string;
    value: any;
  };
}

let dbPromise: Promise<IDBPDatabase<StorageSchema>> | null = null;

const getDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<StorageSchema>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('keyvalue')) {
          db.createObjectStore('keyvalue');
        }
        if (!db.objectStoreNames.contains('workout_history')) {
          db.createObjectStore('workout_history', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('calorie_tracking')) {
          db.createObjectStore('calorie_tracking', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('meal_plans')) {
          db.createObjectStore('meal_plans', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
      },
    });
  }
  return dbPromise;
};

// Generic Key-Value store operations (for settings, theme, profile, etc.)
export const localSet = async (key: string, value: any) => {
  const db = await getDB();
  return db.put('keyvalue', value, key);
};

export const localGet = async (key: string) => {
  const db = await getDB();
  return db.get('keyvalue', key);
};

export const localRemove = async (key: string) => {
  const db = await getDB();
  return db.delete('keyvalue', key);
};

export const localClearAll = async () => {
  const db = await getDB();
  const tx = db.transaction(db.objectStoreNames, 'readwrite');
  for (const storeName of Array.from(db.objectStoreNames)) {
    tx.objectStore(storeName).clear();
  }
  await tx.done;
};

// Collection operations (workout history, etc.)
export const collectionSet = async (store: 'workout_history' | 'calorie_tracking' | 'meal_plans', item: any) => {
  const db = await getDB();
  return db.put(store, item);
};

export const collectionGet = async (store: 'workout_history' | 'calorie_tracking' | 'meal_plans', id: string) => {
  const db = await getDB();
  return db.get(store, id);
};

export const collectionGetAll = async (store: 'workout_history' | 'calorie_tracking' | 'meal_plans') => {
  const db = await getDB();
  return db.getAll(store);
};

export const collectionRemove = async (store: 'workout_history' | 'calorie_tracking' | 'meal_plans', id: string) => {
  const db = await getDB();
  return db.delete(store, id);
};

// Sync Queue operations
export const queueAction = async (action: any) => {
  const db = await getDB();
  return db.add('sync_queue', { ...action, timestamp: Date.now() });
};

export const getQueue = async () => {
  const db = await getDB();
  return db.getAll('sync_queue');
};

export const removeQueueItem = async (id: number) => {
  const db = await getDB();
  return db.delete('sync_queue', id);
};
