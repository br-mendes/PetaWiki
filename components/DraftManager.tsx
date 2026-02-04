import React, { useEffect, useState } from 'react';
import { Save, FileText, Trash2, Clock } from 'lucide-react';
import { Draft, localStorageDraftStorage } from '../lib/drafts';
import { Button } from './Button';
import { Modal } from './Modal';
import { Category } from '../types';

interface DraftManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadDraft: (draft: Draft) => void;
  categories: Category[];
  currentCategoryId?: string | null;
}

export const DraftManager: React.FC<DraftManagerProps> = ({
  isOpen,
  onClose,
  onLoadDraft,
  categories,
  currentCategoryId
}) => {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDrafts(localStorageDraftStorage.getDrafts());
    }
  }, [isOpen]);

  const filteredDrafts = drafts.filter(draft => 
    draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    draft.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCategoryName = (categoryId: string | null): string => {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria desconhecida';
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      
      if (diffMins < 1) return 'Agora';
      if (diffMins < 60) return `${diffMins} min atrás`;
      if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h atrás`;
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const handleDelete = (id: string) => {
    localStorageDraftStorage.deleteDraft(id);
    setDrafts(prev => prev.filter(d => d.id !== id));
  };

  const handleClearAll = () => {
    if (confirm('Tem certeza? Isso removerá todos os rascunhos.')) {
      localStorageDraftStorage.clearDrafts();
      setDrafts([]);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rascunhos Salvos" size="lg">
      <div className="space-y-4">
        {/* Search and Actions */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <FileText size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar rascunhos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <Button
            variant="secondary"
            onClick={handleClearAll}
            className="text-sm"
          >
            <Trash2 size={16} className="mr-2" />
            Limpar Todos
          </Button>
        </div>

        {/* Drafts List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-2 border border-gray-200 dark:border-gray-700 rounded-lg p-2">
          {filteredDrafts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Save size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-sm">Nenhum rascunho encontrado.</p>
              <p className="text-xs mt-2">Rascunhos são salvos automaticamente enquanto você edita.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDrafts.map((draft) => (
                <div
                  key={draft.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {draft.title || 'Sem título'}
                        </h3>
                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Clock size={12} />
                          {formatDate(draft.updatedAt)}
                        </span>
                      </div>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {draft.content.replace(/<[^>]*>/g, '').slice(0, 200)}
                        {draft.content.replace(/<[^>]*>/g, '').length > 200 && '...'}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                          {getCategoryName(draft.categoryId)}
                        </span>
                        {draft.tags && draft.tags.length > 0 && (
                          <div className="flex gap-1">
                            {draft.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="badge badge-primary">
                                #{tag}
                              </span>
                            ))}
                            {draft.tags.length > 3 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                +{draft.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => onLoadDraft(draft)}
                      >
                        Carregar
                      </Button>
                      
                      <button
                        onClick={() => handleDelete(draft.id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Excluir rascunho"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
