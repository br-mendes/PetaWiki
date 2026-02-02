import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

interface DocumentViewRouteProps {
  action?: string;
}

export const DocumentViewRoute: React.FC<DocumentViewRouteProps> = () => {
  const { docId, action } = useParams<{ docId: string; action?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!docId) {
      navigate('/');
      return;
    }

    // Validate docId format (UUID or similar)
    if (!/^[a-f0-9-]{36}$/i.test(docId)) {
      navigate('/404');
      return;
    }

    // AppContent will handle the actual document loading and display
  }, [docId, action, navigate]);

  return <AppContent />;
};