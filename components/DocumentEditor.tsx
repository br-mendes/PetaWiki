
import React, { useState, useRef, useEffect } from 'react';
import { Save, Sparkles, X, Tag, ChevronDown, Copy, Plus, Folder, CornerDownRight, ArrowLeft, SpellCheck, FileText, Wand2 } from 'lucide-react';
import { generateAiResponse } from '../lib/ai';
import { Document, User, Category } from '../types';
import { Button } from './Button';
import { CategoryTreeSelect } from './CategoryTreeSelect';
import { RichTextEditor } from './RichTextEditor';
import { useToast } from './Toast';
import { getCategoryPath } from '../lib/hierarchy';

interface DocumentEditorProps {
  document?: Document | null; // Null means new doc
  user: User;
  onSave: (doc: Partial<Document> & { saveAsTemplate?: boolean; templateName?: string }) => void;
  onCancel: () => void;
  categories: Category[]; // Tree structure for selection
  allCategories: Category[]; // Flat list for path lookup
  initialCategoryId?: string;
  initialContent?: string;
  initialTags?: string[];
  onChangeCategory?: (categoryId: string) => Promise<void> | void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ 
  document, 
  user, 
  onSave, 
  onCancel, 
  categories,
  allCategories,
  initialCategoryId,
  initialContent = '',
  initialTags = [],
  onChangeCategory
}) => {
  const toast = useToast();
  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState(document?.content || initialContent);
 const [categoryId, setCategoryId] = useState(document?.categoryId || initialCategoryId || '');

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  
  useEffect(() => setCategoryId(document?.categoryId || initialCategoryId || ''), [document?.categoryId, initialCategoryId]);
  
  // Tag State
  const [tags, setTags] = useState<string[]>(document?.tags || initialTags || []);
  const [tagInput, setTagInput] = useState('');
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<{ type: 'SUGGEST' | 'GRAMMAR' | 'SUMMARY', content: string } | null>(null);
  
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

  const handleAiAction = async (type: 'SUGGEST' | 'GRAMMAR' | 'SUMMARY') => {
    if (!content.trim()) {
        toast.warning("Escreva algum conteúdo antes de usar a IA.");
        return;
    }

    setIsGenerating(true);
    setAiResult(null);
    
    try {
      const plainText = content.replace(/<[^>]+>/g, ' ');
      let systemPrompt = '';
      let userPrompt = '';

      switch (type) {
        case 'SUGGEST':
            systemPrompt = "Você é um editor técnico sênior. Seu objetivo é melhorar a clareza e estrutura do texto.";
            userPrompt = `Analise o texto e forneça 3 sugestões pontuais de melhoria em estilo e coesão.\n\nTítulo: ${title}\nConteúdo: ${plainText}`;
            break;
        case 'GRAMMAR':
            systemPrompt = "Você é uma ferramenta de correção gramatical (similar ao LanguageTool). Foque estritamente em erros de ortografia, concordância nominal/verbal e pontuação.";
            userPrompt = `Liste os erros gramaticais encontrados no texto abaixo e sugira a correção para cada um. Se não houver erros, responda apenas 'Nenhum erro gramatical encontrado'.\n\nConteúdo: ${plainText}`;
            break;
        case 'SUMMARY':
            systemPrompt = "Você é uma ferramenta de sumarização (similar ao Sumy).";
            userPrompt = `Gere um resumo executivo conciso (máximo 3 linhas) do texto abaixo.\n\nConteúdo: ${plainText}`;
            break;
      }

      const response = await generateAiResponse(systemPrompt, userPrompt);
      setAiResult({ type, content: response || "Sem resposta da IA." });

    } catch (error: any) {
      toast.error(error.message || "Falha ao processar solicitação com IA.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!content && !title) {
        toast.warning("Preencha o título ou conteúdo antes de gerar tags.");
        return;
    }

    setIsGenerating(true);
    try {
        const plainText = content.replace(/<[^>]+>/g, ' ');
        
        const systemPrompt = "Você é uma ferramenta de extração de palavras-chave (similar ao Keybert). Responda APENAS com as tags separadas por vírgula.";
        const userPrompt = `Extraia as 5 tags/palavras-chave mais relevantes deste texto. Retorne APENAS as tags separadas por vírgula (ex: rh, segurança, normas). Não use numeração.\n\nTítulo: ${title}\nConteúdo: ${plainText}`;

        const responseText = await generateAiResponse(systemPrompt, userPrompt, 0.3); // Temp baixa para precisão

        if (responseText) {
            const cleanText = responseText.replace(/Tags:|Aqui estão as tags:|Note que/gi, '');
            const newTags = cleanText
                .split(',')
                .map(t => t.trim().toLowerCase().replace('.', ''))
                .filter(t => t.length > 1 && !tags.includes(t))
                .slice(0, 8);
            
            if (newTags.length > 0) {
              setTags(prev => [...new Set([...prev, ...newTags])]);
              toast.success(`${newTags.length} tags geradas.`);
            } else {
              toast.warning("A IA não retornou tags válidas.");
            }
        }
    } catch (e: any) {
        toast.error(e.message || "Erro ao conectar com a IA.");
    } finally {
        setIsGenerating(false);
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

  const categoryPath = categoryId ? getCategoryPath(categoryId, allCategories) : null;

  const isNew = !document;
  const isAdmin = user.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin || !isNew) return;
    if (!saveAsTemplate) return;
    if (!templateName.trim()) {
      setTemplateName((title || '').trim());
    }
  }, [isAdmin, isNew, saveAsTemplate, title]);

  const submit = (status?: Document['status']) => {
    const payload: Partial<Document> & { saveAsTemplate?: boolean; templateName?: string } = { title, content, categoryId, tags };
    if (status) payload.status = status;

    if (isAdmin && isNew && saveAsTemplate) {
      payload.saveAsTemplate = true;
      payload.templateName = templateName.trim() || title.trim();
    }

    onSave(payload);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header with Improved Button Layout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
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
          <Button
            variant="secondary"
            onClick={onCancel}
            className="hidden md:flex dark:bg-gray-700/60 dark:border-gray-600 dark:text-gray-100"
          >
            Cancelar
          </Button>
          
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

          {isAdmin && isNew && (
            <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              <label className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                />
                Salvar como modelo
              </label>
              {saveAsTemplate && (
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Nome do modelo"
                  className="ml-2 w-56 px-2 py-1 text-xs rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              )}
            </div>
          )}
          
          {isNew ? (
            <>
              {!isAdmin && (
                <Button
                  variant="secondary"
                  onClick={() => submit('DRAFT')}
                  className="flex-1 md:flex-none justify-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                  title="Salvar como rascunho"
                >
                  <Save size={16} className="mr-2" />
                  Salvar rascunho
                </Button>
              )}

              <Button
                onClick={() => submit(isAdmin ? 'PUBLISHED' : 'PENDING_REVIEW')}
                className="flex-1 md:flex-none justify-center shadow-lg shadow-blue-500/20"
                title={isAdmin ? 'Publicar documento' : 'Enviar para revisao/aprovacao'}
              >
                <Save size={16} className="mr-2" />
                {isAdmin ? 'Publicar' : 'Enviar para revisao'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="secondary"
                onClick={() => submit()}
                className="flex-1 md:flex-none justify-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                title="Salvar alteracoes"
              >
                <Save size={16} className="mr-2" />
                Salvar
              </Button>

              {isAdmin ? (
                <Button
                  onClick={() => submit('PUBLISHED')}
                  className="flex-1 md:flex-none justify-center shadow-lg shadow-blue-500/20"
                  title="Publicar (ou republicar)"
                >
                  <Save size={16} className="mr-2" />
                  Publicar
                </Button>
              ) : (
                <Button
                  onClick={() => submit('PENDING_REVIEW')}
                  className="flex-1 md:flex-none justify-center shadow-lg shadow-blue-500/20"
                  title="Enviar alteracoes para revisao/aprovacao"
                >
                  <Save size={16} className="mr-2" />
                  Enviar para revisao
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-visible relative">
        {/* Toolbar de Ferramentas IA */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
                <Wand2 size={12} /> Ferramentas IA
            </span>
            
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${aiResult?.type === 'GRAMMAR' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => handleAiAction('GRAMMAR')}
              disabled={isGenerating}
              title="Verificar concordância e pontuação (LanguageTool)"
            >
              <SpellCheck size={14} />
              Revisão Gramatical
            </button>

            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${aiResult?.type === 'SUMMARY' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => handleAiAction('SUMMARY')}
              disabled={isGenerating}
              title="Gerar resumo executivo (Sumy)"
            >
              <FileText size={14} />
              Resumir
            </button>

            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${aiResult?.type === 'SUGGEST' ? 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => handleAiAction('SUGGEST')}
              disabled={isGenerating}
              title="Sugestões de estilo e clareza"
            >
              <Sparkles size={14} />
              Melhorias
            </button>
          </div>
          
          <div className="text-xs text-gray-400 font-mono hidden sm:block shrink-0">
             {isGenerating ? <span className="animate-pulse text-blue-500">Processando...</span> : `${content.length} caracteres`}
          </div>
        </div>

        {/* AI Result Panel */}
        {aiResult && (
          <div className="bg-blue-50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-800 p-4 flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
            <div className="mt-1 shrink-0 p-2 bg-white dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                {aiResult.type === 'GRAMMAR' ? <SpellCheck size={18} /> : aiResult.type === 'SUMMARY' ? <FileText size={18} /> : <Sparkles size={18} />}
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200 mb-1">
                {aiResult.type === 'GRAMMAR' ? 'Análise Gramatical' : aiResult.type === 'SUMMARY' ? 'Resumo Gerado' : 'Sugestões de Estilo'}
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-300 whitespace-pre-line leading-relaxed">
                {aiResult.content}
              </div>
            </div>
            <button onClick={() => setAiResult(null)} className="text-blue-400 hover:text-blue-700 dark:hover:text-blue-200 transition-colors">
              <X size={16} />
            </button>
          </div>
        )}

        <div className="p-6 space-y-8">
           
            {/* Seletor de Pasta */}
            <div className="relative" ref={selectRef}>
             <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Pasta</label>
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
                    void onChangeCategory?.(id);
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

          {/* Modelo (mobile/tablet) */}
          {isAdmin && isNew && (
            <div className="lg:hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
              <label className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                />
                Salvar como modelo
              </label>
              {saveAsTemplate && (
                <div className="mt-3">
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                    Nome do modelo
                  </label>
                  <input
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Ex: Procedimento de Onboarding"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
          )}

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
                        disabled={isGenerating}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-sm ${isGenerating ? 'bg-purple-50 text-purple-400 cursor-not-allowed border border-purple-100' : 'bg-white border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 dark:bg-gray-800 dark:border-purple-900 dark:text-purple-400'}`}
                        title="Gerar tags automaticamente com IA (Keybert logic)"
                    >
                        {isGenerating ? (
                            <span className="animate-pulse flex items-center gap-2"><Sparkles size={14} /> Gerando...</span>
                        ) : (
                            <>
                                <Tag size={14} /> Auto-Tag
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
    </div>
  );
};
