
import React, { useState, useRef, useEffect } from 'react';
import { Save, Sparkles, X, Type, Tag, Globe, ChevronDown, CheckCircle, AlertCircle, Copy, Plus } from 'lucide-react';
import { generateAiResponse } from '../lib/ai';
import { Document, User, Category, SupportedLanguage } from '../types';
import { Button } from './Button';
import { CategoryTreeSelect } from './CategoryTreeSelect';
import { TranslationModal } from './TranslationModal';
import { RichTextEditor } from './RichTextEditor';
import { useToast } from './Toast';

interface DocumentEditorProps {
  document?: Document | null; // Null means new doc
  user: User;
  onSave: (doc: Partial<Document>) => void;
  onTranslate?: (langs: SupportedLanguage[]) => Promise<void>; // New prop
  onCancel: () => void;
  categories: Category[]; // Tree structure for selection
  initialCategoryId?: string;
  initialContent?: string;
  initialTags?: string[];
  onCreateTemplate?: (doc: Partial<Document>) => void; // New prop for admin
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  document, 
  user, 
  onSave, 
  onTranslate, 
  onCancel, 
  categories,
  initialCategoryId,
  initialContent = '',
  initialTags = [],
  onCreateTemplate
}) => {
  const toast = useToast();
  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState(document?.content || initialContent);
  const [categoryId, setCategoryId] = useState(document?.categoryId || initialCategoryId || '');
  
  // Tag State
  const [tags, setTags] = useState<string[]>(document?.tags || initialTags || []);
  const [tagInput, setTagInput] = useState('');
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  
  // Translation State
  const [isTranslationModalOpen, setIsTranslationModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // UI State
  const [showCategorySelect, setShowCategorySelect] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);

  // Close select on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowCategorySelect(false);
      }
    }
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => window.document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    try {
      const plainText = content.replace(/<[^>]+>/g, '');
      
      // Prompt específico para Mistral ser direto
      const systemPrompt = "Você é um editor técnico sênior de uma wiki corporativa. Seu objetivo é melhorar a clareza e estrutura.";
      const userPrompt = `Analise o seguinte conteúdo e forneça 3 sugestões pontuais de melhoria em Português do Brasil.\n\nTítulo: ${title}\nConteúdo: ${plainText}`;

      const response = await generateAiResponse(systemPrompt, userPrompt);
      
      setAiSuggestion(response || "Nenhuma sugestão gerada.");
    } catch (error: any) {
      toast.error(error.message || "Falha ao gerar sugestões com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!content && !title) {
        toast.warning("Preencha o título ou conteúdo antes de gerar tags.");
        return;
    }

    setIsGeneratingTags(true);
    try {
        const plainText = content.replace(/<[^>]+>/g, '');
        
        // Mistral tende a ser verboso, então o prompt precisa ser muito restritivo
        const systemPrompt = "Você é uma API que gera tags JSON. Responda APENAS com as palavras-chave separadas por vírgula.";
        const userPrompt = `Gere 5 tags relevantes para este documento. Retorne APENAS as tags separadas por vírgula (ex: rh, onboarding, normas). Não use numeração.\n\nTítulo: ${title}\nConteúdo: ${plainText}`;

        const responseText = await generateAiResponse(systemPrompt, userPrompt, 0.3); // Temp baixa para precisão

        if (responseText) {
            // Limpeza extra para garantir que o Mistral não enviou texto introdutório
            const cleanText = responseText.replace(/Tags:|Aqui estão as tags:|Note que/gi, '');
            
            const newTags = cleanText
                .split(',')
                .map(t => t.trim().toLowerCase().replace('.', ''))
                .filter(t => t.length > 1 && !tags.includes(t))
                .slice(0, 8); // Limite de segurança
            
            if (newTags.length > 0) {
              setTags(prev => [...new Set([...prev, ...newTags])]);
              toast.success(`${newTags.length} tags geradas.`);
            } else {
              toast.warning("A IA não retornou tags válidas. Tente adicionar mais conteúdo.");
            }
        }
    } catch (e: any) {
        toast.error(e.message || "Erro ao conectar com a IA.");
    } finally {
        setIsGeneratingTags(false);
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
        setTags([...tags, trimmed]);
        setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
    }
  };

  const handleTranslationRequest = async (langs: SupportedLanguage[]) => {
    if (onTranslate) {
      setIsTranslating(true);
      await onTranslate(langs);
      setIsTranslating(false);
      setIsTranslationModalOpen(false);
      // Success toast handled by parent
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {document ? 'Editar Documento' : 'Novo Documento'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {document ? `Editando como ${user.name}` : 'Criar um novo artigo na base de conhecimento'}
          </p>
        </div>
        <div className="flex gap-2">
          {user.role === 'ADMIN' && onCreateTemplate && (
            <Button variant="secondary" onClick={() => onCreateTemplate({ title, content, tags })} className="dark:text-gray-300 dark:hover:bg-gray-700">
              <Copy size={16} className="mr-2" />
              Salvar como Template
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel} className="dark:text-gray-300 dark:hover:bg-gray-700">Cancelar</Button>
          <Button onClick={() => onSave({ title, content, categoryId, tags })}>
            <Save size={16} className="mr-2" />
            Salvar & {user.role === 'ADMIN' ? 'Publicar' : 'Solicitar Revisão'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible relative">
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900 flex items-center gap-2 flex-wrap">
          
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${isGenerating ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-white dark:bg-gray-800 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20'}`}
            onClick={handleAiSuggest}
            disabled={isGenerating}
            title="Usa Mistral 7B via Ollama"
          >
            <Sparkles size={16} />
            {isGenerating ? 'Pensando (Ollama)...' : 'Sugestão IA'}
          </button>
          
          {document && onTranslate && (
             <button 
               className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
               onClick={() => setIsTranslationModalOpen(true)}
             >
               <Globe size={16} />
               Traduzir
             </button>
          )}
        </div>

        {aiSuggestion && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800 p-4 flex items-start gap-3">
            <Sparkles className="text-purple-600 dark:text-purple-400 mt-1 shrink-0" size={18} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300">Sugestão IA (Mistral 7B)</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200 mt-1 whitespace-pre-line">{aiSuggestion}</p>
            </div>
            <button onClick={() => setAiSuggestion(null)} className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-6 space-y-6">
           <div className="relative" ref={selectRef}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Localização da Categoria</label>
            <div 
              className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between cursor-pointer bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              onClick={() => setShowCategorySelect(!showCategorySelect)}
            >
              <span className="text-gray-700 dark:text-gray-200 text-sm">
                {categoryId ? `ID da Categoria: ${categoryId}` : 'Selecione uma categoria...'} 
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
            
            {showCategorySelect && (
              <div className="absolute top-full left-0 right-0 mt-1 z-10">
                <CategoryTreeSelect 
                  categories={categories} 
                  selectedId={categoryId} 
                  onSelect={(id) => {
                    setCategoryId(id);
                    setShowCategorySelect(false);
                  }} 
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-semibold bg-transparent border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none py-2 placeholder-gray-300"
              placeholder="Digite o título do documento..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conteúdo do Artigo</label>
            <RichTextEditor 
              value={content}
              onChange={setContent}
              className="min-h-[500px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <Tag size={16} /> Tags & Palavras-chave
            </label>
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <input 
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Adicionar tag (Enter)"
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <Button variant="secondary" onClick={handleAddTag} disabled={!tagInput.trim()}>
                        <Plus size={16} />
                    </Button>
                    <button 
                        onClick={handleGenerateTags}
                        disabled={isGeneratingTags}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${isGeneratingTags ? 'bg-purple-100 text-purple-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-sm'}`}
                        title="Gerar tags com IA (Mistral 7B)"
                    >
                        {isGeneratingTags ? (
                            <span className="animate-pulse">Gerando...</span>
                        ) : (
                            <>
                                <Sparkles size={16} /> Auto-Tag
                            </>
                        )}
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                    {tags.length === 0 && (
                        <span className="text-gray-400 text-sm italic py-1">Nenhuma tag adicionada. Digite acima ou use a IA.</span>
                    )}
                    {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {tag}
                            <button 
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1.5 text-blue-600 dark:text-blue-300 hover:text-blue-900 dark:hover:text-white focus:outline-none"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      <TranslationModal 
        isOpen={isTranslationModalOpen}
        onClose={() => setIsTranslationModalOpen(false)}
        onTranslate={handleTranslationRequest}
        isTranslating={isTranslating}
      />
    </div>
  );
};
