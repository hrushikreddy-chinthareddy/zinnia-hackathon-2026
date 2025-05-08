import { storage } from './sessionStorage.helpers';

describe('SessionStorageHelper', () => {
    beforeEach(() => {
        // Clear sessionStorage before each test
        sessionStorage.clear();
    });

    it('should set and get item in sessionStorage', () => {
        const key = 'token';
        const value = 'abc123';

        storage.setItem(key, value);

        const retrievedValue = storage.getItem<string>(key);

        expect(retrievedValue).toBe(value);
    });

    it('should remove item from sessionStorage', () => {
        const key = 'token';
        const value = 'abc123';

        storage.setItem(key, value);

        storage.removeItem(key);

        const retrievedValue = storage.getItem<string>(key);

        expect(retrievedValue).toBeNull();
    });

    it('should clear sessionStorage', () => {
        const key1 = 'username';
        const value1 = 'John Doe';
        const key2 = 'token';
        const value2 = 'abc123';

        storage.setItem(key1, value1);
        storage.setItem(key2, value2);

        storage.clear();

        const retrievedValue1 = storage.getItem<string>(key1);
        const retrievedValue2 = storage.getItem<string>(key2);

        expect(retrievedValue1).toBeNull();
        expect(retrievedValue2).toBeNull();
    });
});
