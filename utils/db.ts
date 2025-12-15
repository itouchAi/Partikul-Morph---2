
// Basit bir IndexedDB sarmalayıcısı
const DB_NAME = 'ParticleMusicDB';
const STORE_NAME = 'SongImages';
const DB_VERSION = 1;

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME); // KeyPath kullanmıyoruz, key olarak şarkı adı vereceğiz
            }
        };

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result);
        };

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error);
        };
    });
};

export const saveSongImages = async (songTitle: string, images: string[]) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(images, songTitle);
        
        // Promise<void> yerine düz Promise kullanıyoruz, bazı parser'lar <void>'i JSX sanabilir.
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve(undefined);
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("Görsel kaydedilemedi:", e);
    }
};

export const getSongImages = async (songTitle: string): Promise<string[] | undefined> => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(songTitle);

        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(undefined);
        });
    } catch (e) {
        console.error("Görsel çekilemedi:", e);
        return undefined;
    }
};
