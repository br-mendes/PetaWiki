import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, 
  Table as TableIcon, Heading1, Heading2, Type, PaintBucket, 
  Undo, Redo, RemoveFormatting
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  value, 
  onChange, 
  className = '',
  placeholder = 'Comece a escrever...'
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState('3');

  // Sync initial value only once to prevent cursor jumping
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
      // Only update if significantly different (e.g. initial load)
      if (value === '' && contentRef.current.innerHTML === '<br>') return;
      contentRef.current.innerHTML = value;
    }
  }, []); // Run once on mount for initial content

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    if (contentRef.current) {
      contentRef.current.focus();
    }
  };

  const insertTable = () => {
    const rows = 3;
    const cols = 3;
    let html = '<table style="width:100%; border-collapse: collapse; margin: 10px 0;"><thead><tr>';
    
    for (let i = 0; i < cols; i++) {
      html += '<th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #f1f5f9;">Cabeçalho</th>';
    }
    html += '</tr></thead><tbody>';
    
    for (let j = 0; j < rows; j++) {
      html += '<tr>';
      for (let k = 0; k < cols; k++) {
        html += '<td style="border: 1px solid #cbd5e1; padding: 8px;">Célula</td>';
      }
      html += '</tr>';
    }
    html += '</tbody></table><p><br/></p>'; // Add break after table to allow continuing typing
    
    exec('insertHTML', html);
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Digite a URL do link:', 'https://');
    if (url) exec('createLink', url);
  };

  const insertImage = () => {
    const url = prompt('Digite a URL da imagem:', 'https://');
    if (url) exec('insertImage', url);
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    setFontSize(size);
    exec('fontSize', size);
  };

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec('foreColor', e.target.value);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    cmd, 
    arg, 
    title 
  }: { icon: any, cmd?: string, arg?: string, title: string }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // Prevent losing focus from editor
        if (cmd) exec(cmd, arg);
      }}
      className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
      title={title}
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className={`flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        
        {/* History */}
        <div className="flex gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <ToolbarButton icon={Undo} cmd="undo" title="Desfazer" />
          <ToolbarButton icon={Redo} cmd="redo" title="Refazer" />
        </div>

        {/* Text Style */}
        <div className="flex gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <select 
            value={fontSize} 
            onChange={handleFontSize}
            className="h-8 text-xs border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-1 focus:outline-none"
            title="Tamanho da Fonte"
          >
            <option value="1">Pequeno</option>
            <option value="3">Normal</option>
            <option value="5">Grande</option>
            <option value="7">Enorme</option>
          </select>
          <ToolbarButton icon={Bold} cmd="bold" title="Negrito" />
          <ToolbarButton icon={Italic} cmd="italic" title="Itálico" />
          <ToolbarButton icon={Underline} cmd="underline" title="Sublinhado" />
        </div>

        {/* Colors */}
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <label className="flex items-center justify-center p-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Cor do Texto">
            <Type size={18} className="text-gray-600 dark:text-gray-300" />
            <input 
              type="color" 
              className="w-0 h-0 opacity-0 absolute" 
              onChange={handleColor}
            />
          </label>
        </div>

        {/* Structure */}
        <div className="flex gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <ToolbarButton icon={Heading1} cmd="formatBlock" arg="H1" title="Título 1" />
          <ToolbarButton icon={Heading2} cmd="formatBlock" arg="H2" title="Título 2" />
        </div>

        {/* Lists & Align */}
        <div className="flex gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <ToolbarButton icon={AlignLeft} cmd="justifyLeft" title="Alinhar à Esquerda" />
          <ToolbarButton icon={AlignCenter} cmd="justifyCenter" title="Centralizar" />
          <ToolbarButton icon={AlignRight} cmd="justifyRight" title="Alinhar à Direita" />
          <ToolbarButton icon={List} cmd="insertUnorderedList" title="Lista com Marcadores" />
          <ToolbarButton icon={ListOrdered} cmd="insertOrderedList" title="Lista Numérica" />
        </div>

        {/* Inserts */}
        <div className="flex gap-0.5">
          <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Inserir Link">
             <LinkIcon size={18} />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); insertImage(); }} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Inserir Imagem">
             <ImageIcon size={18} />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Inserir Tabela Automática">
             <TableIcon size={18} />
          </button>
          <ToolbarButton icon={RemoveFormatting} cmd="removeFormat" title="Limpar Formatação" />
        </div>
      </div>

      {/* Editable Area */}
      <div 
        ref={contentRef}
        contentEditable
        onInput={handleInput}
        className="flex-1 p-6 overflow-y-auto outline-none min-h-[400px] editor-content text-gray-800 dark:text-gray-200"
        data-placeholder={placeholder}
      />
      
      <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-3 py-1 text-xs text-gray-400 flex justify-between">
        <span>Editor Rico (WYSIWYG)</span>
        <span>{value.length} caracteres</span>
      </div>
    </div>
  );
};