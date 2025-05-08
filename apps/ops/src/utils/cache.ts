import { storage } from '@deps/helpers/sessionStorage.helpers';

interface CacheData {
    data: any;
    timestamp: number;
}

export const generateCacheKey = (query_name: string, stringified_query: string): string => query_name + stringified_query;

export const pullFromCache = (query_name: string, query: any, expiration_minutes = 2): any | null => {
    try {
        const cacheKey = generateCacheKey(query_name, JSON.stringify(query));
        const cachedResponse = storage.getItem(cacheKey) as any;

        // If exists in cache
        if (cachedResponse) {
            const { data, timestamp }: CacheData = cachedResponse;

            // If expired, remove from cache and return null
            if (Date.now() - timestamp > expiration_minutes * 60 * 1000) {
                storage.removeItem(cacheKey);
                return null;
            }

            // In cache and not expired, return data
            return data;
        }

        // Not in cache, return null
        return null;
    } catch (error: any) {
        console.error('An error occurred while pulling from cache', query_name, query, expiration_minutes, error);
        return null;
    }
};

export const writeToCache = (query_name: string, query: any, data: any, expiration_minutes = 2): void => {
    try {
        const cacheKey = generateCacheKey(query_name, JSON.stringify(query));
        storage.setItem(cacheKey, {
            data,
            timestamp: Date.now() + expiration_minutes * 60 * 1000,
        });
    } catch (err) {
        console.error('An error occurred while writing to cache', query_name, query, data, expiration_minutes, err);
    }
};

export const removeFromCache = (query_name: string, query: any): void => {
    try {
        const cacheKey = generateCacheKey(query_name, JSON.stringify(query));
        storage.removeItem(cacheKey);
    } catch (err) {
        console.error('An error occurred while removing from cache', query_name, query, err);
    }
};