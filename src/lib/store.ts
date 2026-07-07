/** IndexedDB persistence — exhibits carry base64 images, so localStorage's
 *  ~5MB quota is not enough. One object store keyed by exhibit id. */

import type { Exhibit } from "./types";

const DB_NAME = "exhibit-creator";
const STORE = "exhibits";
const VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function db(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, VERSION);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE, { keyPath: "id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

function withStore<T>(
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return db().then(
    (d) =>
      new Promise<T>((resolve, reject) => {
        const req = fn(d.transaction(STORE, mode).objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export const loadExhibits = (): Promise<Exhibit[]> =>
  withStore("readonly", (s) => s.getAll() as IDBRequest<Exhibit[]>);

export const saveExhibit = (e: Exhibit): Promise<void> =>
  withStore("readwrite", (s) => s.put(e)).then(() => undefined);

export const deleteExhibit = (id: string): Promise<void> =>
  withStore("readwrite", (s) => s.delete(id)).then(() => undefined);
