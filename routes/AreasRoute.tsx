import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

export const AreasRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // List all areas
    // AppContent will handle the actual areas listing
  }, [navigate]);

  return <AppContent />;
};

export const AreaViewRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/areas');
      return;
    }

    // Validate area ID format (areas use UUID)
    if (!/^[a-f0-9-]{36}$/i.test(id)) {
      navigate('/404');
      return;
    }

    // Show specific area with its categories
  }, [id, navigate]);

  return <AppContent />;
};