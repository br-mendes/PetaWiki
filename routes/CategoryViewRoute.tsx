import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

export const CategoryViewRoute: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryId) {
      navigate('/');
      return;
    }

    // Validate categoryId format (categories use text IDs)
    if (!categoryId || categoryId.length < 1) {
      navigate('/404');
      return;
    }

    // AppContent will handle the actual category loading and display
  }, [categoryId, navigate]);

  return <AppContent />;
};