
import React, { useRef, useEffect, useState } from 'react';
import { Search, FileText } from 'lucide-react';
import { Document } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searchResults?: Document[] | null;
  onSelectDocument?: (doc: Document) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  searchQuery, 
  onSearch, 
  searchResults,
  onSelectDocument 
}) => {
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (doc: Document) => {
    if (onSelectDocument) {
      onSelectDocument(doc);
      setShowResults(false);
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-20 transition-colors">
      <div className="flex-1 max-w-xl" ref={containerRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => { if (searchQuery) setShowResults(true); }}
            placeholder="Buscar documentos, categorias, tags..." 
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 dark:text-white transition-all"
          />
          
          {/* Dropdown de Resultados */}
          {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-96 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-100">
                {searchResults && searchResults.length > 0 ? (
                    <div className="py-2">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-900/50">
                            Documentos Encontrados
                        </div>
                        {searchResults.map((doc) => (
                            <div 
                                key={doc.id}
                                onClick={() => handleSelect(doc)}
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
                            <p className="text-sm">Digite mais caracteres para buscar...</p>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Search size={24} className="mb-2 opacity-50" />
                                <p className="text-sm">Nenhum resultado encontrado para "<strong>{searchQuery}</strong>"</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
