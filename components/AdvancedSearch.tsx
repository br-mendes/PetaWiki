import React, { useState, useMemo } from 'react';
import { Search, Filter, X, Calendar, User, Tag } from 'lucide-react';
import { Document, Category, User } from '../types';

interface SearchFilters {
  query: string;
  categoryIds: string[];
  authorIds: string[];
  tags: string[];
  dateFrom?: string;
  dateTo?: string;
  status?: string[];
  sortBy: 'relevance' | 'date' | 'title' | 'author';
  sortOrder: 'asc' | 'desc';
}

interface AdvancedSearchProps {
  documents: Document[];
  categories: Category[];
  users: User[];
  onResults: (results: Document[]) => void;
  placeholder?: string;
}

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  documents,
  categories,
  users,
  onResults,
  placeholder = 'Buscar documentos...'
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    categoryIds: [],
    authorIds: [],
    tags: [],
    sortBy: 'relevance',
    sortOrder: 'desc'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  // Extrair todas as tags disponíveis
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    documents.forEach(doc => {
      doc.tags?.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [documents]);

  // Função de busca
  const searchResults = useMemo(() => {
    let filtered = documents;

    // Filtro por texto
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(doc => {
        const titleMatch = doc.title.toLowerCase().includes(query);
        const contentMatch = doc.content.toLowerCase().includes(query);
        const tagsMatch = doc.tags?.some(tag => tag.toLowerCase().includes(query));
        return titleMatch || contentMatch || tagsMatch;
      });
    }

    // Filtro por categorias
    if (filters.categoryIds.length > 0) {
      filtered = filtered.filter(doc => 
        filters.categoryIds.includes(doc.categoryId)
      );
    }

    // Filtro por autores
    if (filters.authorIds.length > 0) {
      filtered = filtered.filter(doc => 
        filters.authorIds.includes(doc.authorId)
      );
    }

    // Filtro por tags
    if (filters.tags.length > 0) {
      filtered = filtered.filter(doc => 
        doc.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(doc => 
        filters.status.includes(doc.status)
      );
    }

    // Filtro por data
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(doc => 
        new Date(doc.createdAt) >= fromDate
      );
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(doc => 
        new Date(doc.createdAt) <= toDate
      );
    }

    // Ordenação
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'author':
          comparison = a.authorId.localeCompare(b.authorId);
          break;
        case 'relevance':
        default:
          // Relevância baseada em correspondência de texto
          if (filters.query) {
            const query = filters.query.toLowerCase();
            const aScore = calculateRelevanceScore(a, query);
            const bScore = calculateRelevanceScore(b, query);
            comparison = bScore - aScore;
          } else {
            comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    onResults(filtered);
    return filtered;
  }, [documents, filters, onResults]);

  // Calcular pontuação de relevância
  const calculateRelevanceScore = (doc: Document, query: string): number => {
    let score = 0;
    const lowerQuery = query.toLowerCase();
    const lowerTitle = doc.title.toLowerCase();
    const lowerContent = doc.content.toLowerCase();

    // Título exato
    if (lowerTitle === lowerQuery) score += 100;
    // Título contém
    else if (lowerTitle.includes(lowerQuery)) score += 50;
    // Conteúdo contém
    if (lowerContent.includes(lowerQuery)) score += 20;
    // Tags contêm
    if (doc.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) score += 30;

    return score;
  };

  const updateFilter = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      categoryIds: [],
      authorIds: [],
      tags: [],
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Barra de busca principal */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => updateFilter('query', e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-2 rounded-lg border transition-colors ${
            isExpanded 
              ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' 
              : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700'
          }`}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Filtros avançados */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Categorias */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Categorias
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {categories.map(category => (
                  <label key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('categoryIds', [...filters.categoryIds, category.id]);
                        } else {
                          updateFilter('categoryIds', filters.categoryIds.filter(id => id !== category.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Autores */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Autores
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {users.map(user => (
                  <label key={user.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.authorIds.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('authorIds', [...filters.authorIds, user.id]);
                        } else {
                          updateFilter('authorIds', filters.authorIds.filter(id => id !== user.id));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {availableTags.map(tag => (
                  <label key={tag} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilter('tags', [...filters.tags, tag]);
                        } else {
                          updateFilter('tags', filters.tags.filter(t => t !== tag));
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <Tag size={12} />
                      {tag}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Datas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Período
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm"
                />
                <span className="text-gray-500">até</span>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm"
                />
              </div>
            </div>

            {/* Ordenação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ordenar por
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={filters.sortBy}
                  onChange={(e) => updateFilter('sortBy', e.target.value)}
                  className="flex-1 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm"
                >
                  <option value="relevance">Relevância</option>
                  <option value="date">Data</option>
                  <option value="title">Título</option>
                  <option value="author">Autor</option>
                </select>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => updateFilter('sortOrder', e.target.value)}
                  className="px-2 py-1 border border-gray-200 dark:border-gray-700 rounded text-sm"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
            </div>
            <button
              onClick={clearFilters}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <X size={16} className="inline mr-1" />
              Limpar filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
};