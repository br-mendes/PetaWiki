
import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Eye, Download, ThumbsUp, ThumbsDown, Heart, FileText, FileType, History, RotateCcw, Trash2, File, Bookmark } from 'lucide-react';
import { Document, User, SystemSettings, DocumentVersion } from '../types';
import { Button } from './Button';
import { StatusBadge } from './Badge';
import { canExportDocument, generateMarkdown, generatePDF, generateDOCX } from '../lib/export';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';

interface DocumentViewProps {
  document: Document;
  user: User;
  onEdit: () => void;
  onDelete?: () => void;
  systemSettings: SystemSettings;
  onRestoreVersion?: (version: DocumentVersion) => void;
  onSearchTag?: (tag: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (docId: string) => void;
}

type ReactionType = 'THUMBS_UP' | 'THUMBS_DOWN' | 'HEART';

export const DocumentView: React.FC<DocumentViewProps> = ({ 
  document, 
  user, 
  onEdit,
  onDelete,
  systemSettings,
  onRestoreVersion,
  onSearchTag,
  isFavorite,
  onToggleFavorite
}) => {
  const toast = useToast();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  
  // Real-time View Count State
  const [liveViews, setLiveViews] = useState(document.views);
  const viewRegistered = useRef(false);

  // Reaction State
  const [userReactions, setUserReactions] = useState<ReactionType[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<ReactionType, number>>({
    THUMBS_UP: 0,
    THUMBS_DOWN: 0,
    HEART: 0
  });
  
  const canEdit = user.role === 'ADMIN' || (user.role === 'EDITOR' && document.authorId === user.id);
  const canDelete = user.role === 'ADMIN' || (user.role === 'EDITOR' && document.authorId === user.id);
  const canExport = canExportDocument(user, document);

  const loadVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const { data, error } = await supabase.rpc('get_document_versions', {
        p_document_id: document.id,
        p_limit: 3
      });

      if (error) throw error;

      const mapped: DocumentVersion[] = (data || []).map((v: any) => ({
        id: v.id,
        title: v.title,
        content: v.content ?? '',
        savedAt: v.saved_at,
        savedBy: v.saved_by
      }));

      setVersions(mapped);
    } catch (e) {
      console.error(e);
      setVersions([]);
      toast.error('Erro ao carregar histórico de versões.');
    } finally {
      setIsLoadingVersions(false);
    }
  };

  // --- View Tracking Logic ---
  useEffect(() => {
    viewRegistered.current = false;
    setLiveViews(document.views);
  }, [document.id]);

  useEffect(() => {
    const registerView = async () => {
      if (viewRegistered.current) return;
      viewRegistered.current = true;

      try {
        const { data: newCount, error } = await supabase.rpc('register_view', {
          p_doc_id: document.id,
          p_user_id: user.id
        });

        if (error) {
            console.error("Failed to register view:", error);
        } else if (typeof newCount === 'number') {
            setLiveViews(newCount);
        }
      } catch (err) {
        console.error(err);
      }
    };

    registerView();
  }, [document.id, user.id]);

  // --- Feedback Logic ---
  useEffect(() => {
    fetchReactions();
  }, [document.id, user.id]);

  const fetchReactions = async () => {
    try {
        const { data: userData } = await supabase
            .from('document_reactions')
            .select('reaction_type')
            .eq('document_id', document.id)
            .eq('user_id', user.id);
        
        if (userData) {
            setUserReactions(userData.map((r: any) => r.reaction_type));
        }

        const { data: allReactions } = await supabase
            .from('document_reactions')
            .select('reaction_type')
            .eq('document_id', document.id);

        const newCounts = { THUMBS_UP: 0, THUMBS_DOWN: 0, HEART: 0 };
        allReactions?.forEach((r: any) => {
            if (newCounts[r.reaction_type as ReactionType] !== undefined) {
                newCounts[r.reaction_type as ReactionType]++;
            }
        });
        setReactionCounts(newCounts);

    } catch (error) {
        console.error("Erro ao carregar feedbacks", error);
    }
  };

