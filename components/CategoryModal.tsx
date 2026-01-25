
import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Category, User } from '../types';
import { generateSlug, isSlugUnique, getCategoryDepth } from '../lib/hierarchy';
import { ChevronRight, Hash, Type, Folder } from 'lucide-react';
import { ICON_MAP, IconRenderer } from './IconRenderer';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
  categories: Category[]; // Flat list for validation
  user: User;
  onSave: (categoryData: Partial<Category>) => void;
}

// Obtém as chaves dos ícones disponíveis para sugestão
const SUGGESTED_ICONS = Object.keys(ICON_MAP);

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  parentId,
  categories,
  user,
  onSave
}) => {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isManualSlug, setIsManualSlug] = useState(false);
  const [description, setDescription] = useState('');
  // Padrão 'folder' (Lucide) em vez de emoji para manter consistência
  const [icon, setIcon] = useState('folder');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSlug('');
      setIsManualSlug(false);
      setDescription('');
      setIcon('folder');
      setDepartmentId(user.role === 'ADMIN' ? 'Global' : user.department);
      setError(null);
    }
  }, [isOpen, user]);

  // Auto-generate slug unless manually edited
  useEffect(() => {
    if (!isManualSlug) {
      setSlug(generateSlug(name));
    }
  }, [name, isManualSlug]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation 1: Min length
    if (name.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    // Validation 2: Unique Slug
    const finalSlug = generateSlug(slug || name);
    if (!isSlugUnique(finalSlug, parentId, categories)) {
      setError("Já existe uma categoria com este identificador (slug) neste nível.");
      return;
    }

    // Validation 3: Max Depth
    const depth = getCategoryDepth(parentId, categories);
    if (depth >= 5) {
      setError("Profundidade máxima de categoria (5) atingida.");
      return;
    }

    onSave({
      name,
      slug: finalSlug,
      description,
      icon, // Agora salva a string chave do ícone (ex: 'users')
      parentId,
      departmentId: user.role === 'ADMIN' && departmentId === 'Global' ? undefined : departmentId,
    });
    onClose();
  };

  const getParentPath = (pid: string | null): string[] => {
      const path = [];
      let current = categories.find(c => c.id === pid);
      let limit = 0;
      while (current && limit < 5) {
          path.unshift(current.name);
          current = categories.find(c => c.id === current?.parentId);
          limit++;
      }
      return path;
  };

  const parentPath = getParentPath(parentId);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={parentId ? "Nova Subcategoria" : "Nova Categoria Raiz"}>
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Visual Breadcrumb - Hierarquia */}
        <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 overflow-x-auto whitespace-nowrap">
            <span className="flex items-center gap-1 font-medium text-gray-500">
                <Folder size={14} /> Biblioteca
            </span>
            {parentPath.map((p, i) => (
                <React.Fragment key={i}>
                    <ChevronRight size={14} className="text-gray-400 shrink-0" />
                    <span className="font-medium text-blue-600 dark:text-blue-400">{p}</span>
                </React.Fragment>
            ))}
            <ChevronRight size={14} className="text-gray-400 shrink-0" />
            <span className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
               <IconRenderer iconName={icon} size={16} className="text-blue-600 dark:text-blue-400" /> {name || 'Nova Categoria'}
            </span>
        </div>

        <div className="grid grid-cols-[auto_1fr] gap-4 items-start">
            {/* Icon Preview Box */}
            <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500 uppercase">Ícone</label>
                <div className="relative group w-16 h-16 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm transition-colors hover:border-blue-400">
                    <IconRenderer iconName={icon} size={32} />
                    
                    {/* Input invisível caso o usuário queira colar um emoji manualmente, mas priorizamos a seleção */}
                    <input
                        type="text"
                        value={icon}
                        onChange={e => setIcon(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        title="Clique nos ícones abaixo para selecionar"
                    />
                </div>
            </div>

            {/* Name Input */}
            <div className="space-y-1">
                <label className="block text-xs font-medium text-gray-500 uppercase">Nome da Categoria</label>
                <div className="relative">
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-medium transition-shadow"
                        placeholder="Ex: Recursos Humanos"
                        autoFocus
                    />
                    <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
                
                {/* Advanced Slug Toggle */}
                <div className="flex items-center gap-2 mt-1.5">
                    <Hash size={12} className="text-gray-400" />
                    <input 
                        type="text" 
                        value={slug}
                        onChange={(e) => { setSlug(e.target.value); setIsManualSlug(true); }}
                        className="text-xs text-gray-500 dark:text-gray-400 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 focus:text-blue-600 outline-none w-full transition-colors font-mono"
                        placeholder="url-amigavel-automatica"
                        title="URL Amigável (Slug)"
                    />
                </div>
            </div>
        </div>

        {/* Lucide Icon Suggestions */}
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Estilo do Ícone</label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                {SUGGESTED_ICONS.map(ic => (
                    <button
                        key={ic}
                        type="button"
                        onClick={() => setIcon(ic)}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all ${
                            icon === ic 
                            ? 'bg-blue-100 border-blue-500 text-blue-600 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 shadow-sm scale-105' 
                            : 'bg-white border-gray-200 text-gray-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
                        }`}
                        title={ic}
                    >
                        <IconRenderer iconName={ic} size={18} />
                    </button>
                ))}
            </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase mb-1">Descrição (Opcional)</label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-shadow"
            placeholder="Para que serve esta categoria..."
          />
        </div>

        {/* Department Scope */}
        {user.role === 'ADMIN' && !parentId && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-100 dark:border-yellow-800">
            <label className="block text-xs font-bold text-yellow-800 dark:text-yellow-500 uppercase mb-2">Visibilidade</label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-yellow-200 dark:border-yellow-700 rounded-md focus:ring-2 focus:ring-yellow-500 outline-none bg-white dark:bg-gray-900 text-sm cursor-pointer"
            >
              <option value="Global">Global (Visível para todos)</option>
              <option value="Gestão">Restrito: Gestão</option>
              <option value="RH">Restrito: RH</option>
              <option value="TI">Restrito: TI</option>
              <option value="Vendas">Restrito: Vendas</option>
            </select>
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
                Categorias Globais são visíveis para toda a empresa. Categorias restritas aparecem apenas para usuários do departamento selecionado.
            </p>
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg flex items-center gap-2 border border-red-100 dark:border-red-800 animate-pulse">
            ⚠️ {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Criar Categoria</Button>
        </div>
      </form>
    </Modal>
  );
};
