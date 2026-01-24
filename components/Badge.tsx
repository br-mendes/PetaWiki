import React from 'react';
import { DocStatus } from '../types';

export const StatusBadge: React.FC<{ status: DocStatus }> = ({ status }) => {
  const styles = {
    DRAFT: "bg-gray-100 text-gray-800",
    PENDING_REVIEW: "bg-yellow-100 text-yellow-800",
    PUBLISHED: "bg-green-100 text-green-800",
  };

  const labels = {
    DRAFT: "Rascunho",
    PENDING_REVIEW: "Em Revisão",
    PUBLISHED: "Publicado"
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};