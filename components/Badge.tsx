import React from 'react';
import { DocStatus } from '../types';

// Status Badge for documents
export const StatusBadge: React.FC<{ status: DocStatus }> = ({ status }) => {
  const styles = {
    DRAFT: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    PUBLISHED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };

  const labels = {
    DRAFT: "Rascunho",
    PENDING_REVIEW: "Em Revisão",
    PUBLISHED: "Publicado",
    REJECTED: "Rejeitado",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.DRAFT}`}>
      {labels[status]}
    </span>
  );
};

// Generic Badge component
export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  size = 'sm',
  className = '' 
}) => {
  const variantStyles = {
    primary: 'badge-primary',
    success: 'badge-success',
    warning: 'badge-warning',
    error: 'badge-error',
    info: 'badge-info',
    neutral: 'badge-neutral'
  };
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  };
  
  const badgeClasses = [
    'badge',
    variantStyles[variant],
    sizeStyles[size],
    className
  ].filter(Boolean).join(' ');
  
  return (
    <span className={badgeClasses}>
      {children}
    </span>
  );
};

export default Badge;