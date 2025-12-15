
// Basit bir IndexedDB sarmalayıcısı
const DB_NAME = 'ParticleMusicDB';
const STORE_IMAGES = 'SongImages';
const STORE_LYRICS = 'SongLyrics'; // Yeni depo
const DB_VERSION = 2; // Versiyon yükseltildi

export const openDB = (): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            
            // Görsel Deposu
            if (!db.objectStoreNames.contains(STORE_IMAGES)) {
                db.createObjectStore(STORE_IMAGES); 
            }

            // Sözler Deposu (Yeni)
            if (!db.objectStoreNames.contains(STORE_LYRICS)) {
                db.createObjectStore(STORE_LYRICS);
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
        const tx = db.transaction(STORE_IMAGES, 'readwrite');
        const store = tx.objectStore(STORE_IMAGES);
        store.put(images, songTitle);
        
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
        const tx = db.transaction(STORE_IMAGES, 'readonly');
        const store = tx.objectStore(STORE_IMAGES);
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

// --- YENİ: SÖZ KAYDETME/ÇEKME FONKSİYONLARI ---

export const saveSongLyrics = async (songTitle: string, lyricsData: any[]) => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_LYRICS, 'readwrite');
        const store = tx.objectStore(STORE_LYRICS);
        store.put(lyricsData, songTitle);
        
        return new Promise((resolve, reject) => {
            tx.oncomplete = () => resolve(undefined);
            tx.onerror = () => reject(tx.error);
        });
    } catch (e) {
        console.error("Sözler kaydedilemedi:", e);
    }
};

export const getSongLyrics = async (songTitle: string): Promise<any[] | undefined> => {
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_LYRICS, 'readonly');
        const store = tx.objectStore(STORE_LYRICS);
        const request = store.get(songTitle);

        return new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(undefined);
        });
    } catch (e) {
        console.error("Sözler çekilemedi:", e);
        return undefined;
    }
};
