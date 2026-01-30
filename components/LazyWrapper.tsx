import React, { Suspense } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback 
}) => {
  return (
    <Suspense 
      fallback={fallback || <LoadingSpinner text="Carregando..." />}
    >
      {children}
    </Suspense>
  );
};