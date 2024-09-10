import { storage } from '@deps/helpers/sessionStorage.helper';

import { generateCacheKey, pullFromCache, writeToCache } from './cache';

describe('Cache Functions', () => {
    const queryName = 'testQuery';
    const query = { param1: 'value1', param2: 'value2' };
    const stringifiedQuery = JSON.stringify(query);
    const data = { result: 'testData' };
    const expirationMinutes = 5;
    const cacheKey = generateCacheKey(queryName, stringifiedQuery);

    beforeEach(() => {
        storage.clear();
    });

    describe('generateCacheKey', () => {
        it('should generate the cache key based on query name and stringified query', () => {
            expect(cacheKey).toEqual(`${queryName}${stringifiedQuery}`);
        });
    });

    describe('writeToCache', () => {
        it('should write data to cache with the correct key', () => {
            writeToCache(queryName, query, data, expirationMinutes);

            const cacheData = storage.getItem(cacheKey) as any;
            expect(cacheData.data).toEqual(data);
            expect(cacheData.timestamp).toBeGreaterThanOrEqual(Date.now());
            expect(cacheData.timestamp).toBeLessThanOrEqual(Date.now() + expirationMinutes * 60 * 1000);
        });
    });

    describe('pullFromCache', () => {
        it('should return null when the cache is empty', () => {
            const result = pullFromCache(queryName, query, expirationMinutes);
            expect(result).toBeNull();
        });

        it('should return data when it exists in cache and not expired', () => {
            writeToCache(queryName, query, data, expirationMinutes);

            const result = pullFromCache(queryName, query, expirationMinutes);
            expect(result).toEqual(data);
        });

        it('should return null and remove from cache when data is expired', () => {
            const expiredTimestamp = Date.now() - (expirationMinutes + 1) * 60 * 1000;
            storage.setItem(cacheKey, {
                data,
                timestamp: expiredTimestamp,
            });

            const result = pullFromCache(queryName, query, expirationMinutes);
            expect(result).toBeNull();
            expect(storage.getItem(cacheKey)).toBeNull();
        });
    });
});
