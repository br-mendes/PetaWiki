import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Category, User } from '../types';
import { generateSlug, isSlugUnique, getCategoryDepth } from '../lib/hierarchy';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId: string | null;
  categories: Category[]; // Flat list for validation
  user: User;
  onSave: (categoryData: Partial<Category>) => void;
}

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
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Initialize defaults
  useEffect(() => {
    if (isOpen) {
      setName('');
      setSlug('');
      setDescription('');
      setIcon('📁');
      setDepartmentId(user.role === 'ADMIN' ? 'Global' : user.department);
      setError(null);
    }
  }, [isOpen, user]);

  // Auto-generate slug
  useEffect(() => {
    setSlug(generateSlug(name));
  }, [name]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation 1: Min length
    if (name.length < 3) {
      setError("O nome deve ter pelo menos 3 caracteres.");
      return;
    }

    // Validation 2: Unique Slug
    if (!isSlugUnique(slug, parentId, categories)) {
      setError("Já existe uma categoria com este slug neste nível.");
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
      slug,
      description,
      icon,
      parentId,
      departmentId: user.role === 'ADMIN' && departmentId === 'Global' ? undefined : departmentId,
    });
    onClose();
  };

  const parentName = parentId 
    ? categories.find(c => c.id === parentId)?.name 
    : "Raiz (Nível Superior)";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Nova Categoria">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
          Criando subcategoria dentro de: <strong>{parentName}</strong>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
          <input
            type="text"
            required
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            placeholder="ex: Recursos Humanos"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug (Auto)</label>
            <input
              type="text"
              readOnly
              value={slug}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 font-mono text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ícone (Emoji)</label>
            <input
              type="text"
              maxLength={2}
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-center text-xl"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Breve descrição desta categoria..."
          />
        </div>

        {user.role === 'ADMIN' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Escopo de Departamento</label>
            <select
              value={departmentId}
              onChange={e => setDepartmentId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="Global">Global (Todos)</option>
              <option value="IT">TI</option>
              <option value="HR">RH</option>
              <option value="Sales">Vendas</option>
            </select>
          </div>
        )}

        {error && (
          <div className="text-red-600 text-sm bg-red-50 p-2 rounded">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Criar Categoria</Button>
        </div>
      </form>
    </Modal>
  );
};