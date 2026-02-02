import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

export const DepartmentsRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // List all departments
    // AppContent will handle the actual department listing
  }, [navigate]);

  return <AppContent />;
};

export const DepartmentViewRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/departamentos');
      return;
    }

    // Validate department ID format (departments use UUID)
    if (!/^[a-f0-9-]{36}$/i.test(id)) {
      navigate('/404');
      return;
    }

    // Show specific department with its areas and categories
  }, [id, navigate]);

  return <AppContent />;
};