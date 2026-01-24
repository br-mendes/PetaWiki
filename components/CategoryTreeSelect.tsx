import React from 'react';
import { ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { Category } from '../types';

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
        className={`flex items-center py-1.5 px-2 cursor-pointer rounded-md transition-colors ${isSelected ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100 text-gray-700'}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(category.id, currentPath)}
      >
        <div 
          className="mr-1 w-5 h-5 flex items-center justify-center text-gray-400 hover:text-gray-600"
          onClick={(e) => {
            if (hasChildren) {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }
          }}
        >
          {hasChildren && (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />)}
        </div>
        
        <span className="mr-2 text-lg leading-none">{category.icon || '📁'}</span>
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
    <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto p-2 bg-white shadow-sm">
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
