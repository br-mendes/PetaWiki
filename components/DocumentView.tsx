
import React, { useState, useEffect } from 'react';
import { Edit2, Clock, Eye, Download, ThumbsUp, ThumbsDown, Heart, FileText, FileType, Globe, AlertTriangle, History, RotateCcw, Trash2 } from 'lucide-react';
import { Document, User, DocumentTranslation, SupportedLanguage, SystemSettings, DocumentVersion } from '../types';
import { Button } from './Button';
import { StatusBadge } from './Badge';
import { canExportDocument, generateMarkdown, generatePDF } from '../lib/export';
import { LANGUAGES } from '../lib/translate';
import { Modal } from './Modal';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';

interface DocumentViewProps {
  document: Document;
  translations?: DocumentTranslation[];
  user: User;
  onEdit: () => void;
  onDelete?: () => void; // New Prop
  systemSettings: SystemSettings;
  onRestoreVersion?: (version: DocumentVersion) => void;
}

type ReactionType = 'THUMBS_UP' | 'THUMBS_DOWN' | 'HEART';

export const DocumentView: React.FC<DocumentViewProps> = ({ 
  document, 
  translations = [],
  user, 
  onEdit,
  onDelete,
  systemSettings,
  onRestoreVersion
}) => {
  const toast = useToast();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('original');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

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

  const currentTranslation = selectedLang !== 'original' 
    ? translations.find(t => t.language === selectedLang) 
    : null;

  const displayTitle = currentTranslation ? currentTranslation.translatedTitle : document.title;
  const displayContent = currentTranslation ? currentTranslation.translatedContent : document.content;
  const isOutOfSync = currentTranslation?.status === 'OUT_OF_SYNC';

  // --- Feedback Logic ---

  useEffect(() => {
    fetchReactions();
  }, [document.id, user.id]);

  const fetchReactions = async () => {
    try {
        // 1. Fetch user's current reactions
        const { data: userData } = await supabase
            .from('document_reactions')
            .select('reaction_type')
            .eq('document_id', document.id)
            .eq('user_id', user.id);
        
        if (userData) {
            setUserReactions(userData.map((r: any) => r.reaction_type));
        }

        // 2. Fetch total counts
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
    // Optimistic Update Setup
    const oldReactions = [...userReactions];
    const oldCounts = { ...reactionCounts };
    let newReactions = [...userReactions];
    let newCounts = { ...reactionCounts };

    // Logic: 
    // - Heart is independent.
    // - Up/Down are mutually exclusive.

    const isActive = newReactions.includes(type);

    if (isActive) {
        // Remove reaction
        newReactions = newReactions.filter(r => r !== type);
        newCounts[type] = Math.max(0, newCounts[type] - 1);
        
        // DB Call: Delete
        await supabase.from('document_reactions').delete()
            .eq('document_id', document.id)
            .eq('user_id', user.id)
            .eq('reaction_type', type);
    } else {
        // Add reaction
        
        // If adding UP or DOWN, remove the opposite if it exists
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
        
        // DB Call: Insert
        await supabase.from('document_reactions').insert({
            document_id: document.id,
            user_id: user.id,
            reaction_type: type
        });
    }

    // Apply Optimistic State
    setUserReactions(newReactions);
    setReactionCounts(newCounts);
  };


  const handleExport = async (format: 'PDF' | 'MARKDOWN') => {
    setIsExporting(true);
    setIsExportMenuOpen(false);

    await new Promise(resolve => setTimeout(resolve, 800));

    const exportDoc = {
      ...document,
      title: displayTitle,
      content: displayContent
    };

    if (format === 'PDF') {
      generatePDF(exportDoc, user, systemSettings);
    } else {
      generateMarkdown(exportDoc, user);
    }
    
    setIsExporting(false);
    toast.success(`Exportação ${format} concluída.`);
  };

  return (
    <div className="max-w-4xl mx-auto p-8" onClick={() => { if(isExportMenuOpen) setIsExportMenuOpen(false); }}>
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
        <span>Wiki</span>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">{document.categoryPath}</span>
      </nav>

      <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 pr-6">
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {displayTitle}
            </h1>
            <div className="mt-1">
              <StatusBadge status={document.status} />
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1">
               Atualizado {new Date(document.updatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
               {document.views} visualizações
            </span>
            
            <div className="relative inline-flex items-center">
              <Globe size={14} className="mr-1.5 text-gray-400" />
              <select 
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="bg-transparent border-none p-0 pr-4 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-0 cursor-pointer appearance-none hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                style={{ backgroundImage: 'none' }}
              >
                <option value="original">Original (PT-BR)</option>
                {translations.map(t => {
                   const langInfo = LANGUAGES.find(l => l.code === t.language);
                   return (
                     <option key={t.id} value={t.language}>
                       {langInfo?.name} {t.status === 'OUT_OF_SYNC' ? '(Antigo)' : ''}
                     </option>
                   );
                })}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {document.tags.map(tag => (
              <span key={tag} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 shrink-0">
          <div className="flex gap-2 justify-end">
            {canEdit && (
                <>
                <Button variant="secondary" onClick={() => setIsHistoryModalOpen(true)} className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">
                    <History size={16} className="mr-2" /> Histórico
                </Button>
                <Button onClick={onEdit}>
                    <Edit2 size={16} className="mr-2" />
                    Editar
                </Button>
                </>
            )}
             {canDelete && onDelete && (
                <Button variant="danger" onClick={onDelete} className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40">
                    <Trash2 size={16} />
                </Button>
            )}
          </div>
          
          <div className="relative flex justify-end">
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full md:w-auto dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
              onClick={(e) => {
                e.stopPropagation();
                setIsExportMenuOpen(!isExportMenuOpen);
              }}
              disabled={!canExport || isExporting}
              title={!canExport ? "Permissão negada (Publicação necessária para Leitores)" : "Exportar Documento"}
            >
              <Download size={16} className="mr-2" />
              {isExporting ? 'Gerando...' : 'Exportar'}
            </Button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-100">
                <div className="py-1">
                  <button 
                    onClick={() => handleExport('PDF')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileType size={16} className="mr-2 text-red-500" />
                    Exportar PDF
                  </button>
                  <button 
                    onClick={() => handleExport('MARKDOWN')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <FileText size={16} className="mr-2 text-blue-500" />
                    Exportar Markdown
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {isOutOfSync && (
        <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700/50 rounded-lg flex items-start gap-3">
          <AlertTriangle className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-bold text-yellow-800 dark:text-yellow-400">Tradução Desatualizada</h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              O documento original foi atualizado desde que esta tradução foi gerada. 
              {canEdit ? ' Por favor, solicite uma nova tradução.' : ' Algumas informações podem estar desatualizadas.'}
            </p>
          </div>
        </div>
      )}

      <div className="w-full">
        <div 
          className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: displayContent }}
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
            
            {(!document.versions || document.versions.length === 0) ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    Nenhum histórico de versão disponível.
                </div>
            ) : (
                <div className="space-y-3">
                    {document.versions.map((version, index) => (
                        <div key={version.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">Versão {document.versions.length - index}</span>
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
                                    if(onRestoreVersion) {
                                        onRestoreVersion(version);
                                        setIsHistoryModalOpen(false);
                                    }
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
