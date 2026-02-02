import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';
import { useToast } from '../components/Toast';

export const NotificationsRoute: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load notifications when component mounts
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // This would integrate with actual notification loading logic
      // For now, AppContent handles the notification display
      setLoading(false);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Falha ao carregar notificações');
      setLoading(false);
    }
  };

  // Just return AppContent which already handles notification display
  // The route change alone is enough to show notifications in full page
  return <AppContent />;
};