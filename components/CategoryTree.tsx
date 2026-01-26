import React from 'react';
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { Category } from '../types';

interface CategoryTreeProps {
  categories: Category[];
  selectedId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  onCategoryEdit?: (category: Category) => void;
  onCategoryDelete?: (categoryId: string) => void;
  showControls?: boolean;
}

const TreeNode: React.FC<{
  category: Category;
  level: number;
  selectedId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  onCategoryEdit?: (category: Category) => void;
  onCategoryDelete?: (categoryId: string) => void;
  showControls?: boolean;
}> = ({ category, level, selectedId, onCategorySelect, onCategoryEdit, onCategoryDelete, showControls }) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = category.id === selectedId;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleSelect = () => {
    onCategorySelect?.(category.id);
  };

  return (
    <div>
      <div 
        className={`flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors group ${
          isSelected 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={handleSelect}
      >
        <div 
          className="mr-2 w-4 h-4 flex items-center justify-center text-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" />
          )}
        </div>
        
        <div className="mr-2 flex items-center">
          {isExpanded && hasChildren ? (
            <FolderOpen size={16} className="text-blue-500" />
          ) : (
            <Folder size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </div>
        
        <span className="flex-1 text-sm truncate">{category.name}</span>
        
        {category.doc_count !== null && category.doc_count !== undefined && (
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            ({category.doc_count})
          </span>
        )}
        
        {showControls && (
          <div className="ml-2 opacity-0 group-hover:opacity-100 flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCategoryEdit?.(category);
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Editar categoria"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCategoryDelete?.(category.id);
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500"
              title="Excluir categoria"
            >
              🗑️
            </button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && category.children && (
        <div>
          {category.children.map(child => (
            <TreeNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onCategorySelect={onCategorySelect}
              onCategoryEdit={onCategoryEdit}
              onCategoryDelete={onCategoryDelete}
              showControls={showControls}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTree: React.FC<CategoryTreeProps> = ({
  categories,
  selectedId = null,
  onCategorySelect,
  onCategoryEdit,
  onCategoryDelete,
  showControls = false
}) => {
return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {/* Botão "Todas" */}
      <div 
        className={`flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors ${
          selectedId === null 
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
        onClick={() => onCategorySelect?.(null)}
      >
        <div className="mr-2 w-4 h-4 flex items-center justify-center text-gray-400">
          📄
        </div>
        <span className="flex-1 text-sm font-medium">Todas</span>
      </div>
      {categories.map(category => (
        <TreeNode
          key={category.id}
          category={category}
          level={0}
          selectedId={selectedId}
          onCategorySelect={onCategorySelect}
          onCategoryEdit={onCategoryEdit}
          onCategoryDelete={onCategoryDelete}
          showControls={showControls}
        />
      ))}
    </div>
  );
};