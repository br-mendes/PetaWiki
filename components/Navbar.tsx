
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Settings, Shield, LogOut, Moon, Sun, UserCircle, Menu, X, ChevronDown, Book, FileText
} from 'lucide-react';
import { Category, User, SystemSettings, Document } from '../types';
import { Button } from './Button';
import { Sidebar } from './Sidebar'; // Re-use Sidebar content for the drawer

interface NavbarProps {
  categories: Category[];
  documents: Document[];
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
  // Navigation
  onNavigateToAnalytics: () => void;
  // Search
  searchQuery: string;
  onSearch: (query: string) => void;
  searchResults?: Document[] | null;
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  // Drawer/Sidebar State (Mobile or Sidebar Mode)
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Navbar Dropdown State (Navbar Mode)
  const [isNavDropdownOpen, setIsNavDropdownOpen] = useState(false);
  const navDropdownRef = useRef<HTMLDivElement>(null);

  // Profile Dropdown State
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Search Results State
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const { 
    user, systemSettings, toggleTheme, isDarkMode, 
    onOpenProfile, onLogout, onOpenSettings, 
    onNavigateToAnalytics, onNavigateHome,
    searchQuery, onSearch, searchResults, onSelectDocument
  } = props;

  const showExpandedLogo = !systemSettings.appName || systemSettings.appName.trim() === '';
  const isNavbarMode = systemSettings.layoutMode === 'NAVBAR';

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (navDropdownRef.current && !navDropdownRef.current.contains(event.target as Node)) {
        setIsNavDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectDoc = (doc: Document) => {
    onSelectDocument(doc);
    setShowSearchResults(false);
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors shadow-sm">
        
        {/* Left: Logo & Menu Trigger */}
        <div className="flex items-center gap-4">
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer mr-4"
          >
            {showExpandedLogo ? (
              <img 
                src={systemSettings.logoExpandedUrl} 
                alt="Logo" 
                className="h-10 w-auto object-contain rounded" 
              />
            ) : (
              <>
                <img 
                  src={systemSettings.logoCollapsedUrl} 
                  alt="Logo" 
                  className="w-8 h-8 object-contain rounded shrink-0" 
                />
                <span className="font-bold text-lg text-blue-900 dark:text-blue-400 hidden md:block leading-tight">
                  {systemSettings.appName}
                </span>
              </>
            )}
          </div>

          {isNavbarMode ? (
             /* NAVBAR MODE: Dropdown Menu Trigger */
             <div className="relative" ref={navDropdownRef}>
                <button 
                  onClick={() => setIsNavDropdownOpen(!isNavDropdownOpen)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isNavDropdownOpen ? 'bg-blue-50 text-blue-700 dark:bg-gray-800 dark:text-blue-400' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                >
                  <Menu size={18} />
                  <span className="hidden sm:inline">Navegar</span>
                  <ChevronDown size={14} className={`transition-transform ${isNavDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isNavDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                     <Sidebar 
                        {...props} 
                        variant="DROPDOWN" // Reuse Sidebar logic but stripped down
                        searchQuery={searchQuery}
                     />
                  </div>
                )}
             </div>
          ) : (
             /* SIDEBAR MODE: Drawer Trigger */
             <button 
                onClick={() => setIsMenuOpen(true)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
             >
                <Menu size={18} />
                <span className="hidden sm:inline">Biblioteca</span>
             </button>
          )}
        </div>

        {/* Center: Search Bar (Resized to max-w-sm) */}
        <div className="flex-1 max-w-md px-4 hidden md:block" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => { if (searchQuery) setShowSearchResults(true); }}
              placeholder="Buscar documentos..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 dark:text-white transition-all"
            />

            {/* Dropdown de Resultados */}
            {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                    {searchResults && searchResults.length > 0 ? (
                        <div className="py-2">
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                                Resultados
                            </div>
                            {searchResults.map((doc) => (
                                <div 
                                    key={doc.id}
                                    onClick={() => handleSelectDoc(doc)}
                                    className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors group"
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded text-blue-600 dark:text-blue-400">
                                            <FileText size={16} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                                {doc.title}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                                {doc.categoryPath || 'Sem categoria'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                            {searchQuery.length < 2 ? (
                                <p className="text-sm">Digite mais...</p>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <Search size={24} className="mb-2 opacity-50" />
                                    <p className="text-sm">Nada encontrado para "<strong>{searchQuery}</strong>"</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
          </div>
        </div>

        {/* Right: User Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user.role === 'ADMIN' && (
            <>
              <Button variant="ghost" size="sm" onClick={onNavigateToAnalytics} className="hidden lg:flex dark:text-gray-300 dark:hover:bg-gray-700">
                Analytics
              </Button>
              <button 
                onClick={onOpenSettings}
                className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                title="Configurações Admin"
              >
                <Settings size={20} />
              </button>
            </>
          )}

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1 hidden sm:block"></div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button 
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-transparent focus:outline-none"
            >
              <div className="text-right hidden md:block">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-none">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center justify-end gap-1">
                  <Shield size={10} />
                  {/* CHANGED: Show Department instead of Role */}
                  <span className="capitalize">{user.department || user.role.toLowerCase()}</span>
                </div>
              </div>
              <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold border-2 border-white dark:border-gray-600 shadow-sm overflow-hidden shrink-0">
                 {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-2 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                 {/* Mobile Info (visible mostly on small screens inside dropdown) */}
                 <div className="md:hidden px-4 py-3 border-b border-gray-100 dark:border-gray-700 mb-2">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                 </div>

                 <div className="space-y-1">
                   <button 
                     onClick={() => {
                        onOpenProfile();
                        setIsProfileMenuOpen(false);
                     }}
                     className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-700 dark:hover:text-blue-400 rounded-lg transition-colors group"
                   >
                     <div className="p-1.5 bg-gray-100 dark:bg-gray-700 rounded-md mr-3 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                        <UserCircle size={18} className="text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                     </div>
                     Editar Perfil
                   </button>
                   
                   <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>

                   <button 
                     onClick={() => {
                        onLogout();
                        setIsProfileMenuOpen(false);
                     }}
                     className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group"
                   >
                     <div className="p-1.5 bg-red-50 dark:bg-red-900/10 rounded-md mr-3 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                        <LogOut size={18} className="text-red-500 dark:text-red-400" />
                     </div>
                     Sair do Sistema
                   </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile/Desktop Drawer for Categories (Only if NOT in Navbar Mode) */}
      {isMenuOpen && !isNavbarMode && (
        <div className="fixed inset-0 z-40 flex">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
          
          {/* Drawer Panel */}
          <div className="relative w-80 bg-white dark:bg-gray-900 h-full shadow-2xl animate-in slide-in-from-left duration-200">
             <div className="absolute top-2 right-2 z-50">
                <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300">
                   <X size={20} />
                </button>
             </div>
             
             <div className="h-full flex flex-col">
                <Sidebar 
                    {...props} 
                    searchQuery={searchQuery}
                    variant="DRAWER"
                />
             </div>
          </div>
        </div>
      )}
    </>
  );
};
