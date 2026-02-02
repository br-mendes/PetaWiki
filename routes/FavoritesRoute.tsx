import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../App';

export const FavoritesRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    // AppContent will handle authentication and redirect if needed
    
    // Display user's favorite documents
  }, [navigate]);

  return <AppContent />;
};