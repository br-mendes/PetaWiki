
import React, { useState } from 'react';
import { 
  ChevronRight, ChevronDown, Plus, Trash2, 
  Book, Folder, FolderOpen, FileText, 
  LifeBuoy, Server, MessageCircle, Mail, Monitor, 
  Users, UserPlus, Heart, Library, Settings, LogOut, Sun, Moon, UserCircle, PlusCircle
} from 'lucide-react';
import { Category, User, SystemSettings, Document } from '../types';
import { canUserModifyCategory } from '../lib/hierarchy';

// Mapping string keys from DB/Category to Actual Components
const ICON_MAP: Record<string, React.ElementType> = {
  'life-buoy': LifeBuoy,
  'server': Server,
  'message-circle': MessageCircle,
  'mail': Mail,
  'monitor': Monitor,
  'users': Users,
  'user-plus': UserPlus,
  'heart': Heart,
  'folder': Folder,
  'book': Book,
  'library': Library
};

interface SidebarProps {
  categories: Category[]; // Expects a Tree structure passed from App
  documents: Document[]; // All documents to be filtered by category
  onSelectCategory: (category: Category) => void;
  onSelectDocument: (document: Document) => void;
  onNavigateHome: () => void;
  user: User;
  onCreateCategory: (parentId: string | null) => void;
  onDeleteCategory: (categoryId: string) => void;
  systemSettings: SystemSettings;
  // User Controls
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
  // Search Context
  searchQuery?: string;
  // Variant
  variant?: 'SIDEBAR' | 'DRAWER' | 'DROPDOWN';
}

