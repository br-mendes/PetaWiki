import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContent } from '../App';

export const ProfileRoute: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    // Show current user's profile
  }, [navigate]);

  return <AppContent />;
};

export const UserProfileRoute: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) {
      navigate('/perfil');
      return;
    }

    // Validate user ID format
    if (!/^[a-f0-9-]{36}$/i.test(id)) {
      navigate('/404');
      return;
    }

    // Show specific user's public profile (if permissions allow)
  }, [id, navigate]);

  return <AppContent />;
};