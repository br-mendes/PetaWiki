
import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { Category } from '../types';
import { IconRenderer } from './IconRenderer';

interface TreeSelectProps {
  categories: Category[]; // Tree structure
  selectedId: string;
  onSelect: (id: string, path: string) => void;
  currentPath?: string;
}

const TreeNode: React.FC<{
  category: Category;
  selectedId: string;
  onSelect: (id: string, path: string) => void;
  depth: number;
  pathPrefix: string;
}> = ({ category, selectedId, onSelect, depth, pathPrefix }) => {
  const [isExpanded, setIsExpanded] = React.useState(depth < 1);
  const hasChildren = category.children && category.children.length > 0;
  const currentPath = pathPrefix ? `${pathPrefix} > ${category.name}` : category.name;
  const isSelected = category.id === selectedId;

  return (
    <div>
      <div 
        className={`flex items-center py-1.5 px-2 cursor-pointer rounded-md transition-colors ${isSelected ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(category.id, currentPath)}
      >
        <div 
          className="mr-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {hasChildren && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </div>
        
        <div className="mr-2 flex items-center justify-center w-5 text-gray-500 dark:text-gray-400">
            <IconRenderer iconName={category.icon || 'folder'} size={16} />
        </div>
        
        <span className={`text-sm truncate ${isSelected ? 'font-medium' : ''}`}>{category.name}</span>
      </div>

      {isExpanded && hasChildren && (
        <div>
          {category.children!.map(child => (
            <TreeNode
              key={child.id}
              category={child}
              selectedId={selectedId}
              onSelect={onSelect}
              depth={depth + 1}
              pathPrefix={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const CategoryTreeSelect: React.FC<TreeSelectProps> = ({ categories, selectedId, onSelect }) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto p-2 bg-white dark:bg-gray-800 shadow-sm">
      {categories.map(cat => (
        <TreeNode
          key={cat.id}
          category={cat}
          selectedId={selectedId}
          onSelect={onSelect}
          depth={0}
          pathPrefix=""
        />
      ))}
    </div>
  );
};
