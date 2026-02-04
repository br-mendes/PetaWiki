import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileText,
} from "lucide-react";
import { Category, Document } from "../types";

const CAT_MIME = "application/x-petawiki-cat";
const DOC_MIME = "application/x-petawiki-doc";

interface CategoryTreeProps {
  categories: Category[];
  selectedId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  documents?: Document[];
  onDocumentSelect?: (doc: Document) => void;
  showDocuments?: boolean;
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
  showControls?: boolean;
  onDropDocument?: (docId: string, categoryId: string) => Promise<void> | void;
  onDropCategory?: (categoryId: string, newParentId: string | null) => Promise<void> | void;
  onReorderCategory?: (categoryId: string, direction: "up" | "down") => Promise<void> | void;
}

const TreeNode: React.FC<{
  category: Category;
  level: number;
  selectedId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  showControls?: boolean;
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
  onDropDocument?: (docId: string, categoryId: string) => Promise<void> | void;
  onDropCategory?: (categoryId: string, newParentId: string | null) => Promise<void> | void;
  onReorderCategory?: (categoryId: string, direction: "up" | "down") => Promise<void> | void;
  docsByCatId?: Map<string, Document[]>;
  onDocumentSelect?: (doc: Document) => void;
  showDocuments?: boolean;
}> = ({
  category,
  level,
  selectedId,
  onCategorySelect,
  showControls,
  onCreate,
  onRename,
  onDelete,
  onDropDocument,
  onDropCategory,
  onReorderCategory,
  docsByCatId,
  onDocumentSelect,
  showDocuments,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 1);
  const children = category.children || [];
  const hasChildren = children.length > 0;
  const isSelected = category.id === selectedId;
  
  const docCount = (category as any).docCount ?? (category as any).doc_count ?? 0;
  const docs = showDocuments ? docsByCatId?.get(category.id) || [] : [];
  const hasNested = hasChildren || (showDocuments && docs.length > 0);
  const showBadge = docCount > 0;

  const toggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasNested) setIsExpanded((v) => !v);
  };

  const handleSelect = () => {
    onCategorySelect?.(category.id);
    if (hasNested && !isExpanded) setIsExpanded(true);
  };

  return (
    <div className="select-none">
      <div
        className={`group flex items-center gap-1.5 py-1.5 px-2 rounded-lg cursor-pointer transition-all duration-150 ${
          isSelected
            ? "bg-blue-100/80 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
            : "hover:bg-gray-100 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
        }`}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(CAT_MIME, category.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={handleSelect}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={async (e) => {
          e.preventDefault();
          const docId = e.dataTransfer.getData(DOC_MIME);
          if (docId) await onDropDocument?.(docId, category.id);
          else {
            const catId = e.dataTransfer.getData(CAT_MIME);
            if (catId) await onDropCategory?.(catId, category.id);
          }
        }}
      >
        <button
          type="button"
          onClick={toggleExpand}
          className={`p-0.5 rounded transition-colors ${
            hasNested ? "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400" : "opacity-0"
          }`}
        >
          {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <span className={isExpanded ? "text-blue-600 dark:text-blue-400" : "text-gray-400 dark:text-gray-500"}>
          {isExpanded && hasChildren ? <FolderOpen size={15} /> : <Folder size={15} />}
        </span>

        <span className="text-[13px] font-medium truncate flex-1">
          {category.name}
        </span>

        {showBadge && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
            {docCount}
          </span>
        )}
      </div>

      {isExpanded && hasNested && (
        <div className="relative">
          {children.map((child) => (
            <TreeNode
              key={child.id}
              category={child}
              level={level + 1}
              selectedId={selectedId}
              onCategorySelect={onCategorySelect}
               // Controles desabilitados - só via admin
               // showControls={showControls}
               // onCreate={onCreate}
               // onRename={onRename}
               // onDelete={onDelete}
               // onDropDocument={onDropDocument}
               // onDropCategory={onDropCategory}
               // onReorderCategory={onReorderCategory}
              docsByCatId={docsByCatId}
              onDocumentSelect={onDocumentSelect}
              showDocuments={showDocuments}
            />
          ))}

          {showDocuments && docs.map((doc) => (
            <div
              key={doc.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData(DOC_MIME, doc.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDocumentSelect?.(doc);
              }}
              className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors ${
                doc.status === 'PUBLISHED'
                  ? "hover:bg-gray-50 dark:hover:bg-gray-700/30 text-gray-600 dark:text-gray-400"
                  : "hover:bg-amber-50 dark:hover:bg-amber-900/20 text-amber-700 dark:text-amber-400"
              }`}
              style={{ paddingLeft: `${(level + 1) * 16 + 28}px` }}
            >
              <FileText size={13} />
              <span className="text-[12px] truncate flex-1">{doc.title}</span>
              {doc.status !== 'PUBLISHED' && (
                <span className={`w-1.5 h-1.5 rounded-full ${
                  doc.status === 'DRAFT' ? "bg-gray-400" : 
                  doc.status === 'REJECTED' ? "bg-red-400" : "bg-amber-400"
                }`} />
              )}
            </div>
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
  documents = [],
  onDocumentSelect,
  showDocuments = false,
  onCreate,
  onRename,
  onDelete,
  showControls = false,
  onDropDocument,
  onDropCategory,
  onReorderCategory,
}) => {
  const docsByCatId = React.useMemo(() => {
    const map = new Map<string, Document[]>();
    for (const d of documents) {
      if (!d.categoryId) continue;
      const arr = map.get(d.categoryId) || [];
      arr.push(d);
      map.set(d.categoryId, arr);
    }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      map.set(k, arr);
    }
    return map;
  }, [documents]);

  return (
    <div className="py-2">
      <button
        type="button"
        onClick={() => onCategorySelect?.(null)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors mb-1 ${
          selectedId === null
            ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            : "hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        }`}
      >
        <Folder size={16} />
      </button>

      <div className="space-y-0.5">
        {categories.map((category) => (
          <TreeNode
            key={category.id}
            category={category}
            level={0}
            selectedId={selectedId}
            onCategorySelect={onCategorySelect}
            showControls={showControls}
            onCreate={onCreate}
            onRename={onRename}
            onDelete={onDelete}
            onDropDocument={onDropDocument}
            onDropCategory={onDropCategory}
            onReorderCategory={onReorderCategory}
            docsByCatId={docsByCatId}
            onDocumentSelect={onDocumentSelect}
            showDocuments={showDocuments}
          />
        ))}
      </div>
    </div>
  );
};
