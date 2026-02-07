import { useCallback, useEffect, useMemo, useState } from 'react';
import { MOCK_NOTIFICATIONS } from '../constants/notifications';

const normalizeIds = (values) => {
  if (!Array.isArray(values)) return [];
  return Array.from(new Set(values.map((value) => String(value)).filter(Boolean)));
};

const readStoredIds = (key) => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return normalizeIds(parsed);
  } catch {
    return [];
  }
};

const writeStoredIds = (key, values) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(values));
  } catch {
    // Ignore storage errors (private mode, quota, etc.).
  }
};

const buildStorageKey = (user, suffix) => {
  const token = user?.id || user?.email || 'anon';
  return `domu.notifications.${suffix}.${token}`;
};

export const useNotifications = (user) => {
  const readKey = useMemo(() => buildStorageKey(user, 'read'), [user?.id, user?.email]);
  const hiddenKey = useMemo(() => buildStorageKey(user, 'hidden'), [user?.id, user?.email]);

  const [readIds, setReadIds] = useState(() => readStoredIds(readKey));
  const [hiddenIds, setHiddenIds] = useState(() => readStoredIds(hiddenKey));

  useEffect(() => {
    setReadIds(readStoredIds(readKey));
    setHiddenIds(readStoredIds(hiddenKey));
  }, [readKey, hiddenKey]);

  const readSet = useMemo(() => new Set(readIds), [readIds]);
  const hiddenSet = useMemo(() => new Set(hiddenIds), [hiddenIds]);

  const notifications = useMemo(() => (
    MOCK_NOTIFICATIONS.map((notification) => {
      const id = String(notification.id);
      const isRead = readSet.has(id);
      const isUnread = notification.isNew && !isRead;
      return {
        ...notification,
        isRead,
        isUnread,
      };
    })
  ), [readSet]);

  const notificationsPreview = useMemo(() => (
    notifications
      .filter((notification) => !hiddenSet.has(String(notification.id)))
      .slice(0, 4)
  ), [notifications, hiddenSet]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.isUnread).length,
    [notifications]
  );

  const markRead = useCallback((ids) => {
    const nextIds = normalizeIds(ids);
    if (nextIds.length === 0) return;
    setReadIds((prev) => {
      const next = normalizeIds([...prev, ...nextIds]);
      writeStoredIds(readKey, next);
      return next;
    });
  }, [readKey]);

  const hideNotifications = useCallback((ids) => {
    const nextIds = normalizeIds(ids);
    if (nextIds.length === 0) return;
    setHiddenIds((prev) => {
      const next = normalizeIds([...prev, ...nextIds]);
      writeStoredIds(hiddenKey, next);
      return next;
    });
  }, [hiddenKey]);

  const clearHidden = useCallback(() => {
    setHiddenIds([]);
    writeStoredIds(hiddenKey, []);
  }, [hiddenKey]);

  return {
    notifications,
    notificationsPreview,
    unreadCount,
    markRead,
    hideNotifications,
    clearHidden,
  };
};
