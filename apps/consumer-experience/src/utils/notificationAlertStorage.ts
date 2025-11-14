export const getNotificationAlertDismissedIds = (key: string): string[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.sessionStorage.getItem(key);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as string[]) : [];
  } catch {
    return [];
  }
};

export const setNotificationAlertDismissedIds = (
  key: string,
  ids: string[]
): void => {
  if (typeof window === 'undefined') return;

  try {
    if (ids.length > 0) {
      window.sessionStorage.setItem(key, JSON.stringify(ids));
    } else {
      window.sessionStorage.removeItem(key);
    }
  } catch {
    // ignore storage errors
  }
};
