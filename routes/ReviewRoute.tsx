import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

export const ReviewRoute: React.FC = () => {
  const { docId } = useParams<{ docId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    // Validate docId if provided
    if (docId && !/^[a-f0-9-]{36}$/i.test(docId)) {
      navigate('/404');
      return;
    }

    // Check if user has review privileges
    // AppContent will handle authorization and display
  }, [docId, navigate]);

  return <AppContent />;
};