import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../App';

export const AdminRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has admin privileges
    // AppContent will handle authorization
  }, [navigate]);

  return <AppContent />;
};