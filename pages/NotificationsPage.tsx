import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { Bell, Check, FileText, Home, ArrowLeft } from 'lucide-react';
import { useToast } from '../components/Toast';
import { supabase } from '../lib/supabase';

type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  type: string;
  document_id: string | null;
  is_read: boolean;
  created_at: string;
};

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // TODO: Get current user ID and load their notifications
      // For now, show empty state
      setNotifications([]);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Falha ao carregar notificações');
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));

      const { error } = await supabase.rpc("mark_notification_read", {
        p_notification_id: id,
      });

      if (error) {
        console.error(error);
        toast.error("Falha ao marcar como lida.");
        // Revert on error
        setNotifications(prev => prev.map(n => 
          n.id === id ? { ...n, is_read: false } : n
        ));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error("Falha ao marcar como lida.");
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (unread.length === 0) return;

    try {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

      const { error } = await supabase.rpc("mark_all_notifications_read", {
        p_user_id: "current-user-id" // TODO: Get actual user ID
      });

      if (error) {
        console.error(error);
        toast.error("Falha ao marcar todas como lidas.");
        // Revert on error
        setNotifications(prev => prev.map(n => ({ ...n, is_read: false })));
      } else {
        toast.success("Todas as notificações marcadas como lidas.");
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error("Falha ao marcar todas como lidas.");
    }
  };

  const formatDate = (iso: string) => {
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso));
    } catch {
      return "";
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "REVIEW": return "bg-purple-500";
      case "DOCUMENT": return "bg-blue-500";
      case "SYSTEM": return "bg-gray-500";
      default: return "bg-green-500";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Carregando notificações...</div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Home className="w-4 h-4" />
              <span>Início</span>
              <span>/</span>
              <span>Notificações</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                <Bell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  Notificações
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {unreadCount} não lida{unreadCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline">
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Nenhuma notificação
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Você não tem notificações no momento.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 transition-all ${
                    notification.is_read 
                      ? 'bg-white dark:bg-gray-800' 
                      : 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full ${typeColor(notification.type)} mt-2 shrink-0`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">
                            {notification.title}
                          </h3>
                          {notification.body && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {notification.body}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(notification.created_at)}
                          </span>
                          
                          {!notification.is_read && (
                            <Button
                              onClick={() => markAsRead(notification.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};