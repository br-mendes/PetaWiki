import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContent } from '../App';

export const NewDocumentRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    // AppContent will handle authentication and redirect if needed
    
    // Set the view state for document creation
    // This will be handled by AppContent
  }, [navigate]);

  return <AppContent />;
};