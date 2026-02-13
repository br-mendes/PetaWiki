import React, { useMemo, useState } from 'react';
import { X } from 'lucide-react';


type TagInputProps = {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
};


/**
 * TagInput simples:
 * - Enter, vírgula ou Tab adiciona uma tag
 * - Clique no X remove
 * - Backspace com input vazio remove a última tag
 */
export const TagInput: React.FC<TagInputProps> = ({
  value,
  onChange,
  placeholder = 'Digite uma tag e pressione Enter...',
  disabled = false,
  className = '',
}) => {
  const [input, setInput] = useState('');


  const normalized = useMemo(() => {
    return (value || [])
      .map(t => (t || '').trim())
      .filter(Boolean);
  }, [value]);


  const addTag = (raw: string) => {
    const tag = (raw || '').trim();
    if (!tag) return;


    // evita duplicados (case-insensitive)
    const exists = normalized.some(t => t.toLowerCase() === tag.toLowerCase());
    if (exists) return;


    onChange([...normalized, tag]);
  };


  const removeTag = (tag: string) => {
    onChange(normalized.filter(t => t !== tag));
  };


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;


    const key = e.key;


    // remove última tag com backspace se input vazio
    if (key === 'Backspace' && input.trim() === '' && normalized.length > 0) {
      e.preventDefault();
      onChange(normalized.slice(0, -1));
      return;
    }


    // adiciona tag com Enter/Tab ou vírgula
    if (key === 'Enter' || key === 'Tab' || key === ',') {
      e.preventDefault();
      const parts = input.split(',').map(p => p.trim()).filter(Boolean);
      parts.forEach(addTag);
      setInput('');
    }
  };


  const handleBlur = () => {
    if (disabled) return;
    // ao sair, adiciona o que ficou digitado
    const parts = input.split(',').map(p => p.trim()).filter(Boolean);
    if (parts.length) {
      parts.forEach(addTag);
      setInput('');
    }
  };


  return (
    <div
      className={`w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-2 ${className}`}
    >
      <div className="flex flex-wrap gap-2 items-center">
        {normalized.map(tag => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100 text-xs"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-gray-500 hover:text-red-500"
                title="Remover tag"
              >
                <X size={14} />
              </button>
            )}
          </span>
        ))}


        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={normalized.length ? '' : placeholder}
          disabled={disabled}
          className="flex-1 min-w-[180px] bg-transparent outline-none text-sm text-gray-900 dark:text-white placeholder:text-gray-400 py-1"
        />
      </div>
    </div>
  );
};