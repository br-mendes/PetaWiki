
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { User, SystemSettings, Role, Category, Document, FooterColumn } from '../types';
import { Image, Save, UserCog, UserPlus, FolderTree, Upload, Trash2, Plus, CornerDownRight, ShieldCheck, X, Layout, Sidebar as SidebarIcon, PanelTop, RotateCcw, FileX, Columns } from 'lucide-react';
import { generateSlug } from '../lib/hierarchy';
import { sendWelcomeEmail } from '../lib/email';
import { useToast } from './Toast';
import { supabase } from '../lib/supabase';
import { useNotifications } from '../hooks/useNotifications';

interface AdminSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  actorUserId: string;
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  users: User[];
  onUpdateUserRole: (userId: string, newRole: Role) => void;
  onUpdateUserSuperAdmin: (userId: string, isSuperAdmin: boolean) => void;
  onDeleteUser: (userId: string) => void; // New prop
  onAddUser: (user: Partial<User>) => void;
  categories: Category[]; 
  onUpdateCategory: (id: string, data: Partial<Category>) => void;
  onDeleteCategory: (id: string) => void;
  onAddCategory: (data: Partial<Category>) => void;
  // Trash Management Props
  trashDocuments: Document[];
  onRestoreDocument: (doc: Document) => void;
  onPermanentDeleteDocument: (doc: Document) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  isOpen,
  onClose,
  actorUserId,
  settings,
  onSaveSettings,
  users,
  onUpdateUserRole,
  onUpdateUserSuperAdmin,
  onDeleteUser,
  onAddUser,
  categories,
  onUpdateCategory,
  onDeleteCategory,
  onAddCategory,
  trashDocuments,
  onRestoreDocument,
  onPermanentDeleteDocument
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'FOOTER' | 'SECURITY' | 'USERS' | 'CATEGORIES' | 'TRASH'>('BRANDING');

  const actorUser = useMemo(() => users.find(u => u.id === actorUserId) || null, [users, actorUserId]);
  const isActorSuperAdmin = !!actorUser?.isSuperAdmin;

  useEffect(() => {
    if (!isActorSuperAdmin && (activeTab === 'BRANDING' || activeTab === 'FOOTER' || activeTab === 'SECURITY')) {
      setActiveTab('USERS');
    }
  }, [isActorSuperAdmin, activeTab]);
  
  // Branding State
  const [appName, setAppName] = useState(settings.appName);
  const [logoCollapsedUrl, setLogoCollapsedUrl] = useState(settings.logoCollapsedUrl);
  const [logoExpandedUrl, setLogoExpandedUrl] = useState(settings.logoExpandedUrl);
  const [layoutMode, setLayoutMode] = useState<'SIDEBAR' | 'NAVBAR'>(settings.layoutMode || 'SIDEBAR');
  
  // Internal Home State
  const [homeTitle, setHomeTitle] = useState(settings.homeTitle || `Bem-vindo ao ${settings.appName}`);
  const [homeDescription, setHomeDescription] = useState(settings.homeDescription || 'Selecione uma categoria na barra lateral para navegar pela documentação.');

  // Public Landing State
  const [landingTitle, setLandingTitle] = useState(settings.landingTitle || settings.appName || 'Peta Wiki');
  const [landingDescription, setLandingDescription] = useState(settings.landingDescription || 'O hub central para o conhecimento corporativo.');

  // Security State
  const [allowedDomains, setAllowedDomains] = useState<string[]>(settings.allowedDomains || []);
  const [newDomain, setNewDomain] = useState('');

  // Footer State
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(settings.footerColumns || []);
  const [footerBottomText, setFooterBottomText] = useState(settings.footerBottomText || '');

  // User State
  const [newUser, setNewUser] = useState({ name: '', email: '', department: 'Geral', role: 'READER' as Role });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatParent, setNewCatParent] = useState('');

  const collapsedInputRef = useRef<HTMLInputElement>(null);
  const expandedInputRef = useRef<HTMLInputElement>(null);
  const catNameInputRef = useRef<HTMLInputElement>(null);

  const sortedCategories = useMemo(() => {
    const grouped = new Map<string | null, Category[]>();
    categories.forEach(c => {
      const pid = c.parentId || null;
      if (!grouped.has(pid)) grouped.set(pid, []);
      grouped.get(pid)!.push(c);
    });

    const result: { cat: Category, depth: number }[] = [];
    const traverse = (pid: string | null, depth: number) => {
      const children = grouped.get(pid) || [];
      children.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
      
      children.forEach(c => {
        result.push({ cat: c, depth });
        traverse(c.id, depth + 1);
      });
    };

    traverse(null, 0);
    return result;
  }, [categories]);

  const handleSaveSettings = () => {
    onSaveSettings({ 
        appName, 
        logoCollapsedUrl, 
        logoExpandedUrl,
        allowedDomains,
        layoutMode,
        homeTitle,
        homeDescription,
        landingTitle,
        landingDescription,
        footerColumns,
        footerBottomText
    });
    toast.success('Configurações do sistema atualizadas!');
  };

  const handleAddDomain = () => {
      const d = newDomain.trim().toLowerCase();
      if (d && !allowedDomains.includes(d)) {
          if (!d.includes('.')) {
              toast.error('Domínio inválido (ex: empresa.com.br)');
              return;
          }
          setAllowedDomains([...allowedDomains, d]);
          setNewDomain('');
      }
  };

  const handleRemoveDomain = (domain: string) => {
      setAllowedDomains(allowedDomains.filter(d => d !== domain));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newUser.name && newUser.email) {
      setIsSendingEmail(true);
      
      onAddUser(newUser);

      const emailResult = await sendWelcomeEmail(newUser, settings);
      
      setIsSendingEmail(false);
      setNewUser({ name: '', email: '', department: 'Geral', role: 'READER' });
      
      if (emailResult.success) {
        toast.success('Usuário adicionado e convite enviado!');
      } else {
        toast.warning(`Usuário criado, mas erro no e-mail: ${emailResult.message}`);
      }
    }
  };
  
  const handleAddCategoryClick = () => {
    if(!newCatName.trim()) return;
    
    const defaultIcon = newCatParent ? 'folder' : 'library';

    onAddCategory({
      name: newCatName,
      parentId: newCatParent || null,
      slug: generateSlug(newCatName),
      description: 'Nova categoria adicionada via admin',
      icon: defaultIcon
    });
    
    setNewCatName('');
    toast.success('Categoria incluída na estrutura.');
  };

  const prepareAddSubcategory = (parentId: string) => {
    setNewCatParent(parentId);
    if (catNameInputRef.current) {
      catNameInputRef.current.focus();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configurações de Admin" size="lg">
      <div className="flex flex-col md:flex-row gap-6 min-h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pr-0 md:pr-4 space-y-1 mb-4 md:mb-0 shrink-0">
          {isActorSuperAdmin && (
            <>
              <button
                onClick={() => setActiveTab('BRANDING')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'BRANDING' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
              >
                <Layout size={16} /> Layout & Home
              </button>

              <button
                onClick={() => setActiveTab('FOOTER')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'FOOTER' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
              >
                <Columns size={16} /> Rodapé
              </button>

              <button
                onClick={() => setActiveTab('SECURITY')}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'SECURITY' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
              >
                <ShieldCheck size={16} /> Segurança
              </button>
            </>
          )}
          <button
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'USERS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <UserCog size={16} /> Usuários
          </button>
          <button
            onClick={() => setActiveTab('CATEGORIES')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'CATEGORIES' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <FolderTree size={16} /> Categorias
          </button>
          <button
            onClick={() => setActiveTab('TRASH')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'TRASH' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <Trash2 size={16} /> Lixeira
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto max-h-[600px] pr-2">
          {activeTab === 'BRANDING' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Aparência & Layout</h3>
                
                {/* Layout Selector */}
                <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Estilo do Menu de Navegação</label>
                   <div className="grid grid-cols-2 gap-4">
                      <button 
                        onClick={() => setLayoutMode('SIDEBAR')}
                        className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${layoutMode === 'SIDEBAR' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                      >
                         <SidebarIcon size={24} className={layoutMode === 'SIDEBAR' ? 'text-blue-600' : 'text-gray-400'} />
                         <span className={`mt-2 text-sm font-medium ${layoutMode === 'SIDEBAR' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>Lateral (Sidebar)</span>
                      </button>

                      <button 
                        onClick={() => setLayoutMode('NAVBAR')}
                        className={`flex flex-col items-center p-3 border-2 rounded-lg transition-all ${layoutMode === 'NAVBAR' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                      >
                         <PanelTop size={24} className={layoutMode === 'NAVBAR' ? 'text-blue-600' : 'text-gray-400'} />
                         <span className={`mt-2 text-sm font-medium ${layoutMode === 'NAVBAR' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>Superior (Navbar)</span>
                      </button>
                   </div>
                   <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                     * Os controles de perfil, tema e admin acompanharão a posição do menu.
                   </p>
                </div>

                <div className="space-y-6">
                   <div>
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome da Aplicação</label>
                     <input 
                       type="text" 
                       value={appName}
                       onChange={(e) => setAppName(e.target.value)}
                       className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                       placeholder="Deixe vazio para usar apenas o logo expandido"
                     />
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {/* Collapsed Logo */}
                     <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Recolhido (1:1)</label>
                        <div className="flex flex-col items-center gap-3">
                          <img src={logoCollapsedUrl} className="w-16 h-16 object-contain bg-white rounded border" />
                          <input 
                            type="file" 
                            ref={collapsedInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setLogoCollapsedUrl)}
                          />
                          <Button size="sm" variant="secondary" onClick={() => collapsedInputRef.current?.click()}>
                            <Upload size={14} className="mr-2" /> Upload Ícone
                          </Button>
                        </div>
                     </div>

                     {/* Expanded Logo */}
                     <div className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Logo Expandido (16:9)</label>
                        <div className="flex flex-col items-center gap-3">
                          <img src={logoExpandedUrl} className="w-full h-16 object-contain bg-white rounded border" />
                          <input 
                            type="file" 
                            ref={expandedInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, setLogoExpandedUrl)}
                          />
                          <Button size="sm" variant="secondary" onClick={() => expandedInputRef.current?.click()}>
                            <Upload size={14} className="mr-2" /> Upload Banner
                          </Button>
                        </div>
                     </div>
                   </div>

                   <hr className="border-gray-200 dark:border-gray-700 my-4" />
                   
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personalização de Textos</h3>
                   
                   {/* Seção 1: Landing Page (Pública) */}
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                     <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">Página de Login (Pública)</h4>
                     <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título Principal (H1)</label>
                          <input 
                            type="text" 
                            value={landingTitle}
                            onChange={(e) => setLandingTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            placeholder="ex: Peta Wiki Corporativo"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição Hero</label>
                          <textarea
                            rows={2}
                            value={landingDescription}
                            onChange={(e) => setLandingDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                            placeholder="Texto descritivo para visitantes..."
                          />
                        </div>
                     </div>
                   </div>

                   {/* Seção 2: Dashboard (Privada) */}
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                     <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">Dashboard Interno (Privado)</h4>
                     <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título de Boas-Vindas</label>
                          <input 
                            type="text" 
                            value={homeTitle}
                            onChange={(e) => setHomeTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                            placeholder={`Bem-vindo ao ${appName}`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instrução Inicial</label>
                          <textarea
                            rows={2}
                            value={homeDescription}
                            onChange={(e) => setHomeDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                            placeholder="Instruções para o usuário logado..."
                          />
                        </div>
                     </div>
                   </div>

                   <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                     <Button onClick={handleSaveSettings}>
                        <Save size={16} className="mr-2" /> Salvar Alterações
                     </Button>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SECURITY' && (
              <div className="space-y-6">
                  {/* ... código existente da aba de segurança mantido ... */}
                   <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Auto-Cadastro (Self Sign-up)</h3>
                      <p className="text-sm text-gray-500 mb-4">
                          Defina quais domínios de e-mail têm permissão para criar contas automaticamente. 
                          Usuários criados desta forma terão o papel de <strong>LEITOR</strong>.
                      </p>

                      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex gap-2 mb-4">
                              <input 
                                type="text" 
                                placeholder="ex: parceiro.com.br"
                                value={newDomain}
                                onChange={(e) => setNewDomain(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                              />
                              <Button onClick={handleAddDomain}>Adicionar</Button>
                          </div>

                          <div className="space-y-2">
                              {allowedDomains.length === 0 && (
                                  <p className="text-sm text-red-500 italic">Nenhum domínio permitido. O auto-cadastro está efetivamente desabilitado.</p>
                              )}
                              {allowedDomains.map(domain => (
                                  <div key={domain} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-100 dark:border-gray-600">
                                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">@{domain}</span>
                                      <button onClick={() => handleRemoveDomain(domain)} className="text-red-500 hover:text-red-700 p-1">
                                          <X size={16} />
                                      </button>
                                  </div>
                              ))}
                          </div>
                      </div>

                      <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button onClick={handleSaveSettings}>
                            <Save size={16} className="mr-2" /> Salvar Regras de Segurança
                        </Button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'FOOTER' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Configurações do Rodapé</h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texto Inferior (Copyright)</label>
                  <textarea
                    rows={2}
                    value={footerBottomText}
                    onChange={(e) => setFooterBottomText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="© 2024 Empresa. Todos os direitos reservados."
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Colunas do Rodapé</h4>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => setFooterColumns([...footerColumns, { title: 'Nova Coluna', links: [] }])}
                    >
                      <Plus size={14} className="mr-1" /> Adicionar Coluna
                    </Button>
                  </div>

                  {footerColumns.length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma coluna configurada. Clique em "Adicionar Coluna" para criar.</p>
                  )}

                  <div className="space-y-4">
                    {footerColumns.map((column, colIndex) => (
                      <div key={colIndex} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-start mb-3">
                          <input
                            type="text"
                            value={column.title}
                            onChange={(e) => {
                              const updated = [...footerColumns];
                              updated[colIndex].title = e.target.value;
                              setFooterColumns(updated);
                            }}
                            className="px-2 py-1 text-sm font-medium border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Título da Coluna"
                          />
                          <button
                            onClick={() => setFooterColumns(footerColumns.filter((_, i) => i !== colIndex))}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="ml-4 space-y-2">
                          {column.links.map((link, linkIndex) => (
                            <div key={linkIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => {
                                  const updated = [...footerColumns];
                                  updated[colIndex].links[linkIndex].label = e.target.value;
                                  setFooterColumns(updated);
                                }}
                                className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Label"
                              />
                              <input
                                type="text"
                                value={link.url}
                                onChange={(e) => {
                                  const updated = [...footerColumns];
                                  updated[colIndex].links[linkIndex].url = e.target.value;
                                  setFooterColumns(updated);
                                }}
                                className="flex-1 px-2 py-1 text-sm border rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="URL"
                              />
                              <button
                                onClick={() => {
                                  const updated = [...footerColumns];
                                  updated[colIndex].links = updated[colIndex].links.filter((_, i) => i !== linkIndex);
                                  setFooterColumns(updated);
                                }}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const updated = [...footerColumns];
                              updated[colIndex].links = [...updated[colIndex].links, { label: '', url: '' }];
                              setFooterColumns(updated);
                            }}
                          >
                            <Plus size={12} className="mr-1" /> Adicionar Link
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button onClick={handleSaveSettings}>
                    <Save size={16} className="mr-2" /> Salvar Configurações do Rodapé
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'USERS' && (
            <div className="space-y-8">
               {/* Add User Section */}
               <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
                  <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <UserPlus size={16} /> Adicionar Novo Usuário
                  </h4>
                  <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Nome Completo" 
                      value={newUser.name}
                      onChange={e => setNewUser({...newUser, name: e.target.value})}
                      className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <input 
                      type="email" 
                      placeholder="E-mail (Login)" 
                      value={newUser.email}
                      onChange={e => setNewUser({...newUser, email: e.target.value})}
                      className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Departamento" 
                      value={newUser.department}
                      onChange={e => setNewUser({...newUser, department: e.target.value})}
                      className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    />
                    <select 
                       value={newUser.role}
                       onChange={e => setNewUser({...newUser, role: e.target.value as Role})}
                       className="px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="READER">Leitor</option>
                      <option value="EDITOR">Editor</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                    <div className="md:col-span-2 flex justify-end">
                      <Button type="submit" size="sm" disabled={isSendingEmail}>
                        {isSendingEmail ? 'Enviando convite...' : 'Adicionar Usuário & Enviar E-mail'}
                      </Button>
                    </div>
                  </form>
               </div>

               {/* User List */}
               <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gerenciar Permissões</h3>
                <div className="border rounded-lg overflow-hidden dark:border-gray-600">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usuário</th>
<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Função</th>
                         <th className="px-4 py-3 text-left text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase">Super Admin</th>
                         <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {users.map(u => (
                        <tr key={u.id}>
                          <td className="px-4 py-3 whitespace-nowrap flex items-center gap-2">
                            <img src={u.avatar} className="w-6 h-6 rounded-full object-cover" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">{u.email || u.username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                              u.role === 'EDITOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {u.role}
</span>
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap">
                             {isActorSuperAdmin ? (
                               <button
                                 onClick={() => onUpdateUserSuperAdmin(u.id, !u.isSuperAdmin)}
                                 className={`px-2 py-1 rounded text-[10px] border ${
                                   u.isSuperAdmin ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-700 text-white border-gray-600'
                                 }`}
                                 title="Alternar Super Admin"
                               >
                                 {u.isSuperAdmin ? 'Sim' : 'Não'}
                               </button>
                             ) : (
                               <span className="text-[10px] text-gray-400">{u.isSuperAdmin ? 'Sim' : 'Não'}</span>
                             )}
                           </td>
                           <td className="px-4 py-3 whitespace-nowrap text-right">
                             <div className="flex items-center justify-end gap-2">
                                 <select 
                                 value={u.role}
                                 onChange={(e) => onUpdateUserRole(u.id, e.target.value as Role)}
                                className="text-xs border-gray-300 dark:border-gray-600 rounded shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 bg-white dark:bg-gray-700 dark:text-white"
                                >
                                <option value="READER">Leitor</option>
                                <option value="EDITOR">Editor</option>
                                <option value="ADMIN">Admin</option>
                                </select>
                                <button 
                                  onClick={() => onDeleteUser(u.id)}
                                  className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                  title="Excluir Usuário"
                                >
                                  <Trash2 size={16} />
                                </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
               </div>
            </div>
          )}

          {activeTab === 'CATEGORIES' && (
             // ... código existente da aba de categorias mantido ...
             <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Estrutura de Categorias</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use o botão (+) para adicionar subcategorias rapidamente.</p>
              </div>

              {/* Form de Inclusão no Topo */}
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                <h4 className="text-sm font-bold text-blue-800 dark:text-blue-200 mb-2">
                  {newCatParent ? 'Adicionar Subcategoria' : 'Adicionar Nova Categoria Raiz'}
                </h4>
                <div className="flex gap-2 items-center">
                  <input 
                    ref={catNameInputRef}
                    type="text" 
                    placeholder="Nome da Categoria"
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategoryClick()}
                  />
                  <select
                     value={newCatParent}
                     onChange={(e) => setNewCatParent(e.target.value)}
                     className="flex-1 px-3 py-2 text-sm border rounded bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="">(Raiz)</option>
                    {sortedCategories.map(({cat, depth}) => (
                      <option key={cat.id} value={cat.id}>
                        {'- '.repeat(depth) + cat.name}
                      </option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAddCategoryClick}>
                    <Plus size={16} className="mr-1" /> Incluir
                  </Button>
                </div>
              </div>

              {/* Tabela de Categorias */}
              <div className="border rounded-lg overflow-hidden dark:border-gray-600 bg-white dark:bg-gray-800 max-h-96 overflow-y-auto">
                 <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400 w-1/2">Estrutura Hierárquica</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-500 dark:text-gray-400">Docs</th>
                        <th className="px-4 py-3 text-right font-medium text-gray-500 dark:text-gray-400">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedCategories.map(({ cat, depth }) => (
                        <tr key={cat.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              {/* Visual indent line */}
                              {depth > 0 && (
                                <div style={{ width: depth * 24 }} className="flex justify-end mr-2">
                                  <CornerDownRight size={14} className="text-gray-300" />
                                </div>
                              )}
                              <input 
                                type="text" 
                                value={cat.name}
                                onChange={(e) => onUpdateCategory(cat.id, { name: e.target.value })}
                                className="w-full bg-transparent border-b border-transparent focus:border-blue-500 outline-none text-gray-900 dark:text-white text-sm font-medium"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-2 text-gray-500 dark:text-gray-400">
                            {cat.docCount > 0 ? (
                              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">
                                {cat.docCount} docs
                              </span>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right whitespace-nowrap">
                             {/* Botão para adicionar subcategoria rapidamente */}
                             {depth < 4 && (
                               <button
                                 onClick={() => prepareAddSubcategory(cat.id)}
                                 className="text-blue-500 hover:text-blue-700 p-1 mr-2"
                                 title={`Adicionar subcategoria em ${cat.name}`}
                               >
                                 <Plus size={14} />
                               </button>
                             )}
                             <button 
                               onClick={() => onDeleteCategory(cat.id)}
                               className="text-red-500 hover:text-red-700 p-1"
                               title="Excluir"
                             >
                               <Trash2 size={14} />
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                 </table>
              </div>

              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                 <Button onClick={() => { toast.success('Todas as alterações foram salvas.'); onClose(); }}>
                    <Save size={16} className="mr-2" /> Salvar Alterações e Fechar
                 </Button>
              </div>
            </div>
          )}

          {activeTab === 'TRASH' && (
             <div className="space-y-6">
                <div>
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Lixeira de Artigos</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                     Documentos excluídos permanecem aqui até serem removidos permanentemente. 
                     Apenas administradores podem gerenciar esta área.
                   </p>
                </div>
                
                {trashDocuments.length === 0 ? (
                  <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-12 text-center text-gray-400">
                     <Trash2 size={48} className="mx-auto mb-4 opacity-20" />
                     <p>A lixeira está vazia.</p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden dark:border-gray-600 bg-white dark:bg-gray-800">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                       <thead className="bg-gray-50 dark:bg-gray-800">
                         <tr>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Documento</th>
                           <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Excluído Em</th>
                           <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Ações</th>
                         </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {trashDocuments.map(doc => (
                             <tr key={doc.id} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                                <td className="px-4 py-3">
                                   <div className="font-medium text-gray-900 dark:text-white">{doc.title}</div>
                                   <div className="text-xs text-gray-500">ID: {doc.id}</div>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                                   {doc.deletedAt ? new Date(doc.deletedAt).toLocaleString() : '-'}
                                </td>
                                <td className="px-4 py-3 text-right">
                                   <div className="flex justify-end gap-2">
                                      <button 
                                        onClick={() => onRestoreDocument(doc)}
                                        className="p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30 rounded"
                                        title="Restaurar Documento"
                                      >
                                         <RotateCcw size={16} />
                                      </button>
                                      <button 
                                        onClick={() => onPermanentDeleteDocument(doc)}
                                        className="p-1.5 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30 rounded"
                                        title="Excluir Permanentemente"
                                      >
                                         <FileX size={16} />
                                      </button>
                                   </div>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  </div>
                )}
             </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
