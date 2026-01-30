import React from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { Category, Document } from "../types";

type Direction = "up" | "down";

interface CategoryTreeProps {
  categories: Category[];              // TREE (com children)
  selectedId?: string | null;          // categoria ativa
  onCategorySelect?: (categoryId: string | null) => void;

  // Optional: show documents inside categories (sidebar explorer)
  documents?: Document[];
  onDocumentSelect?: (doc: Document) => void;
  showDocuments?: boolean;

  // CRUD rapido (opcional)
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;

  showControls?: boolean;

  //  DnD
  onDropDocument?: (docId: string, categoryId: string) => Promise<void> | void;
  onDropCategory?: (categoryId: string, newParentId: string | null) => Promise<void> | void;

  //  reorder up/down
  onReorderCategory?: (categoryId: string, direction: Direction) => Promise<void> | void;
}

const CAT_MIME = "application/x-petawiki-cat";
const DOC_MIME = "application/x-petawiki-doc";

const IconBtn: React.FC<{
  title: string;
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "danger";
  children: React.ReactNode;
}> = ({ title, onClick, variant = "default", children }) => {
  const base =
    "p-1.5 rounded-md transition-colors flex items-center justify-center";
  const styles =
    variant === "danger"
      ? "hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400"
      : "hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300";

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-label={title}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
};

const MenuItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: "default" | "danger";
  disabled?: boolean;
}> = ({ icon, label, onClick, variant = "default", disabled = false }) => {
  const base =
    "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors";
  const styles =
    variant === "danger"
      ? "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
      : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";

  const disabledStyles =
    "opacity-50 cursor-not-allowed hover:bg-transparent dark:hover:bg-transparent";

  return (
    <button
      type="button"
      className={`${base} ${disabled ? disabledStyles : styles}`}
      onClick={() => {
        if (!disabled) onClick();
      }}
      aria-disabled={disabled}
      disabled={disabled}
    >
      <span className="shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
    </button>
  );
};

const Dropdown: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const onDocClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) onClose();
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={ref}
      className="absolute right-2 top-full mt-2 z-50 w-56 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl p-1"
    >
      {children}
    </div>
  );
};

