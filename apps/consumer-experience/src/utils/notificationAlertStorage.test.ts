import {
  getNotificationAlertDismissedIds,
  setNotificationAlertDismissedIds,
} from './notificationAlertStorage';

describe('notificationAlertStorage', () => {
  const key = 'notificationAlertDismissed:plan:policy';
  const createMockSessionStorage = () => {
    let store: Record<string, string> = {};

    return {
      get length() {
        return Object.keys(store).length;
      },
      key: jest.fn((index: number) => Object.keys(store)[index] ?? null),
      getItem: jest.fn((k: string) => store[k] ?? null),
      setItem: jest.fn((k: string, v: string) => {
        store[k] = v;
      }),
      removeItem: jest.fn((k: string) => {
        delete store[k];
      }),
      clear: () => {
        store = {};
      },
    };
  };

  type GlobalWithWindowSessionStorage = {
    window: {
      sessionStorage: ReturnType<typeof createMockSessionStorage>;
    };
  };

  beforeEach(() => {
    // Ensure a clean global window before each test
    delete global.window;
  });

  describe('getNotificationAlertDismissedIds', () => {
    it('returns an empty array when window is undefined (SSR)', () => {
      // window is intentionally undefined
      const result = getNotificationAlertDismissedIds(key);
      expect(result).toEqual([]);
    });

    it('returns an empty array when there is no stored value', () => {
      (global as unknown as GlobalWithWindowSessionStorage).window = {
        sessionStorage: createMockSessionStorage(),
      };

      const result = getNotificationAlertDismissedIds(key);
      expect(result).toEqual([]);
    });

    it('returns parsed IDs when valid JSON array is stored', () => {
      const mockSessionStorage = createMockSessionStorage();
      mockSessionStorage.setItem(key, JSON.stringify(['id-1', 'id-2']));

      (global as unknown as GlobalWithWindowSessionStorage).window = {
        sessionStorage: mockSessionStorage,
      };

      const result = getNotificationAlertDismissedIds(key);
      expect(result).toEqual(['id-1', 'id-2']);
    });

    it('returns an empty array when stored value is not valid JSON', () => {
      const mockSessionStorage = createMockSessionStorage();
      mockSessionStorage.setItem(key, 'not-json');

      (global as unknown as GlobalWithWindowSessionStorage).window = {
        sessionStorage: mockSessionStorage,
      };

      const result = getNotificationAlertDismissedIds(key);
      expect(result).toEqual([]);
    });

    it('returns an empty array when stored value is not an array', () => {
      const mockSessionStorage = createMockSessionStorage();
      mockSessionStorage.setItem(key, JSON.stringify({ id: 'id-1' }));

      (global as unknown as GlobalWithWindowSessionStorage).window = {
        sessionStorage: mockSessionStorage,
      };

      const result = getNotificationAlertDismissedIds(key);
      expect(result).toEqual([]);
    });
  });

  describe('setNotificationAlertDismissedIds', () => {
    it('does nothing when window is undefined (SSR)', () => {
      // window is intentionally undefined
      expect(() =>
        setNotificationAlertDismissedIds(key, ['id-1'])
      ).not.toThrow();
    });

    it('stores IDs as JSON when array is non-empty', () => {
      const mockSessionStorage = createMockSessionStorage();

      (global as unknown as GlobalWithWindowSessionStorage).window = {
        sessionStorage: mockSessionStorage,
      };

      setNotificationAlertDismissedIds(key, ['id-1', 'id-2']);

      expect(mockSessionStorage.setItem).toHaveBeenCalledWith(
        key,
        JSON.stringify(['id-1', 'id-2'])
      );
      expect(mockSessionStorage.removeItem).not.toHaveBeenCalled();
    });

    it('removes stored value when array is empty', () => {
      const mockSessionStorage = createMockSessionStorage();

      (global as unknown as GlobalWithWindowSessionStorage).window = {
        sessionStorage: mockSessionStorage,
      };

      setNotificationAlertDismissedIds(key, []);

      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith(key);
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
    });
  });
});
