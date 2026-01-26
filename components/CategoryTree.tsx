import React from 'react';
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryTreeProps {
  categories: Category[]; // árvore (já com children)
  selectedId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;

  // CRUD simples (Sidebar já implementa prompt + supabase)
  onCreate?: (parentId: string | null) => void;
  onRename?: (categoryId: string) => void;
  onDelete?: (categoryId: string) => void;

  showControls?: boolean;

  // Drag & Drop docs/categorias
  onDropDocument?: (docId: string, categoryId: string) => Promise<void> | void;
  onDropCategory?: (categoryId: string, newParentId: string | null) => Promise<void> | void;

  // Reorder (↑↓)
  onReorderCategory?: (categoryId: string, direction: 'up' | 'down') => Promise<void> | void;
}

const getCount = (c: any) => (c?.docCount ?? c?.doc_count);

const TreeNode: React.FC<{
  category: Category;
  level: number;
} & Omit<CategoryTreeProps, 'categories'>> = ({
  category,
  level,
  selectedId = null,
  onCategorySelect,
  onCreate,
  onRename,
  onDelete,
  showControls = false,
  onDropDocument,
  onDropCategory,
  onReorderCategory,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);
  const hasChildren = !!(category.children && category.children.length > 0);
  const isSelected = category.id === selectedId;

  return (
    <div>
      <div
        className={`flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors group ${
          isSelected
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('application/x-petawiki-cat', category.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onClick={() => onCategorySelect?.(category.id)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();

          const docId = e.dataTransfer.getData('application/x-petawiki-doc');
          if (docId) {
            await onDropDocument?.(docId, category.id);
            return;
          }

          const catId = e.dataTransfer.getData('application/x-petawiki-cat');
          if (catId) {
            await onDropCategory?.(catId, category.id);
          }
        }}
      >
        <div
          className="mr-2 w-4 h-4 flex items-center justify-center text-gray-400"
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setIsExpanded(!isExpanded);
          }}
        >
          {hasChildren ? (isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />) : (
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

        {getCount(category) !== null && getCount(category) !== undefined && (
          <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
            ({getCount(category)})
          </span>
        )}

        {showControls && (
          <div className="ml-2 opacity-0 group-hover:opacity-100 flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onCreate?.(category.id); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Criar subpasta"
              type="button"
            >
              <Plus size={14} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onRename?.(category.id); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Renomear"
              type="button"
            >
              <Pencil size={14} />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); onDelete?.(category.id); }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded text-red-500"
              title="Excluir"
              type="button"
            >
              <Trash2 size={14} />
            </button>

            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReorderCategory?.(category.id, 'up'); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Mover para cima"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReorderCategory?.(category.id, 'down'); }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
              title="Mover para baixo"
            >
              ↓
            </button>
          </div>
        )}
      </div>

      {isExpanded && hasChildren && (
        <div>
          {category.children!.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onCategorySelect={onCategorySelect}
              onCreate={onCreate}
              onRename={onRename}
              onDelete={onDelete}
              showControls={showControls}
              onDropDocument={onDropDocument}
              onDropCategory={onDropCategory}
              onReorderCategory={onReorderCategory}
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
  onCreate,
  onRename,
  onDelete,
  showControls = false,
  onDropDocument,
  onDropCategory,
  onReorderCategory,
}) => {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
      {/* Drop zone para mover categoria para a raiz */}
      <button
        type="button"
        className="w-full flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const catId = e.dataTransfer.getData('application/x-petawiki-cat');
          if (!catId) return;
          await onDropCategory?.(catId, null);
        }}
      >
        <span className="flex-1 text-sm font-medium">Raiz</span>
      </button>

      {/* Botão "Todas" */}
      <div
        className={`flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors ${
          selectedId === null
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
        }`}
        onClick={() => onCategorySelect?.(null)}
      >
        <span className="flex-1 text-sm font-medium">Todas</span>
      </div>

      {categories.map((category) => (
        <TreeNode
          key={category.id}
          category={category}
          level={0}
          selectedId={selectedId}
          onCategorySelect={onCategorySelect}
          onCreate={onCreate}
          onRename={onRename}
          onDelete={onDelete}
          showControls={showControls}
          onDropDocument={onDropDocument}
          onDropCategory={onDropCategory}
          onReorderCategory={onReorderCategory}
        />
      ))}
    </div>
  );
};