import { doc, getDoc, setDoc, deleteDoc, collection, getDocs, writeBatch, serverTimestamp, getDocFromServer } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Helper to handle Firestore errors as requested by firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const cloudSetDoc = async (collectionPath: string, docId: string, data: any) => {
  const path = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    await setDoc(docRef, { ...data, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const cloudGetDoc = async (collectionPath: string, docId: string) => {
  const path = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
};

export const cloudDeleteDoc = async (collectionPath: string, docId: string) => {
  const path = `${collectionPath}/${docId}`;
  try {
    const docRef = doc(db, collectionPath, docId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const cloudGetCollection = async (collectionPath: string, userId: string) => {
  try {
    // Note: in a real app you would enforce where("userId", "==", userId)
    // but for this minimal architectural example, we'll assume the path is like users/{userId}/workout_history
    const colRef = collection(db, collectionPath);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, collectionPath);
  }
};