const CategoryItem: React.FC<{ 
  category: Category; 
  categoryDocuments: Document[];
  allDocuments: Document[];
  onSelectCategory: (c: Category) => void; 
  onSelectDocument: (d: Document) => void;
  onCreate: (parentId: string) => void;
  onDelete: (id: string) => void;
  user: User;
  depth?: number 
}> = ({ 
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
  const [isOpen, setIsOpen] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const hasChildren = category.children && category.children.length > 0;
  const hasDocuments = categoryDocuments.length > 0;
  const isEmpty = !hasChildren && !hasDocuments;

  const canModify = canUserModifyCategory(user, category);
  const canDelete = user.role === 'ADMIN'; 

  // --- Icon Logic ---
  const renderIcon = () => {
    // 1. Try to find mapped icon from category.icon string
    if (category.icon && ICON_MAP[category.icon]) {
      const MappedIcon = ICON_MAP[category.icon];
      return <MappedIcon size={16} className={`mr-2 shrink-0 ${depth === 0 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />;
    }

    // 2. Check if it's an emoji (simple length check or regex, assuming db stores emoji chars)
    if (category.icon && category.icon.length <= 2) {
       return <span className="mr-2 text-base leading-none shrink-0">{category.icon}</span>;
    }

    // 3. Fallback based on depth
    if (depth === 0) {
      return <Library size={16} className="mr-2 shrink-0 text-blue-600 dark:text-blue-400" />;
    } else {
      return isOpen 
        ? <FolderOpen size={16} className="mr-2 shrink-0 text-yellow-500 dark:text-yellow-400" />
        : <Folder size={16} className="mr-2 shrink-0 text-yellow-500 dark:text-yellow-400" />;
    }
  };

  return (
    <div className="relative group">
      {/* Category Row */}
      <div 
        className={`flex items-center px-2 py-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md text-sm text-gray-700 dark:text-gray-300 select-none justify-between pr-1 transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700`}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
        onClick={() => {
           if (!isEmpty) setIsOpen(!isOpen);
           onSelectCategory(category);
        }}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          <div className="mr-1 w-4 h-4 flex items-center justify-center text-gray-400 shrink-0 transition-transform duration-200">
            {!isEmpty && (
              <span className={isOpen ? "rotate-90" : ""}>
                 <ChevronRight size={14} />
              </span>
            )}
          </div>
          
          {renderIcon()}
          
          <span className={`truncate ${depth === 0 ? 'font-semibold' : ''}`}>{category.name}</span>
          {category.docCount > 0 && <span className="text-xs text-gray-400 ml-2 shrink-0">({category.docCount})</span>}
        </div>

        {/* Hover Actions */}
        {showActions && (
          <div className="flex items-center gap-1 bg-white dark:bg-gray-800 shadow-sm rounded-md border border-gray-100 dark:border-gray-700 p-0.5 absolute right-2 z-10 animate-in fade-in zoom-in-95 duration-100">
            {canModify && depth < 4 && (
              <button 
                onClick={(e) => { e.stopPropagation(); onCreate(category.id); }}
                title="Adicionar Subcategoria aqui"
                className="p-1 hover:bg-blue-50 text-blue-600 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded transition-colors"
              >
                <Plus size={14} />
              </button>
            )}
            {canDelete && (
               <button 
               onClick={(e) => { e.stopPropagation(); onDelete(category.id); }}
               title="Excluir Categoria"
               className="p-1 hover:bg-red-50 text-red-600 dark:text-red-400 dark:hover:bg-red-900/30 rounded transition-colors"
             >
               <Trash2 size={14} />
             </button>
            )}
          </div>
        )}
      </div>
      
      {/* Children & Documents */}
      {isOpen && (
        <div className="mt-0.5 relative">
          {/* Linha guia visual para hierarquia */}
          <div 
            className="absolute left-0 top-0 bottom-0 border-l border-gray-200 dark:border-gray-700" 
            style={{ left: `${depth * 12 + 15}px` }}
          />

          {/* Render Subcategories */}
          {category.children?.map((child) => (
            <CategoryItem 
              key={child.id} 
              category={child} 
              categoryDocuments={allDocuments.filter(d => d.categoryId === child.id)}
              allDocuments={allDocuments}
              onSelectCategory={onSelectCategory}
              onSelectDocument={onSelectDocument}
              onCreate={onCreate}
              onDelete={onDelete}
              user={user}
              depth={depth + 1} 
            />
          ))}
          
          {/* Render Documents in this Category */}
          {categoryDocuments.map((doc) => (
            <div 
              key={doc.id}
              onClick={(e) => { e.stopPropagation(); onSelectDocument(doc); }}
              className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md text-sm text-gray-600 dark:text-gray-400 select-none group/doc transition-colors ml-1"
              style={{ paddingLeft: `${(depth + 1) * 12 + 24}px` }}
            >
              <FileText size={14} className="mr-2 text-gray-400 group-hover/doc:text-blue-500 shrink-0" />
              <span className="truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {doc.title}
              </span>
              {doc.status !== 'PUBLISHED' && (
                <span className={`ml-2 w-2 h-2 rounded-full shrink-0 ${doc.status === 'DRAFT' ? 'bg-gray-300' : 'bg-yellow-400'}`} title={doc.status} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  categories, 
  documents,
  onSelectCategory, 
  onSelectDocument,
  onNavigateHome, 
  user,
  onCreateCategory,
  onDeleteCategory,
  systemSettings,
  onOpenSettings,
  onLogout,
  onOpenProfile,
  toggleTheme,
  isDarkMode,
  searchQuery,
  variant = 'SIDEBAR'
}) => {
  const isAdminOrEditor = user.role === 'ADMIN' || user.role === 'EDITOR';
  const showExpandedLogo = !systemSettings.appName || systemSettings.appName.trim() === '';
  
  // Check if we are in search mode
  const isSearching = searchQuery && searchQuery.trim().length > 0;

  const isDropdown = variant === 'DROPDOWN';

  // Base classes differ based on variant
  const containerClasses = isDropdown 
    ? "w-full h-full flex flex-col bg-white dark:bg-gray-800" 
    : "w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col transition-colors z-20 shadow-xl";

  return (
    <div className={containerClasses}>
      {/* 1. Header Area with Logo (Hidden in Dropdown mode) */}
      {!isDropdown && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            {showExpandedLogo ? (
              <img 
                src={systemSettings.logoExpandedUrl} 
                alt="Logo" 
                className="w-full h-auto object-contain max-h-12 rounded" 
              />
            ) : (
              <>
                <img 
                  src={systemSettings.logoCollapsedUrl} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain rounded shrink-0" 
                />
                <span className="font-bold text-lg text-blue-900 dark:text-blue-400 leading-tight truncate">
                  {systemSettings.appName}
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* 2. Scrollable Navigation Area */}
      <div className={`flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 ${isDropdown ? 'max-h-[70vh]' : ''}`}>
        <div className="mb-4">
          <div className="flex items-center justify-between px-2 mb-3">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {isSearching ? 'Resultados da Busca' : 'Biblioteca'}
            </h3>
          </div>

          {/* Botão Principal de Adicionar Raiz - Somente se não estiver buscando */}
          {!isSearching && isAdminOrEditor && (
            <button 
              onClick={() => onCreateCategory(null)}
              className="w-full flex items-center justify-center gap-2 mb-4 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all shadow-sm group"
            >
              <PlusCircle size={16} className="group-hover:scale-110 transition-transform" />
              <span className="font-medium text-sm">Nova Categoria Raiz</span>
            </button>
          )}
          
          {isSearching ? (
             // --- SEARCH MODE: FLAT LIST ---
             <div className="space-y-1">
                {documents.length === 0 ? (
                    <div className="text-sm text-gray-400 px-4 py-4 text-center italic">
                        Nenhum documento encontrado.
                    </div>
                ) : (
                    documents.map(doc => (
                        <div 
                            key={doc.id}
                            onClick={() => onSelectDocument(doc)}
                            className="flex flex-col px-3 py-2 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md group transition-colors"
                        >
                            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200 font-medium">
                                <FileText size={14} className="text-blue-500 shrink-0" />
                                <span className="truncate">{doc.title}</span>
                            </div>
                            <div className="ml-5 text-xs text-gray-400 dark:text-gray-500 truncate">
                                {doc.categoryPath || 'Sem categoria'}
                            </div>
                        </div>
                    ))
                )}
             </div>
          ) : (
             // --- NORMAL MODE: CATEGORY TREE ---
             <div className="space-y-0.5">
               {categories.length === 0 && (
                 <div className="text-center py-8 text-gray-400 text-sm italic">
                   Nenhuma categoria.<br/>Crie uma para começar.
                 </div>
               )}
               {categories.map(cat => (
                  <CategoryItem 
                    key={cat.id} 
                    category={cat} 
                    categoryDocuments={documents.filter(d => d.categoryId === cat.id)}
                    allDocuments={documents}
                    onSelectCategory={onSelectCategory}
                    onSelectDocument={onSelectDocument}
                    onCreate={onCreateCategory}
                    onDelete={onDeleteCategory}
                    user={user}
                  />
                ))}
             </div>
          )}
        </div>
      </div>

      {/* 3. Footer Area with User Controls (Hidden in Dropdown mode) */}
      {!isDropdown && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
          <div className="flex items-center gap-3 mb-3 px-1">
              <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600" />
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate capitalize">{user.department || user.role.toLowerCase()}</p>
              </div>
          </div>
          
          <div className="grid grid-cols-4 gap-1">
              <button 
                  onClick={onOpenProfile} 
                  title="Meu Perfil"
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              >
                  <UserCircle size={18} />
              </button>
              
              <button 
                  onClick={toggleTheme} 
                  title="Alternar Tema"
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
              >
                  {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user.role === 'ADMIN' ? (
                  <button 
                      onClick={onOpenSettings} 
                      title="Configurações Admin"
                      className="flex items-center justify-center p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors"
                  >
                      <Settings size={18} />
                  </button>
              ) : (
                  <div /> /* Spacer */
              )}

              <button 
                  onClick={onLogout} 
                  title="Sair"
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              >
                  <LogOut size={18} />
              </button>
          </div>
        </div>
      )}
    </div>
  );
};
