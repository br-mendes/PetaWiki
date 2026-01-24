import React from 'react';
import { Search, Settings, User as UserIcon, Shield, LogOut, Moon, Sun, UserCircle } from 'lucide-react';
import { User, Role } from '../types';
import { Button } from './Button';

interface HeaderProps {
  user: User;
  onRoleChange: (role: Role) => void;
  onNavigateToAnalytics: () => void;
  onNavigateHome: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  user, 
  onRoleChange, 
  onNavigateToAnalytics, 
  onNavigateHome,
  onOpenSettings,
  onLogout,
  onOpenProfile,
  toggleTheme,
  isDarkMode
}) => {
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar documentos, categorias..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 dark:text-white transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={isDarkMode ? "Modo Claro" : "Modo Escuro"}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user.role === 'ADMIN' && (
          <>
            <Button variant="ghost" size="sm" onClick={onNavigateToAnalytics} className="dark:text-gray-300 dark:hover:bg-gray-700">
              Analytics
            </Button>
            <button 
              onClick={onOpenSettings}
              className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              title="Configurações Admin"
            >
              <Settings size={20} />
            </button>
          </>
        )}
        
        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

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
          <div className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-100 dark:border-gray-700 hidden group-hover:block p-1 z-50">
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
  );
};