
import React, { useState } from 'react';
import { 
  Search, Settings, User as UserIcon, Shield, LogOut, Moon, Sun, UserCircle, Menu, X
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
  const { user, systemSettings, toggleTheme, isDarkMode, onOpenProfile, onLogout, onOpenSettings, onNavigateToAnalytics, onNavigateHome } = props;

  const showExpandedLogo = !systemSettings.appName || systemSettings.appName.trim() === '';

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

          <div className="flex items-center gap-3 group relative cursor-pointer">
            <div className="text-right hidden md:block">
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-end gap-1">
                <Shield size={10} />
                {user.role}
              </div>
            </div>
            <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 font-bold border-2 border-white dark:border-gray-600 shadow-sm overflow-hidden">
               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            
            {/* Dropdown for Profile/Logout */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block p-1 z-50">
               <button 
                 onClick={onOpenProfile}
                 className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded mb-1"
               >
                 <UserCircle size={16} className="mr-2" /> Meu Perfil
               </button>
               <button 
                 onClick={onLogout}
                 className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
               >
                 <LogOut size={16} className="mr-2" /> Sair
               </button>
            </div>
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