const TreeNode: React.FC<{
  category: Category;
  level: number;
  siblingIndex: number;
  siblingCount: number;
  selectedId?: string | null;
  onCategorySelect?: (categoryId: string | null) => void;
  onCreate?: (parentId: string | null) => void;
  onRename?: (id: string) => void;
  onDelete?: (id: string) => void;
  showControls?: boolean;
  onDropDocument?: (docId: string, categoryId: string) => Promise<void> | void;
  onDropCategory?: (categoryId: string, newParentId: string | null) => Promise<void> | void;
  onReorderCategory?: (categoryId: string, direction: Direction) => Promise<void> | void;

  docsByCatId?: Map<string, Document[]>;
  onDocumentSelect?: (doc: Document) => void;
  showDocuments?: boolean;
}> = ({
  category,
  level,
  siblingIndex,
  siblingCount,
  selectedId,
  onCategorySelect,
  onCreate,
  onRename,
  onDelete,
  showControls,
  onDropDocument,
  onDropCategory,
  onReorderCategory,
  docsByCatId,
  onDocumentSelect,
  showDocuments,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 1);
  const [menuOpen, setMenuOpen] = React.useState(false);
  const children = category.children || [];
  const hasChildren = children.length > 0;
  const isSelected = category.id === selectedId;
  const canMoveUp = siblingIndex > 0;
  const canMoveDown = siblingIndex < siblingCount - 1;
  const canMoveToRoot = level > 0;
  const canReorder = typeof onReorderCategory === "function";
  const canDropCategory = typeof onDropCategory === "function";

  const docCount = (category as any).docCount ?? (category as any).doc_count ?? 0;
  const docs = showDocuments ? docsByCatId?.get(category.id) || [] : [];
  const hasNested = hasChildren || (showDocuments && docs.length > 0);

  const toggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasNested) setIsExpanded((v) => !v);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-lg cursor-pointer transition-colors group min-w-0 border ${
          isSelected
            ? "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800/60 dark:text-blue-200"
            : "bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-800/60 dark:hover:border-gray-700 text-gray-800 dark:text-gray-200"
        }`}
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData(CAT_MIME, category.id);
          e.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => onCategorySelect?.(category.id)}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }}
        onDrop={async (e) => {
          e.preventDefault();

          const docId = e.dataTransfer.getData(DOC_MIME);
          if (docId) {
            await onDropDocument?.(docId, category.id);
            return;
          }

          const catId = e.dataTransfer.getData(CAT_MIME);
          if (catId) {
            await onDropCategory?.(catId, category.id);
          }
        }}
      >
        <button
          type="button"
          onClick={toggleExpand}
          title={hasNested ? (isExpanded ? "Recolher" : "Expandir") : ""}
          className={`mr-1 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
            hasNested
              ? "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              : "text-gray-300 dark:text-gray-700"
          }`}
          aria-label={hasNested ? (isExpanded ? "Recolher" : "Expandir") : "Sem filhos"}
        >
          {hasNested ? (
            isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
          ) : (
            <span className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
          )}
        </button>

        <div className="mr-1 flex items-center">
          {isExpanded && hasNested ? (
            <FolderOpen size={16} className="text-blue-600 dark:text-blue-300" />
          ) : (
            <Folder size={16} className="text-gray-500 dark:text-gray-400" />
          )}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-medium truncate" title={category.name}>
            {category.name}
          </span>
        </div>

        {docCount > 0 && (
          <span className="shrink-0 text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
            {docCount}
          </span>
        )}

        {showControls && (
          <div className="ml-2 shrink-0 opacity-0 group-hover:opacity-100 flex items-center gap-1">
            <IconBtn
              title="Adicionar subpasta"
              onClick={(e) => {
                e.stopPropagation();
                onCreate?.(category.id);
              }}
            >
              <Plus size={16} />
            </IconBtn>

            <div className="relative">
              <IconBtn
                title="Mais acoes"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
              >
                <MoreHorizontal size={16} />
              </IconBtn>

              <Dropdown open={menuOpen} onClose={() => setMenuOpen(false)}>
                <MenuItem
                  icon={<ArrowUp size={16} />}
                  label="Mover para cima"
                  disabled={!canReorder || !canMoveUp}
                  onClick={() => {
                    setMenuOpen(false);
                    onReorderCategory?.(category.id, "up");
                  }}
                />

                <MenuItem
                  icon={<ArrowDown size={16} />}
                  label="Mover para baixo"
                  disabled={!canReorder || !canMoveDown}
                  onClick={() => {
                    setMenuOpen(false);
                    onReorderCategory?.(category.id, "down");
                  }}
                />

                <MenuItem
                  icon={<FolderOpen size={16} />}
                  label="Mover para raiz"
                  disabled={!canDropCategory || !canMoveToRoot}
                  onClick={async () => {
                    setMenuOpen(false);
                    await onDropCategory?.(category.id, null);
                  }}
                />

                <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />

                <MenuItem
                  icon={<Pencil size={16} />}
                  label="Renomear"
                  disabled={typeof onRename !== "function"}
                  onClick={() => {
                    setMenuOpen(false);
                    onRename?.(category.id);
                  }}
                />

                <MenuItem
                  icon={<Trash2 size={16} />}
                  label="Excluir"
                  variant="danger"
                  disabled={typeof onDelete !== "function"}
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete?.(category.id);
                  }}
                />
              </Dropdown>
            </div>
          </div>
        )}
      </div>

      {isExpanded && hasNested && (
        <div className="ml-4 pl-3 border-l border-gray-200/80 dark:border-gray-700/60">
          {children.map((child, idx) => (
            <TreeNode
              key={child.id}
              category={child}
              level={level + 1}
              siblingIndex={idx}
              siblingCount={children.length}
              selectedId={selectedId}
              onCategorySelect={onCategorySelect}
              onCreate={onCreate}
              onRename={onRename}
              onDelete={onDelete}
              showControls={showControls}
              onDropDocument={onDropDocument}
              onDropCategory={onDropCategory}
              onReorderCategory={onReorderCategory}
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
              title={doc.title}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-gray-800 dark:text-gray-200"
            >
              <FileText size={14} className="text-gray-400 shrink-0" />
              <span className="text-sm truncate flex-1 min-w-0">{doc.title}</span>
              {doc.status !== 'PUBLISHED' && (
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${doc.status === 'DRAFT' ? 'bg-gray-300' : doc.status === 'REJECTED' ? 'bg-red-400' : 'bg-yellow-400'}`}
                  title={doc.status}
                />
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
    // Stable sorting by title
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
      map.set(k, arr);
    }
    return map;
  }, [documents]);

  return (
    <div className="rounded-xl bg-white/60 dark:bg-gray-800/50">
      <button
        type="button"
        className="w-full flex items-center py-2 px-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-800 dark:text-gray-200"
        onClick={() => onCategorySelect?.(null)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={async (e) => {
          e.preventDefault();
          const catId = e.dataTransfer.getData(CAT_MIME);
          if (!catId) return;
          await onDropCategory?.(catId, null);
        }}
        title="Raiz (solte uma pasta aqui para virar raiz)"
      >
        <div className="mr-2 w-4 h-4 flex items-center justify-center text-gray-400" />
        <span className="flex-1 text-sm font-semibold">Todas as pastas</span>
      </button>

      <div className="mt-1 space-y-0.5">
        {categories.map((category, index) => (
          <TreeNode
            key={category.id}
            category={category}
            level={0}
            siblingIndex={index}
            siblingCount={categories.length}
            selectedId={selectedId}
            onCategorySelect={onCategorySelect}
            onCreate={onCreate}
            onRename={onRename}
            onDelete={onDelete}
            showControls={showControls}
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
