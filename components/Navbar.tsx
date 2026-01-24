
import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, Settings, Shield, LogOut, Moon, Sun, UserCircle, Menu, X, ChevronDown
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
}

export const Navbar: React.FC<NavbarProps> = (props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const { user, systemSettings, toggleTheme, isDarkMode, onOpenProfile, onLogout, onOpenSettings, onNavigateToAnalytics, onNavigateHome } = props;

  const showExpandedLogo = !systemSettings.appName || systemSettings.appName.trim() === '';

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

          <button 
            onClick={() => setIsMenuOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors"
          >
            <Menu size={18} />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl px-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar documentos..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 dark:text-white transition-all"
            />
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
                  {user.role}
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

      {/* Mobile/Desktop Drawer for Categories */}
      {isMenuOpen && (
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
             
             {/* Reuse Sidebar logic inside Drawer, but we can hide the footer controls since they are in navbar */}
             <div className="h-full flex flex-col">
                <Sidebar 
                    {...props} 
                    // Overrides to hide duplicate controls if desired, or keep them for mobile flexibility
                />
             </div>
          </div>
        </div>
      )}
    </>
  );
};
