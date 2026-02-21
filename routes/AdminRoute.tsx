import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AdminSettings } from '../components/AdminSettings';

export const AdminRoute: React.FC = () => {
  const { currentUser, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="p-10">Carregando...</div>;
  }

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin =
    String(currentUser.role || "").toUpperCase() === "ADMIN" ||
    currentUser.isSuperAdmin === true;

  if (!isAdmin) {
    return (
      <div className="p-10 text-red-600">
        Acesso restrito ao painel administrativo.
      </div>
    );
  }

  return <AdminSettings />;
};
