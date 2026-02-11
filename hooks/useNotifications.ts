import { useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  created_at: string;
  user_id: string;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notificationsRef = useRef<NotificationItem[]>([]);

  const markAllAsRead = useCallback(async () => {
    if (notifications.length === 0) {
      return;
    }

    try {
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) throw new Error('Failed to mark notifications as read');
      
      // Atualiza estado local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Fallback: atualiza estado local mesmo sem sucesso da API
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      toast.error('Failed to mark notifications as read');
    }
  }, [notifications.length]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    notificationsRef.current = [];
  }, []);

  const addNotification = useCallback((notification: Omit<NotificationItem, 'id' | 'created_at'>) => {
    const newNotification: NotificationItem = {
      ...notification,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    notificationsRef.current = [newNotification, ...notificationsRef.current];
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    notificationsRef.current = notificationsRef.current.filter(n => n.id !== id);
  }, []);

  return {
    notifications,
    markAllAsRead,
    clearNotifications,
    addNotification,
    removeNotification,
  };
}