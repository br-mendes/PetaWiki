
import React, { useState } from 'react';
import { Edit2, Clock, Eye, Download, ThumbsUp, FileText, FileType, Globe, AlertTriangle, History, RotateCcw } from 'lucide-react';
import { Document, User, DocumentTranslation, SupportedLanguage, SystemSettings, DocumentVersion } from '../types';
import { Button } from './Button';
import { StatusBadge } from './Badge';
import { canExportDocument, generateMarkdown, generatePDF } from '../lib/export';
import { LANGUAGES } from '../lib/translate';
import { Modal } from './Modal';

interface DocumentViewProps {
  document: Document;
  translations?: DocumentTranslation[];
  user: User;
  onEdit: () => void;
  systemSettings: SystemSettings;
  onRestoreVersion?: (version: DocumentVersion) => void;
}

export const DocumentView: React.FC<DocumentViewProps> = ({ 
  document, 
  translations = [],
  user, 
  onEdit,
  systemSettings,
  onRestoreVersion
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string>('original'); // 'original' or language code
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  
  const canEdit = user.role === 'ADMIN' || (user.role === 'EDITOR' && document.authorId === user.id);
  const canExport = canExportDocument(user, document);

  // Determine content to show based on language selection
  const currentTranslation = selectedLang !== 'original' 
    ? translations.find(t => t.language === selectedLang) 
    : null;

  const displayTitle = currentTranslation ? currentTranslation.translatedTitle : document.title;
  const displayContent = currentTranslation ? currentTranslation.translatedContent : document.content;
  const isOutOfSync = currentTranslation?.status === 'OUT_OF_SYNC';

  const handleExport = async (format: 'PDF' | 'MARKDOWN') => {
    setIsExporting(true);
    setIsExportMenuOpen(false);

    // Simulate audit logging delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Export uses the currently displayed content (Original or Translation)
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
  };

  return (
    <div className="max-w-4xl mx-auto p-8" onClick={() => { if(isExportMenuOpen) setIsExportMenuOpen(false); }}>
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
        <span>Wiki</span>
        <span>/</span>
        <span className="text-gray-900 dark:text-gray-200 font-medium">{document.categoryPath}</span>
      </nav>

      {/* Header Re-organized */}
      <div className="flex items-start justify-between mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 pr-6">
          {/* Title Line */}
          <div className="flex items-center flex-wrap gap-3 mb-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {displayTitle}
            </h1>
            <div className="mt-1">
              <StatusBadge status={document.status} />
            </div>
          </div>

          {/* Meta Line (Date, Views, Lang) */}
          <div className="flex items-center flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1">
               Atualizado {new Date(document.updatedAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
               {document.views} visualizações
            </span>
            
            {/* Language Selector Inline */}
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

          {/* Tags Line */}
          <div className="flex flex-wrap items-center gap-2">
            {document.tags.map(tag => (
              <span key={tag} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors cursor-pointer bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded-md">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Actions Column */}
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

      {/* Sync Warning */}
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

      {/* Main Content */}
      <div className="w-full">
        <div 
          className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: displayContent }}
        />
        
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Você achou isso útil?</h3>
          <div className="flex gap-4">
            <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300">
              <ThumbsUp size={18} className="text-gray-500 dark:text-gray-400" />
              <span>Sim</span>
            </button>
          </div>
        </div>
      </div>

      {/* History Modal */}
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
