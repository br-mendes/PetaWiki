
import React, { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, 
  List, ListOrdered, Link as LinkIcon, Image as ImageIcon, 
  Table as TableIcon, Heading1, Heading2, Type, 
  Undo, Redo, RemoveFormatting
} from 'lucide-react';
import { compressImage } from '../lib/image';
import { useToast } from './Toast';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState('3');
  const toast = useToast();

  // Sync initial value only once to prevent cursor jumping
  useEffect(() => {
    if (contentRef.current && contentRef.current.innerHTML !== value) {
      if (value === '' && contentRef.current.innerHTML === '<br>') return;
      contentRef.current.innerHTML = value;
    }
  }, []); 

  const handleInput = () => {
    if (contentRef.current) {
      onChange(contentRef.current.innerHTML);
    }
  };

  const exec = (command: string, value: string | undefined = undefined) => {
    // Fallback for deprecated execCommand - consider modernizing to a proper rich text library
    try {
      if (document.execCommand) {
        document.execCommand(command, false, value);
      }
    } catch (error) {
      console.warn('execCommand is deprecated and failed:', error);
      // Consider implementing modern alternatives
    }
    if (contentRef.current) {
      contentRef.current.focus();
    }
    handleInput();
  };

  const insertTable = () => {
    const rows = 3;
    const cols = 3;
    let html = '<table style="width:100%; border-collapse: collapse; margin: 10px 0;"><thead><tr>';
    for (let i = 0; i < cols; i++) html += '<th style="border: 1px solid #cbd5e1; padding: 8px; background-color: #f1f5f9;">Cabeçalho</th>';
    html += '</tr></thead><tbody>';
    for (let j = 0; j < rows; j++) {
      html += '<tr>';
      for (let k = 0; k < cols; k++) html += '<td style="border: 1px solid #cbd5e1; padding: 8px;">Célula</td>';
      html += '</tr>';
    }
    html += '</tbody></table><p><br/></p>';
    exec('insertHTML', html);
  };

  const insertLink = () => {
    // Save selection
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        toast.warning('Selecione um texto para criar um link.');
        return;
    }
    const range = selection.getRangeAt(0);

    const url = prompt('Digite a URL do link:', 'https://');
    
    // Restore selection
    selection.removeAllRanges();
    selection.addRange(range);

    if (url) {
        exec('createLink', url);
    }
  };

  const triggerImageUpload = () => {
    // Save selection position to insert image at cursor
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 1024, 0.7); // Compress: Max 1024px, 70% quality
        exec('insertImage', compressedBase64);
      } catch (error) {
        console.error("Erro ao processar imagem", error);
        toast.error("Erro ao processar imagem.");
      }
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFontSize = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value;
    setFontSize(size);
    exec('fontSize', size);
  };

  const handleColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    exec('foreColor', e.target.value);
  };

  const ToolbarButton = ({ icon: Icon, cmd, arg, title }: { icon: any, cmd?: string, arg?: string, title: string }) => (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); 
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
      
      {/* Hidden File Input for Images */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        
        <div className="flex gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <ToolbarButton icon={Undo} cmd="undo" title="Desfazer" />
          <ToolbarButton icon={Redo} cmd="redo" title="Refazer" />
        </div>

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

        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <label className="flex items-center justify-center p-1.5 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Cor do Texto">
            <Type size={18} className="text-gray-600 dark:text-gray-300" />
            <input type="color" className="w-0 h-0 opacity-0 absolute" onChange={handleColor} />
          </label>
        </div>

        <div className="flex gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <ToolbarButton icon={Heading1} cmd="formatBlock" arg="H1" title="Título 1" />
          <ToolbarButton icon={Heading2} cmd="formatBlock" arg="H2" title="Título 2" />
        </div>

        <div className="flex gap-0.5 border-r border-gray-300 dark:border-gray-600 pr-2 mr-1">
          <ToolbarButton icon={AlignLeft} cmd="justifyLeft" title="Alinhar à Esquerda" />
          <ToolbarButton icon={AlignCenter} cmd="justifyCenter" title="Centralizar" />
          <ToolbarButton icon={AlignRight} cmd="justifyRight" title="Alinhar à Direita" />
          <ToolbarButton icon={List} cmd="insertUnorderedList" title="Lista com Marcadores" />
          <ToolbarButton icon={ListOrdered} cmd="insertOrderedList" title="Lista Numérica" />
        </div>

        <div className="flex gap-0.5">
          <button onMouseDown={(e) => { e.preventDefault(); insertLink(); }} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Inserir Link">
             <LinkIcon size={18} />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); triggerImageUpload(); }} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Inserir Imagem (Upload)">
             <ImageIcon size={18} />
          </button>
          <button onMouseDown={(e) => { e.preventDefault(); insertTable(); }} className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Inserir Tabela">
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