  const handleToggleReaction = async (type: ReactionType) => {
    const oldReactions = [...userReactions];
    let newReactions = [...userReactions];
    let newCounts = { ...reactionCounts };

    const isActive = newReactions.includes(type);

    if (isActive) {
        newReactions = newReactions.filter(r => r !== type);
        newCounts[type] = Math.max(0, newCounts[type] - 1);
        
        await supabase.from('document_reactions').delete()
            .eq('document_id', document.id)
            .eq('user_id', user.id)
            .eq('reaction_type', type);
    } else {
        if (type === 'THUMBS_UP' && newReactions.includes('THUMBS_DOWN')) {
            newReactions = newReactions.filter(r => r !== 'THUMBS_DOWN');
            newCounts['THUMBS_DOWN'] = Math.max(0, newCounts['THUMBS_DOWN'] - 1);
            await supabase.from('document_reactions').delete()
                .eq('document_id', document.id).eq('user_id', user.id).eq('reaction_type', 'THUMBS_DOWN');
        }
        if (type === 'THUMBS_DOWN' && newReactions.includes('THUMBS_UP')) {
            newReactions = newReactions.filter(r => r !== 'THUMBS_UP');
            newCounts['THUMBS_UP'] = Math.max(0, newCounts['THUMBS_UP'] - 1);
            await supabase.from('document_reactions').delete()
                .eq('document_id', document.id).eq('user_id', user.id).eq('reaction_type', 'THUMBS_UP');
        }

        newReactions.push(type);
        newCounts[type]++;
        
        await supabase.from('document_reactions').insert({
            document_id: document.id,
            user_id: user.id,
            reaction_type: type
        });
    }

setUserReactions(newReactions);
    setReactionCounts(newCounts);

    //  NOVO: evento para atualizar favoritos no App.tsx
    if (type === 'HEART') {
      const isFavoriteNow = newReactions.includes('HEART');
      window.dispatchEvent(
        new CustomEvent('peta:favorite-changed', {
          detail: { docId: document.id, isFavorite: isFavoriteNow }
        })
      );
      onToggleFavorite?.(document.id);
    }
  };

