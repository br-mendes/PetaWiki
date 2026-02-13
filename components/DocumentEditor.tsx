import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from './Button';
import { RichTextEditor } from './RichTextEditor';
import { Document, User } from '../types';
import { useToast } from './Toast';
import { TagInput } from './TagInput';


interface DocumentEditorProps {
  document?: Document | null;
  categoryId: string;
  currentUser: User;
  onSave: (doc: Partial<Document>) => void;
  onCancel: () => void;
  initialContent?: string;
  initialTags?: string[];
  templateId?: string;
}


export const DocumentEditor: React.FC<DocumentEditorProps> = ({
  document,
  categoryId,
  currentUser,
  onSave,
  onCancel,
  initialContent = '',
  initialTags = [],
  templateId
}) => {
  const toast = useToast();


  const [title, setTitle] = useState(document?.title || '');
  const [content, setContent] = useState(document?.content || initialContent || '');
  const [tags, setTags] = useState<string[]>(document?.tags || initialTags || []);


  // evita que atualização tardia do template apague texto digitado
  const seededRef = useRef(false);
  const lastSeedRef = useRef<string>('');


  const isEditing = !!document?.id;


  // quando abrir um doc existente (carregamento async), sincroniza estado
  useEffect(() => {
    if (!document) return;
    setTitle(document.title || '');
    setContent(document.content || '');
    setTags(document.tags || []);
    seededRef.current = true;
    lastSeedRef.current = document.content || '';
  }, [document?.id]);


  // quando criar novo doc e o template chegar depois, sem deixar editor vazio
  useEffect(() => {
    if (document) return;


    const seed = (initialContent || '').trim();
    if (!seed) return;


    if (!seededRef.current || content.trim() === '' || content === lastSeedRef.current) {
      setContent(initialContent);
      lastSeedRef.current = initialContent;
      seededRef.current = true;
    }
  }, [initialContent, document, content]);


  useEffect(() => {
    if (document) return;
    if (!initialTags?.length) return;


    // só aplica tags do template se ainda não tiver tags escolhidas
    if (!seededRef.current || tags.length === 0) {
      setTags(initialTags);
    }
  }, [initialTags, document, tags.length]);


  const canSave = useMemo(() => {
    return title.trim().length >= 3 && content.trim().length >= 5;
  }, [title, content]);


  const handleSave = () => {
    if (!canSave) {
      toast.error('Preencha um título e conteúdo válidos.');
      return;
    }


    const payload: Partial<Document> = {
      id: document?.id,
      title: title.trim(),
      content,
      tags,
      categoryId,
      templateId: templateId || document?.templateId,
      status: document?.status || 'DRAFT',
      authorId: document?.authorId || currentUser.id,
      updatedAt: new Date().toISOString(),
    };


    onSave(payload);
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-400 mb-1">Título</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-700 bg-gray-900 text-white"
            placeholder={isEditing ? 'Título do documento' : 'Digite o título...'}
          />
        </div>


        <div className="flex gap-2 self-end">
          <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
          <Button onClick={handleSave} disabled={!canSave}>
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </div>
      </div>


      <div>
        <label className="block text-xs text-gray-400 mb-1">Tags</label>
        <TagInput value={tags} onChange={setTags} placeholder="Ex.: governança, política..." />
      </div>


      <div>
        <label className="block text-xs text-gray-400 mb-2">Conteúdo</label>
        <RichTextEditor value={content} onChange={setContent} />
      </div>
    </div>
  );
};