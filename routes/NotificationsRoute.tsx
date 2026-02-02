import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../App';

export const NotificationsRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    // AppContent will handle authentication and redirect if needed
    
    // Display user's notifications
    // Mark notifications as read functionality
  }, [navigate]);

  return <AppContent />;
};