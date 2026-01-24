
import React, { useState, useRef, useEffect } from 'react';
import { Save, Sparkles, X, Type, Tag, Globe, ChevronDown, CheckCircle, AlertCircle, Copy, Plus, Folder, CornerDownRight, ArrowLeft } from 'lucide-react';
import { generateAiResponse } from '../lib/ai';
import { Document, User, Category, SupportedLanguage } from '../types';
import { Button } from './Button';
import { CategoryTreeSelect } from './CategoryTreeSelect';
import { TranslationModal } from './TranslationModal';
import { RichTextEditor } from './RichTextEditor';
import { useToast } from './Toast';
import { getCategoryPath } from '../lib/hierarchy';

interface DocumentEditorProps {
  document?: Document | null; // Null means new doc
  user: User;
  onSave: (doc: Partial<Document>) => void;
  onTranslate?: (langs: SupportedLanguage[]) => Promise<void>; // New prop
  onCancel: () => void;
  categories: Category[]; // Tree structure for selection
  allCategories: Category[]; // Flat list for path lookup
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
  allCategories,
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

  const categoryPath = categoryId ? getCategoryPath(categoryId, allCategories) : null;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header with Improved Button Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm sticky top-20 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {document ? 'Editar Documento' : 'Novo Documento'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              {document ? `Editando revisão de ${user.name}` : 'Criando novo artigo na base de conhecimento'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" onClick={onCancel} className="hidden md:flex text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            Cancelar
          </Button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

          {user.role === 'ADMIN' && onCreateTemplate && (
            <Button 
              variant="secondary" 
              onClick={() => onCreateTemplate({ title, content, tags })} 
              className="flex-1 md:flex-none justify-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
              title="Salvar estrutura como modelo reutilizável"
            >
              <Copy size={16} className="mr-2" />
              Salvar Template
            </Button>
          )}
          
          <Button 
            onClick={() => onSave({ title, content, categoryId, tags })} 
            className="flex-1 md:flex-none justify-center shadow-lg shadow-blue-500/20"
          >
            <Save size={16} className="mr-2" />
            Salvar & {user.role === 'ADMIN' ? 'Publicar' : 'Enviar'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible relative">
        {/* Toolbar de Ferramentas Auxiliares */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors border ${isGenerating ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 hover:border-purple-200'}`}
              onClick={handleAiSuggest}
              disabled={isGenerating}
              title="Usa Mistral 7B via Ollama para analisar o texto"
            >
              <Sparkles size={14} />
              {isGenerating ? 'Analisando...' : 'Revisão IA'}
            </button>
            
            {document && onTranslate && (
              <button 
                className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 hover:border-blue-200 transition-colors"
                onClick={() => setIsTranslationModalOpen(true)}
              >
                <Globe size={14} />
                Traduzir
              </button>
            )}
          </div>
          <div className="text-xs text-gray-400 font-mono hidden sm:block">
             {content.length} caracteres
          </div>
        </div>

        {aiSuggestion && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800 p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
            <Sparkles className="text-purple-600 dark:text-purple-400 mt-1 shrink-0" size={18} />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-purple-900 dark:text-purple-300">Sugestão IA (Mistral 7B)</h4>
              <p className="text-sm text-purple-800 dark:text-purple-200 mt-1 whitespace-pre-line leading-relaxed">{aiSuggestion}</p>
            </div>
            <button onClick={() => setAiSuggestion(null)} className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-6 space-y-8">
           
           {/* Seletor de Categoria Visual */}
           <div className="relative" ref={selectRef}>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                Localização (Categoria)
            </label>
            <button 
              className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all duration-200 text-left group ${showCategorySelect ? 'ring-2 ring-blue-500 border-blue-500 bg-white dark:bg-gray-800' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-white dark:hover:bg-gray-800 hover:border-gray-300'}`}
              onClick={() => setShowCategorySelect(!showCategorySelect)}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                 <div className={`p-2 rounded-md ${categoryId ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}`}>
                    <Folder size={20} />
                 </div>
                 <div className="flex flex-col overflow-hidden">
                    {categoryId ? (
                        <>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {categoryPath?.split(' > ').pop()}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 truncate">
                                <CornerDownRight size={10} className="inline" /> {categoryPath}
                            </span>
                        </>
                    ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400 italic">Selecione onde salvar este documento...</span>
                    )}
                 </div>
              </div>
              <ChevronDown size={18} className={`text-gray-400 transition-transform ${showCategorySelect ? 'rotate-180' : ''}`} />
            </button>
            
            {showCategorySelect && (
              <div className="absolute top-full left-0 right-0 mt-2 z-10 shadow-xl rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
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

          {/* Título */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Título do Artigo</label>
            <input 
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold bg-transparent border-b-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none py-2 placeholder-gray-300 dark:placeholder-gray-600 transition-colors"
              placeholder="Digite um título claro e descritivo..."
            />
          </div>

          {/* Editor Rico */}
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Conteúdo</label>
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/50 transition-shadow shadow-sm">
                <RichTextEditor 
                value={content}
                onChange={setContent}
                className="min-h-[500px] border-none" // Remove border from component to use container border
                />
            </div>
          </div>

          {/* Tags */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Tag size={14} /> Tags & Metadados
            </label>
            <div className="flex flex-col gap-3">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite uma tag e pressione Enter..."
                            className="w-full pl-3 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                        />
                        <button 
                            onClick={handleAddTag}
                            disabled={!tagInput.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleGenerateTags}
                        disabled={isGeneratingTags}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${isGeneratingTags ? 'bg-purple-50 text-purple-400 cursor-not-allowed border border-purple-100' : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 dark:bg-gray-800 dark:border-purple-900 dark:text-purple-400'}`}
                        title="Gerar tags automaticamente com IA"
                    >
                        {isGeneratingTags ? (
                            <span className="animate-pulse flex items-center gap-2"><Sparkles size={14} /> Gerando...</span>
                        ) : (
                            <>
                                <Sparkles size={14} /> Auto-Tag
                            </>
                        )}
                    </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                    {tags.length === 0 && (
                        <span className="text-gray-400 text-sm italic py-2">Nenhuma tag adicionada. Tags ajudam na busca do documento.</span>
                    )}
                    {tags.map(tag => (
                        <span key={tag} className="inline-flex items-center pl-2.5 pr-1 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                            {tag}
                            <button 
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1.5 p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full transition-colors"
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
