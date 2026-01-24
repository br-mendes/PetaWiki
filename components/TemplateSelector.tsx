import React, { useState } from 'react';
import { 
  FileText, 
  BookOpen, 
  ClipboardList, 
  HelpCircle, 
  Calendar, 
  UserPlus, 
  Scale, 
  Search,
  Plus
} from 'lucide-react';
import { DocumentTemplate, TemplateCategory } from '../types';
import { Button } from './Button';

interface TemplateSelectorProps {
  templates: DocumentTemplate[];
  onSelect: (template: DocumentTemplate | null) => void;
  onCancel: () => void;
}

// Icon mapper
const getIcon = (name: string | undefined) => {
  switch (name) {
    case 'scale': return <Scale size={24} className="text-purple-600" />;
    case 'clipboard-list': return <ClipboardList size={24} className="text-blue-600" />;
    case 'help-circle': return <HelpCircle size={24} className="text-green-600" />;
    case 'calendar': return <Calendar size={24} className="text-orange-600" />;
    case 'user-plus': return <UserPlus size={24} className="text-pink-600" />;
    case 'book-open': return <BookOpen size={24} className="text-indigo-600" />;
    default: return <FileText size={24} className="text-gray-600" />;
  }
};

const CATEGORY_LABELS: Record<string, string> = {
  ALL: 'Todos os Templates',
  POLICY: 'Política',
  SOP: 'POP',
  FAQ: 'FAQ',
  MEETING_MINUTES: 'Atas de Reunião',
  KB_ARTICLE: 'Artigo de Conhecimento',
  ONBOARDING: 'Onboarding'
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates, onSelect, onCancel }) => {
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');

  const categories: (TemplateCategory | 'ALL')[] = ['ALL', 'POLICY', 'SOP', 'FAQ', 'MEETING_MINUTES', 'KB_ARTICLE', 'ONBOARDING'];

  const filteredTemplates = templates.filter(t => {
    const matchesCategory = filter === 'ALL' || t.category === filter;
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || 
                          t.description?.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Escolha um Modelo</h1>
          <p className="text-gray-500 mt-2">Comece com um documento em branco ou selecione um modelo pré-configurado.</p>
        </div>
        <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar modelos..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === cat 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blank Option */}
        <div 
          onClick={() => onSelect(null)}
          className="bg-white border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group h-64"
        >
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <Plus size={24} className="text-gray-600 group-hover:text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Documento em Branco</h3>
          <p className="text-sm text-gray-500 text-center mt-2">Comece do zero sem nenhuma estrutura pré-definida.</p>
        </div>

        {/* Template Cards */}
        {filteredTemplates.map(template => (
          <div 
            key={template.id}
            onClick={() => onSelect(template)}
            className="bg-white border border-gray-200 rounded-xl p-6 cursor-pointer hover:shadow-lg hover:border-blue-300 transition-all flex flex-col h-64 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
               {getIcon(template.icon)}
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                {getIcon(template.icon)}
              </div>
              <span className="text-[10px] font-bold px-2 py-1 bg-gray-100 text-gray-600 rounded uppercase tracking-wider">
                {CATEGORY_LABELS[template.category] || template.category}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{template.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-3 flex-1">{template.description}</p>
            
            <div className="flex items-center gap-2 mt-auto">
              <div className="flex gap-1 flex-wrap">
                {template.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">#{tag}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};