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

    // Validate docId format (accept both UUID and text IDs)
    // Documents use text IDs in current schema
    if (!docId || docId.length < 1) {
      navigate('/404');
      return;
    }

    // AppContent will handle the actual document loading and display
  }, [docId, action, navigate]);

  return <AppContent />;
};