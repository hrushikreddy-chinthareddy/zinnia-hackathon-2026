// TODO: this is not used and can be removed
class SessionStorageHelper {
    private static instance: SessionStorageHelper;
    private storage: Storage | null = null;

    protected constructor() {
        if (typeof window !== 'undefined' && window.sessionStorage) {
            this.storage = sessionStorage;
        }
    }

    public static getInstance(): SessionStorageHelper {
        if (!SessionStorageHelper.instance) {
            SessionStorageHelper.instance = new SessionStorageHelper();
        }
        return SessionStorageHelper.instance;
    }

    public setItem(key: string, value: any): void {
        if (this.storage) {
            this.storage.setItem(key, JSON.stringify(value));
        }
    }

    public getItem<T>(key: string): T | null {
        if (this.storage) {
            const item = this.storage.getItem(key);
            return item ? JSON.parse(item) : null;
        }
        return null;
    }

    public removeItem(key: string): void {
        if (this.storage) {
            this.storage.removeItem(key);
        }
    }

    public clear(): void {
        if (this.storage) {
            this.storage.clear();
        }
    }
}

export const storage = SessionStorageHelper.getInstance();
