import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

export const DocumentExportRoute: React.FC = () => {
  const { docId } = useParams<{ docId: string }>();
  const { format } = useParams<{ format: string }>();
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

    // Validate export format
    const validFormats = ['pdf', 'docx', 'html', 'markdown'];
    if (format && !validFormats.includes(format)) {
      navigate(`/documento/${docId}/exportar`);
      return;
    }

    // Initiate document export process
  }, [docId, format, navigate]);

  return <AppContent />;
};

export const ExportsRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    // Show user's export history
  }, [navigate]);

  return <AppContent />;
};