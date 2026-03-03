import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

const WS_RECONNECT_DELAY = 5000;

export const useNotifications = (user) => {
  const queryClient = useQueryClient();
  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const selectedBuildingId = typeof window !== 'undefined' ? localStorage.getItem('selectedBuildingId') : null;

  const {
    data: notifications = [],
    isLoading: loading,
  } = useQuery({
    queryKey: ['notifications', user?.id, selectedBuildingId],
    queryFn: async () => {
      const data = await api.notifications.list(0, 20);
      return Array.isArray(data) ? data : [];
    },
    enabled: !!user,
  });

  const { data: unreadCountData } = useQuery({
    queryKey: ['notifications-unread-count', user?.id, selectedBuildingId],
    queryFn: async () => {
      const data = await api.notifications.getUnreadCount();
      return data?.count ?? 0;
    },
    enabled: !!user,
  });

  const unreadCount = unreadCountData ?? 0;

  const refetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
  }, [queryClient]);

  // Connect WebSocket
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token || !user) return;

    const connectWs = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = import.meta.env.DEV ? 'localhost:8080' : window.location.host;
      const socket = new WebSocket(`${protocol}//${host}/ws/notifications?token=${token}`);

      socket.onopen = () => {
        console.log('[Notifications WS] Connected');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NOTIFICATION' && data.notification) {
            queryClient.setQueryData(
              ['notifications', user?.id, selectedBuildingId],
              (prev) => [data.notification, ...(prev || [])].slice(0, 50)
            );
            queryClient.setQueryData(
              ['notifications-unread-count', user?.id, selectedBuildingId],
              (prev) => (prev ?? 0) + 1
            );
          } else if (data.type === 'UNREAD_COUNT') {
            queryClient.setQueryData(
              ['notifications-unread-count', user?.id, selectedBuildingId],
              data.count ?? 0
            );
          }
        } catch (e) {
          console.error('[Notifications WS] Parse error:', e);
        }
      };

      socket.onclose = () => {
        console.log('[Notifications WS] Disconnected');
        if (ws.current === socket) {
          ws.current = null;
          reconnectTimer.current = setTimeout(connectWs, WS_RECONNECT_DELAY);
        }
      };

      socket.onerror = () => {
        socket.close();
      };

      ws.current = socket;
    };

    connectWs();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [user?.id, queryClient, selectedBuildingId]);

  const notificationsPreview = useMemo(
    () => notifications.slice(0, 4),
    [notifications]
  );

  const markReadMutation = useMutation({
    mutationFn: (id) => api.notifications.markRead(id),
    onSuccess: (_, id) => {
      queryClient.setQueryData(
        ['notifications', user?.id, selectedBuildingId],
        (prev) => (prev || []).map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      queryClient.setQueryData(
        ['notifications-unread-count', user?.id, selectedBuildingId],
        (prev) => Math.max(0, (prev ?? 0) - 1)
      );
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.notifications.markAllRead(),
    onSuccess: () => {
      queryClient.setQueryData(
        ['notifications', user?.id, selectedBuildingId],
        (prev) => (prev || []).map((n) => ({ ...n, isRead: true }))
      );
      queryClient.setQueryData(
        ['notifications-unread-count', user?.id, selectedBuildingId],
        0
      );
    },
  });

  const markRead = useCallback((id) => markReadMutation.mutate(id), [markReadMutation]);
  const markAllRead = useCallback(() => markAllReadMutation.mutate(), [markAllReadMutation]);

  return {
    notifications,
    notificationsPreview,
    unreadCount,
    loading,
    markRead,
    markAllRead,
    refetch,
  };
};
