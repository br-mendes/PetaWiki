
import React, { useState, useRef, useEffect } from 'react';
import {
  Search, Settings, Shield, LogOut, Moon, Sun, UserCircle, Menu, X, ChevronDown, Book, FileText, Activity
} from 'lucide-react';
import { Category, User, SystemSettings, Document } from '../types';
import { Button } from './Button';
import { Sidebar } from './Sidebar'; // Re-use Sidebar content for the drawer
import { NotificationsBell } from "./NotificationsBell";

interface NavbarProps {
  categories: Category[];
  documents: Document[];
  favoriteDocuments?: Document[];
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
  onNavigateToReviewCenter?: () => void;
  // Search
  searchQuery: string;
  onSearch: (query: string) => void;
  searchResults?: Document[] | null;
  onOpenDocumentById: (docId: string) => void | Promise<void>;
  onOpenReviewCenterByDocId?: (docId: string) => void | Promise<void>;
  //  NOVO: Favoritos (repassa pro Sidebar no dropdown/drawer)
  docFilter?: 'ALL' | 'FAVORITES';
  onToggleFavorites?: () => void;
  favoriteCount?: number;
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
      <header className="h-14 sm:h-16 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 transition-all duration-300 shadow-lg shadow-blue-100/50 dark:shadow-gray-900/50 backdrop-blur-md">
        
        {/* Left: Logo & Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer mr-0 sm:mr-4"
          >
            {showExpandedLogo ? (
              <img
                src={systemSettings.logoExpandedUrl}
                alt="Logo"
                className="h-8 sm:h-10 w-auto object-contain rounded"
              />
            ) : (
              <>
                <img
                  src={systemSettings.logoCollapsedUrl}
                  alt="Logo"
                  className="w-6 h-6 sm:w-8 sm:h-8 object-contain rounded shrink-0"
                />
                <span className="font-bold text-base sm:text-lg text-blue-900 dark:text-blue-400 hidden sm:block leading-tight">
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
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 ${isNavDropdownOpen ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-md'}`}
                >
                  <Menu size={16} />
                  <span className="hidden sm:inline">Navegar</span>
                  <ChevronDown size={12} className={`transition-transform duration-200 ${isNavDropdownOpen ? 'rotate-180' : ''}`} />
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
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all duration-200 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
             >
                <Menu size={16} />
                <span className="hidden sm:inline">Biblioteca</span>
             </button>
          )}
        </div>

        {/* Center: Search Bar (Resized to max-w-sm) */}
        <div className="flex-1 max-w-md px-2 sm:px-4 block" ref={searchContainerRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => { if (searchQuery) setShowSearchResults(true); }}
              placeholder={window.innerWidth < 640 ? "Buscar..." : "Buscar documentos..."}
              className="w-full pl-10 pr-3 py-2 sm:pr-4 sm:py-2.5 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 dark:text-white transition-all duration-200 shadow-sm hover:shadow-md"
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
        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg sm:rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
            title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <NotificationsBell
            userId={user.id}
            onOpenDocumentById={props.onOpenDocumentById}
            onOpenReviewCenterByDocId={props.onOpenReviewCenterByDocId}
          />

          {user.role === 'ADMIN' && (
            <>
              <button
                type="button"
                onClick={onNavigateToAnalytics}
                title="Analytics"
                aria-label="Analytics"
                className="hidden lg:flex items-center justify-center p-2 rounded-lg text-gray-500 hover:text-purple-700 dark:text-gray-400 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                <Activity size={18} />
              </button>
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
              className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 leading-none">{user.name}</div>
                <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 flex items-center justify-end gap-1">
                  <Shield size={8} />
                  {/* CHANGED: Show Department instead of Role */}
                  <span className="capitalize">{user.department || user.role.toLowerCase()}</span>
                </div>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-full flex items-center justify-center text-white font-bold border-2 border-white dark:border-gray-600 shadow-lg shadow-blue-500/30 overflow-hidden shrink-0">
                  {user.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
               </div>
               <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 sm:p-3 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
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
                      className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 dark:hover:from-gray-700 dark:hover:to-gray-600 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl transition-all duration-200 group hover:shadow-md"
                    >
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl mr-2 sm:mr-3 group-hover:from-blue-100 group-hover:to-blue-200 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-900/40 transition-all duration-200">
                         <UserCircle size={16} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                      </div>
                      Editar Perfil
                    </button>
                   
                   <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>

                    <button
                      onClick={() => {
                         onLogout();
                         setIsProfileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/20 dark:hover:to-red-900/30 rounded-xl transition-all duration-200 group hover:shadow-md"
                    >
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-900/20 rounded-xl mr-2 sm:mr-3 group-hover:from-red-100 group-hover:to-red-200 dark:group-hover:from-red-900/30 dark:group-hover:to-red-900/40 transition-all duration-200">
                         <LogOut size={16} className="text-red-500 dark:text-red-400" />
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
          <div className="relative w-72 sm:w-80 bg-white dark:bg-gray-900 h-full shadow-2xl animate-in slide-in-from-left duration-200">
              <div className="absolute top-3 right-3 z-50">
                 <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
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
