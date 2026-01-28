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
} from "lucide-react";
import { Category } from "../types";

type Direction = "up" | "down";

interface CategoryTreeProps {
  categories: Category[];              // TREE (com children)
  selectedId?: string | null;          // categoria ativa
  onCategorySelect?: (categoryId: string | null) => void;

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
}) => {
  const [isExpanded, setIsExpanded] = React.useState(level < 2);
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

  const toggleExpand = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (hasChildren) setIsExpanded((v) => !v);
  };

  return (
    <div>
      <div
        className={`flex items-center gap-2 py-2 px-2 rounded-md cursor-pointer transition-colors group min-w-0 ${
          isSelected
            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
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
        <div className="mr-2 w-4 h-4 flex items-center justify-center text-gray-400" onClick={toggleExpand}>
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

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm truncate" title={category.name}>
            {category.name}
          </span>

          {level > 0 && (
            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
              ({docCount})
            </span>
          )}
        </div>

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

      {isExpanded && hasChildren && (
        <div>
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
      <button
        type="button"
        className="w-full flex items-center py-2 px-2 rounded-md cursor-pointer transition-colors border-b border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200"
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
        <span className="flex-1 text-sm font-medium">Raiz</span>
      </button>

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
        />
      ))}
    </div>
  );
};
