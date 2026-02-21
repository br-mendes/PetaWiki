import React from 'react';
import { useNavigate } from 'react-router-dom';

export const AdminRoute: React.FC = () => {
  const navigate = useNavigate();

  // This route is handled by AppContent through processUrl
  // Just trigger navigation to let AppContent handle it
  React.useEffect(() => {
    navigate('/admin');
  }, [navigate]);

  return null;
};
