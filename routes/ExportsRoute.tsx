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

    // Validate document ID format
    if (!/^[a-f0-9-]{36}$/i.test(docId)) {
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