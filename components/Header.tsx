
import React from 'react';
import { Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearch }) => {
  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
      <div className="flex-1 max-w-xl">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Buscar documentos, categorias, tags..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 dark:text-white transition-all"
          />
        </div>
      </div>
    </header>
  );
};
