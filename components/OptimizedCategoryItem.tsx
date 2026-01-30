import { memo } from 'react';
import { Category, User, Document, SystemSettings } from '../types';
import { canUserModifyCategory } from '../lib/hierarchy';

// Componente de Categoria Otimizado
interface CategoryItemProps {
  category: Category; 
  categoryDocuments: Document[];
  allDocuments: Document[];
  onSelectCategory: (c: Category) => void; 
  onSelectDocument: (d: Document) => void;
  onCreate: (parentId: string) => void;
  onDelete: (id: string) => void;
  user: User;
  depth?: number;
}

export const OptimizedCategoryItem = memo<CategoryItemProps>(({ 
  category, 
  categoryDocuments,
  allDocuments,
  onSelectCategory, 
  onSelectDocument,
  onCreate, 
  onDelete, 
  user, 
  depth = 0 
}) => {
  const hasChildren = category.children && category.children.length > 0;
  const hasDocuments = categoryDocuments.length > 0;
  const isEmpty = !hasChildren && !hasDocuments;
  const canModify = canUserModifyCategory(user, category);
  const canDelete = user.role === 'ADMIN'; 

  const docCount = categoryDocuments.length;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 mb-2 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{category.name}</h3>
          {docCount > 0 && (
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({docCount} docs)</span>
          )}
        </div>
        
        {canModify && (
          <div className="flex gap-2">
            <button 
              onClick={() => onCreate(category.id)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Adicionar
            </button>
            {canDelete && (
              <button 
                onClick={() => onDelete(category.id)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            )}
          </div>
        )}
      </div>
      
      {hasDocuments && (
        <div className="mt-2 space-y-1">
          {categoryDocuments.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="p-2 bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <span className="text-sm text-gray-800 dark:text-gray-200">{doc.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

OptimizedCategoryItem.displayName = 'OptimizedCategoryItem';