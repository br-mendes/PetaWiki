import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

export const DocumentCommentsRoute: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!docId) {
      navigate('/');
      return;
    }

    // Validate document ID format (documents use text IDs)
    if (!docId || docId.length < 1) {
      navigate('/404');
      return;
    }

    // Show document with comments panel open
  }, [docId, navigate]);

  return <AppContent />;
};