  const handleExport = async (format: 'PDF' | 'MARKDOWN' | 'DOCX') => {
    setIsExporting(true);
    setIsExportMenuOpen(false);

    // Pequeno delay para a UI atualizar
    await new Promise(resolve => setTimeout(resolve, 500));

    // O objeto exportDoc é usado para passar o conteúdo "limpo" se necessário
    const exportDoc = {
      ...document,
      title: document.title,
      content: document.content
    };

    if (format === 'PDF') {
      generatePDF(exportDoc, user, systemSettings);
    } else if (format === 'DOCX') {
      generateDOCX(exportDoc, user, systemSettings);
    } else {
      generateMarkdown(exportDoc, user);
    }
    
    setIsExporting(false);
    toast.success(`Exportação ${format} iniciada.`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8" onClick={() => { if(isExportMenuOpen) setIsExportMenuOpen(false); }}>
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
        <span>Wiki</span>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">{document.categoryPath}</span>
      </nav>

      {/* Header Layout Refatorado */}
      <div className="flex flex-col gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        
        {/* Título e Status */}
        <div className="flex items-start justify-between gap-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight flex-1">
              {document.title}
            </h1>
            <div className="pt-2">
              <StatusBadge status={document.status} />
            </div>
        </div>

        {/* Metadados */}
        <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
               Atualizado {new Date(document.updatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
               <Eye size={14} className="mr-1" /> {liveViews.toLocaleString()} visualizações
            </span>
        </div>

        {/* Tags e Toolbar de Ações */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
                {document.tags.map(tag => (
                <span 
                    key={tag} 
                    onClick={() => onSearchTag && onSearchTag(tag)}
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-md"
                    title={`Buscar documentos com a tag: ${tag}`}
                >
                    #{tag}
                </span>
                ))}
            </div>

            {/* Botões Organizados em Linha */}
            <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                {canEdit && (
                    <>
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        setIsHistoryModalOpen(true);
                        await loadVersions();
                      }}
                      className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <History size={16} className="mr-2" /> Histórico
                    </Button>
                    <Button onClick={onEdit}>
                        <Edit2 size={16} className="mr-2" />
                        Editar
                    </Button>
                    </>
                )}

                <Button
                  variant="ghost"
                  onClick={() => onToggleFavorite?.(document.id)}
                  className={`px-3 ${
                    isFavorite
                      ? "text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                      : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
                >
                  <Bookmark size={20} className={isFavorite ? "fill-current" : ""} />
                </Button>
                
                <div className="relative">
                    <Button 
                    variant="secondary" 
                    className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsExportMenuOpen(!isExportMenuOpen);
                    }}
                    disabled={!canExport || isExporting}
                    title={!canExport ? "Permissão negada (Publicação necessária para Leitores)" : "Exportar Documento"}
                    >
                    <Download size={16} className="mr-2" />
                    {isExporting ? '...' : 'Exportar'}
                    </Button>

                    {isExportMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-100">
                        <div className="py-1">
                        <button 
                            onClick={() => handleExport('PDF')}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FileType size={16} className="mr-3 text-red-500" />
                            <span>Exportar PDF</span>
                        </button>
                        <button 
                            onClick={() => handleExport('DOCX')}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <FileText size={16} className="mr-3 text-blue-700" />
                            <span>Exportar Word (.doc)</span>
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                        <button 
                            onClick={() => handleExport('MARKDOWN')}
                            className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <File size={16} className="mr-3 text-gray-500" />
                            <span>Exportar Markdown</span>
                        </button>
                        </div>
                    </div>
                    )}
                </div>

                {canDelete && onDelete && (
                    <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-1 hidden md:block"></div>
                )}

                {canDelete && onDelete && (
                    <Button 
                        variant="ghost" 
                        onClick={onDelete} 
                        className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 px-3"
                        title="Mover para lixeira"
                    >
                        <Trash2 size={20} />
                    </Button>
                )}
            </div>
        </div>
      </div>

      <div className="w-full">
        <div 
          className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: document.content }}
        />
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Este artigo foi útil?</h3>
          <div className="flex flex-wrap gap-3">
            {/* THUMBS UP */}
            <button 
                onClick={() => handleToggleReaction('THUMBS_UP')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                    userReactions.includes('THUMBS_UP')
                    ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/40 dark:border-green-800 dark:text-green-300' 
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              <ThumbsUp size={18} className={userReactions.includes('THUMBS_UP') ? "fill-current" : ""} />
              <span>Sim</span>
              <span className="ml-1 text-xs opacity-70">({reactionCounts.THUMBS_UP})</span>
            </button>

             {/* THUMBS DOWN */}
            <button 
                onClick={() => handleToggleReaction('THUMBS_DOWN')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                    userReactions.includes('THUMBS_DOWN')
                    ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-800 dark:text-red-300' 
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
            >
              <ThumbsDown size={18} className={userReactions.includes('THUMBS_DOWN') ? "fill-current" : ""} />
              <span>Não</span>
              <span className="ml-1 text-xs opacity-70">({reactionCounts.THUMBS_DOWN})</span>
            </button>

            <div className="w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

            {/* HEART */}
            <button 
                onClick={() => handleToggleReaction('HEART')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                    userReactions.includes('HEART')
                    ? 'bg-pink-100 border-pink-300 text-pink-600 dark:bg-pink-900/40 dark:border-pink-800 dark:text-pink-300' 
                    : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                }`}
                title="Amei este artigo"
            >
              <Heart size={18} className={userReactions.includes('HEART') ? "fill-current" : ""} />
              <span className="ml-1 text-xs opacity-70">({reactionCounts.HEART})</span>
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)} title="Histórico de Versões">
        <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
                Abaixo estão as últimas 3 versões salvas deste documento. Restaurar uma versão criará um novo registro no histórico com o conteúdo atual.
            </p>
            
            {isLoadingVersions ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                Carregando versões...
              </div>
            ) : (versions.length === 0) ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                Nenhum histórico de versão disponível.
              </div>
            ) : (
              <div className="space-y-3">
                {versions.map((version, index) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white text-sm">
                          Versão {versions.length - index}
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                          {new Date(version.savedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Salvo por: {version.savedBy}
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                        Título: {version.title}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onRestoreVersion?.(version);
                        setIsHistoryModalOpen(false);
                      }}
                      title="Definir como padrão atual"
                    >
                      <RotateCcw size={14} className="mr-2" /> Restaurar
                    </Button>
                  </div>
                ))}
              </div>
            )}
        </div>
      </Modal>
    </div>
  );
};
