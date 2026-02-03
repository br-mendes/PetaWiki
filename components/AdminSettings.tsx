
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { User, SystemSettings, Role, Category, Document, FooterColumn, LandingFeature, HeroTag } from '../types';
import { Image, Save, UserCog, UserPlus, FolderTree, Upload, Trash2, Plus, CornerDownRight, ShieldCheck, X, Layout, Sidebar as SidebarIcon, PanelTop, RotateCcw, FileX, Edit, Link, ExternalLink, Columns, Star, Zap, Globe, Lock, BookOpen, Users, Search, ToggleLeft, ToggleRight, LayoutTemplate, Palette, Tag, Grid } from 'lucide-react';
import { generateSlug } from '../lib/hierarchy';
import { sendWelcomeEmail } from '../lib/email';
import { useToast } from './Toast';
import { compressImage } from '../lib/image';
import { DEFAULT_SYSTEM_SETTINGS } from '../constants';
import { RichTextEditor } from './RichTextEditor';
import { ICON_MAP, IconRenderer } from './IconRenderer';
import { supabase } from '../lib/supabase';

interface AdminSettingsProps {
  mode?: 'modal' | 'page';
  isOpen: boolean;
  onClose: () => void;
  actorUserId: string;
  onOpenReviewCenter?: (docId: string) => void;
  settings: SystemSettings;
  onSaveSettings: (settings: SystemSettings) => void;
  users: User[];
  onUpdateUserRole: (userId: string, newRole: Role) => void;
  onUpdateUserDetails: (userId: string, data: Partial<User>) => void; // Updated signature
  onDeleteUser: (userId: string) => void; 
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

const GRADIENT_OPTIONS = [
    { name: 'Oceano (Padrão)', class: 'bg-gradient-to-r from-blue-700 to-blue-900' },
    { name: 'Esmeralda', class: 'bg-gradient-to-r from-emerald-700 to-emerald-900' },
    { name: 'Roxo Real', class: 'bg-gradient-to-r from-violet-700 to-violet-900' },
    { name: 'Grafite', class: 'bg-gradient-to-r from-slate-700 to-slate-900' },
    { name: 'Laranja Solar', class: 'bg-gradient-to-r from-orange-600 to-red-800' },
    { name: 'Tech Índigo', class: 'bg-gradient-to-r from-indigo-700 to-cyan-700' },
    { name: 'Rosa Vibrante', class: 'bg-gradient-to-r from-pink-700 to-rose-900' },
];

const AVAILABLE_ICONS = Object.keys(ICON_MAP).sort();

export const AdminSettings: React.FC<AdminSettingsProps> = ({
  mode = 'modal',
  isOpen,
  onClose,
  actorUserId,
  onOpenReviewCenter,
  settings,
  onSaveSettings,
  users,
  onUpdateUserRole,
  onUpdateUserDetails,
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
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'FOOTER' | 'SECURITY' | 'USERS' | 'APPROVAL' | 'CATEGORIES' | 'TRASH'>('BRANDING');

  const [pendingDocs, setPendingDocs] = useState<any[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);

  const loadPending = async () => {
    setIsLoadingPending(true);
    try {
      const { data, error } = await supabase.rpc("list_pending_documents");
      if (error) throw error;
      setPendingDocs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const updateDocStatus = async (id: string, status: "PUBLISHED" | "REJECTED") => {
    const { error } = await supabase.rpc("set_document_status", {
      p_document_id: id,
      p_status: status,
      p_actor_user_id: actorUserId,
    });

    if (!error) return;

    // Fallback for environments without RPCs
    const { error: fallbackError } = await supabase
      .from("documents")
      .update({
        status,
        updated_by: actorUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (fallbackError) {
      console.error(fallbackError);
      throw fallbackError;
    }
  };

  const approveDoc = async (id: string) => {
    try {
      await updateDocStatus(id, "PUBLISHED");
      setPendingDocs(prev => prev.filter(d => d.id !== id));
      toast.success("Documento aprovado.");
    } catch (error: any) {
      console.error(error);
      toast.error(`Falha ao aprovar: ${error?.message || "erro"}`);
    }
  };

  const rejectDoc = async (id: string) => {
    try {
      await updateDocStatus(id, "REJECTED");
      setPendingDocs(prev => prev.filter(d => d.id !== id));
      toast.success("Documento rejeitado.");
    } catch (error: any) {
      console.error(error);
      toast.error(`Falha ao rejeitar: ${error?.message || "erro"}`);
    }
  };
  
  // Branding State
  const [appName, setAppName] = useState(settings.appName);
  const [logoCollapsedUrl, setLogoCollapsedUrl] = useState(settings.logoCollapsedUrl);
  const [logoExpandedUrl, setLogoExpandedUrl] = useState(settings.logoExpandedUrl);
  const [layoutMode, setLayoutMode] = useState<'SIDEBAR' | 'NAVBAR'>(settings.layoutMode || 'SIDEBAR');
  
  // Internal Home State
  const [homeTitle, setHomeTitle] = useState(settings.homeTitle || `Bem-vindo ao ${settings.appName}`);
  const [homeDescription, setHomeDescription] = useState(settings.homeDescription || 'Selecione uma categoria na barra lateral para navegar pela documentação.');
  const [showWelcomeCard, setShowWelcomeCard] = useState<boolean>(settings.showWelcomeCard !== false);
  const [homeContent, setHomeContent] = useState<string>(settings.homeContent || '');

  // Public Landing State
  const [landingTitle, setLandingTitle] = useState(settings.landingTitle || settings.appName || 'Peta Wiki');
  const [landingDescription, setLandingDescription] = useState(settings.landingDescription || 'O hub central para o conhecimento corporativo.');
  const [landingGradient, setLandingGradient] = useState(settings.landingGradient || 'bg-gradient-to-r from-blue-700 to-blue-900');
  const [heroTags, setHeroTags] = useState<HeroTag[]>(settings.heroTags || DEFAULT_SYSTEM_SETTINGS.heroTags || []);
  const [landingFeatures, setLandingFeatures] = useState<LandingFeature[]>(settings.landingFeatures || DEFAULT_SYSTEM_SETTINGS.landingFeatures || []);

  // Footer State
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>(settings.footerColumns || DEFAULT_SYSTEM_SETTINGS.footerColumns || []);
  const [footerBottomText, setFooterBottomText] = useState(settings.footerBottomText || DEFAULT_SYSTEM_SETTINGS.footerBottomText || '');

  // Security State
  const [allowedDomains, setAllowedDomains] = useState<string[]>(settings.allowedDomains || []);
  const [newDomain, setNewDomain] = useState('');

  // User State
  const [newUser, setNewUser] = useState({ name: '', email: '', department: 'Geral', role: 'READER' as Role });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  
  // User Editing State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

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

  useEffect(() => {
    if (!isOpen) return;
    loadPending();
  }, [isOpen]);

  // Close icon dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.icon-dropdown-container')) {
        document.querySelectorAll('.icon-dropdown-menu').forEach(el => {
          el.classList.add('hidden');
        });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handlers for Hero Tags
  const handleUpdateHeroTag = (index: number, field: keyof HeroTag, value: string) => {
    const newTags = [...heroTags];
    newTags[index] = { ...newTags[index], [field]: value };
    setHeroTags(newTags);
  };

  const handleAddHeroTag = () => {
    setHeroTags([...heroTags, { icon: 'star', text: 'Novo Destaque' }]);
  };

  const handleRemoveHeroTag = (index: number) => {
    setHeroTags(heroTags.filter((_, i) => i !== index));
  };

  // Handlers for Landing Features
  const handleUpdateFeature = (index: number, field: keyof LandingFeature, value: string) => {
    const newFeatures = [...landingFeatures];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setLandingFeatures(newFeatures);
  };

  const handleAddFeature = () => {
    setLandingFeatures([...landingFeatures, { icon: 'book', title: 'Novo Recurso', description: 'Descrição curta do recurso.' }]);
  };

  const handleRemoveFeature = (index: number) => {
    setLandingFeatures(landingFeatures.filter((_, i) => i !== index));
  };

  const handleSaveSettings = () => {
    onSaveSettings({ 
        appName, 
        logoCollapsedUrl, 
        logoExpandedUrl,
        allowedDomains,
        layoutMode,
        homeTitle,
        homeDescription,
        showWelcomeCard,
        homeContent,
        landingTitle,
        landingDescription,
        landingGradient,
        heroTags,
        landingFeatures,
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

  const startEditingUser = (user: User) => {
      setEditingUser(user);
      setEditName(user.name);
      setEditEmail(user.email);
      setEditDepartment(user.department || '');
  };

  const saveEditedUser = () => {
      if (editingUser && editName && editEmail) {
          onUpdateUserDetails(editingUser.id, { 
             name: editName, 
             email: editEmail,
             department: editDepartment
          });
          setEditingUser(null);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (s: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedBase64 = await compressImage(file, 800, 0.8);
        setter(compressedBase64);
        toast.success('Imagem processada com sucesso.');
      } catch (e) {
        toast.error('Erro ao processar imagem.');
      }
    }
  };

  // Footer Handlers
  const handleUpdateColumnTitle = (colIndex: number, newTitle: string) => {
    const newCols = [...footerColumns];
    newCols[colIndex].title = newTitle;
    setFooterColumns(newCols);
  };

  const handleAddLink = (colIndex: number) => {
    const newCols = [...footerColumns];
    newCols[colIndex].links.push({ label: 'Novo Link', url: 'https://' });
    setFooterColumns(newCols);
  };

  const handleRemoveLink = (colIndex: number, linkIndex: number) => {
    const newCols = [...footerColumns];
    newCols[colIndex].links.splice(linkIndex, 1);
    setFooterColumns(newCols);
  };

  const handleUpdateLink = (colIndex: number, linkIndex: number, field: 'label'|'url', value: string) => {
    const newCols = [...footerColumns];
    newCols[colIndex].links[linkIndex][field] = value;
    setFooterColumns(newCols);
  };

  const body = (
      <div className="flex flex-col md:flex-row gap-6 h-full overflow-hidden">
        {/* Sidebar */}
        <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700 pr-0 md:pr-4 space-y-1 mb-4 md:mb-0 shrink-0 md:overflow-y-auto">
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
          <button
            onClick={() => setActiveTab('USERS')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'USERS' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <UserCog size={16} /> Usuários
          </button>
          <button
            onClick={() => setActiveTab('APPROVAL')}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'APPROVAL' ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'}`}
          >
            <ShieldCheck size={16} /> Aprovação
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
        <div className="flex-1 pr-2">
          {activeTab === 'BRANDING' && (
            <div className="space-y-6">
              {/* Branding Content */}
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
                   
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personalização de Textos & Dashboard</h3>
                   
                   {/* Seção 2: Dashboard (Privada) */}
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                     <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <LayoutTemplate size={16} /> Dashboard Interno (Privado)
                     </h4>
                     
                     <div className="space-y-4">
                        {/* Toggle Card Welcome */}
                        <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white text-sm">Exibir Card de Boas-vindas</span>
                                <span className="text-xs text-gray-500">Mostra o logo e mensagem centralizada no topo da home.</span>
                            </div>
                            <button 
                                onClick={() => setShowWelcomeCard(!showWelcomeCard)}
                                className={`p-1 rounded-full transition-colors ${showWelcomeCard ? 'text-green-500 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 bg-gray-100 dark:bg-gray-800'}`}
                            >
                                {showWelcomeCard ? <ToggleRight size={32} className="fill-current" /> : <ToggleLeft size={32} />}
                            </button>
                        </div>

                        {showWelcomeCard && (
                            <div className="space-y-3 pl-4 border-l-2 border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-left-2 duration-300">
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
                        )}

                        <div className="pt-2">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Página de Apresentação (Home Personalizada)</label>
                            <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                <RichTextEditor 
                                    value={homeContent} 
                                    onChange={setHomeContent} 
                                    className="border-none min-h-[250px]"
                                    placeholder="Escreva aqui o conteúdo da página inicial (avisos, links rápidos, imagens...)"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Este conteúdo aparecerá abaixo do card de boas-vindas (ou no topo, se o card estiver oculto).
                            </p>
                        </div>
                     </div>
                   </div>

                   {/* Seção 1: Landing Page (Pública) */}
                   <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                     <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 uppercase tracking-wide">Página de Login (Pública)</h4>
                     <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título Principal (H1)</label>
                          <input 
                            type="text" 
                            value={landingTitle}
                            onChange={(e) => setLandingTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descrição Hero</label>
                          <textarea
                            rows={2}
                            value={landingDescription}
                            onChange={(e) => setLandingDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-900 text-gray-900 dark:text-white resize-none"
                          />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Palette size={16} /> Tema de Cores (Gradiente de Fundo)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {GRADIENT_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.name}
                                        onClick={() => setLandingGradient(opt.class)}
                                        className={`relative h-16 rounded-lg transition-all border-2 flex items-end justify-start p-2 text-white font-bold text-xs shadow-sm hover:shadow-md ${opt.class} ${landingGradient === opt.class ? 'border-white ring-2 ring-blue-500 scale-105 z-10' : 'border-transparent hover:scale-105'}`}
                                    >
                                        <span className="drop-shadow-md">{opt.name}</span>
                                        {landingGradient === opt.class && (
                                            <div className="absolute top-1 right-1 bg-white text-blue-600 rounded-full p-0.5">
                                                <ShieldCheck size={12} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Editor de Hero Tags */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Tag size={16} /> Tags de Destaque (Hero)
                            </label>
                            <div className="space-y-2">
                                {heroTags.map((tag, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                        <div className="relative icon-dropdown-container">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                                    dropdown?.classList.toggle('hidden');
                                                }}
                                                className="w-12 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            >
                                                <IconRenderer iconName={tag.icon} size={20} />
                                            </button>
                                            <div className="hidden icon-dropdown-menu absolute z-50 mt-1 w-48 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                                                <div className="grid grid-cols-4 gap-1 p-2">
                                                    {AVAILABLE_ICONS.map(ic => (
                                                        <button
                                                            key={ic}
                                                            type="button"
                                                            onClick={() => {
                                                                handleUpdateHeroTag(idx, 'icon', ic);
                                                                const dropdown = document.activeElement?.parentElement?.parentElement;
                                                                dropdown?.classList.add('hidden');
                                                            }}
                                                            className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center ${tag.icon === ic ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                                                            title={ic}
                                                        >
                                                            <IconRenderer iconName={ic} size={18} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <input
                                            type="text" 
                                            value={tag.text}
                                            onChange={(e) => handleUpdateHeroTag(idx, 'text', e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm"
                                            placeholder="Texto do destaque"
                                        />
                                        <button onClick={() => handleRemoveHeroTag(idx)} className="text-red-500 hover:text-red-700 p-1">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                                <Button size="sm" variant="secondary" onClick={handleAddHeroTag}>
                                    <Plus size={14} className="mr-1" /> Adicionar Tag
                                </Button>
                            </div>
                        </div>

                        {/* Editor de Landing Features */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Grid size={16} /> Blocos de Recursos (Features)
                            </label>
                            <div className="space-y-3">
                                {landingFeatures.map((feat, idx) => (
                                    <div key={idx} className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg relative group">
                                        <button onClick={() => handleRemoveFeature(idx)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <X size={16} />
                                        </button>
                                         <div className="flex gap-3 items-start">
                                              <div className="shrink-0 pt-1 relative icon-dropdown-container">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                                                        dropdown?.classList.toggle('hidden');
                                                    }}
                                                    className="w-12 h-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                >
                                                    <IconRenderer iconName={feat.icon} size={24} />
                                                </button>
                                                <div className="hidden icon-dropdown-menu absolute z-50 mt-1 w-48 max-h-48 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
                                                    <div className="grid grid-cols-4 gap-1 p-2">
                                                        {AVAILABLE_ICONS.map(ic => (
                                                            <button
                                                                key={ic}
                                                                type="button"
                                                                onClick={() => {
                                                                    handleUpdateFeature(idx, 'icon', ic);
                                                                    const dropdown = document.activeElement?.parentElement?.parentElement;
                                                                    dropdown?.classList.add('hidden');
                                                                }}
                                                                className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center ${feat.icon === ic ? 'bg-blue-100 dark:bg-blue-900/30' : ''}`}
                                                                title={ic}
                                                            >
                                                                <IconRenderer iconName={ic} size={20} />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                              </div>
                                             <div className="flex-1 space-y-2">
                                                <input 
                                                    type="text" 
                                                    value={feat.title}
                                                    onChange={(e) => handleUpdateFeature(idx, 'title', e.target.value)}
                                                    className="w-full px-2 py-1 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:border-blue-500 outline-none font-bold text-sm"
                                                    placeholder="Título do Recurso"
                                                />
                                                <textarea 
                                                    rows={2}
                                                    value={feat.description}
                                                    onChange={(e) => handleUpdateFeature(idx, 'description', e.target.value)}
                                                    className="w-full px-2 py-1 bg-transparent border border-gray-200 dark:border-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 resize-none"
                                                    placeholder="Descrição do recurso..."
                                                />
                                             </div>
                                        </div>
                                    </div>
                                ))}
                                <Button size="sm" variant="secondary" onClick={handleAddFeature}>
                                    <Plus size={14} className="mr-1" /> Adicionar Recurso
                                </Button>
                            </div>
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

          {/* ... (Footer, Security, Users Tabs Content - Similar structure) ... */}
          {activeTab === 'FOOTER' && (
             <div className="space-y-6">
                <div>
                   <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Configuração do Rodapé</h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                     Personalize as colunas, links e o texto final exibidos no rodapé da página inicial.
                   </p>
                </div>

                <div className="space-y-6">
                  {/* Grid de Colunas */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {footerColumns.map((col, colIndex) => (
                      <div key={colIndex} className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="mb-3">
                          <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                            Título da Coluna {colIndex + 1}
                          </label>
                          <input 
                             type="text" 
                             value={col.title}
                             onChange={(e) => handleUpdateColumnTitle(colIndex, e.target.value)}
                             className="w-full px-2 py-1.5 text-sm font-bold border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                          />
                        </div>
                        
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                           {col.links.map((link, linkIndex) => (
                             <div key={linkIndex} className="p-2 bg-white dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700 relative group">
                                <button 
                                  onClick={() => handleRemoveLink(colIndex, linkIndex)}
                                  className="absolute top-1 right-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remover Link"
                                >
                                  <X size={14} />
                                </button>
                                <div className="mb-1.5 pr-4">
                                  <input 
                                    type="text" 
                                    value={link.label}
                                    placeholder="Nome do Link"
                                    onChange={(e) => handleUpdateLink(colIndex, linkIndex, 'label', e.target.value)}
                                    className="w-full text-sm bg-transparent border-none p-0 focus:ring-0 text-gray-800 dark:text-gray-200 placeholder-gray-400 font-medium"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-400">
                                   <ExternalLink size={12} className="shrink-0" />
                                   <input 
                                    type="text" 
                                    value={link.url}
                                    placeholder="https://..."
                                    onChange={(e) => handleUpdateLink(colIndex, linkIndex, 'url', e.target.value)}
                                    className="w-full text-xs bg-transparent border-none p-0 focus:ring-0 text-blue-600 dark:text-blue-400 placeholder-gray-400"
                                   />
                                </div>
                             </div>
                           ))}
                        </div>

                        <button 
                          onClick={() => handleAddLink(colIndex)}
                          className="mt-3 w-full py-1.5 flex items-center justify-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-dashed border-blue-300 dark:border-blue-700 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                           <Plus size={12} /> Adicionar Link
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Texto Final */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Texto de Rodapé (Copyright/Créditos)</label>
                     <input 
                        type="text"
                        value={footerBottomText}
                        onChange={(e) => setFooterBottomText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        placeholder="Ex: Feito com ❤️ na Empresa."
                     />
                  </div>

                  <div className="pt-4 flex justify-end">
                     <Button onClick={handleSaveSettings}>
                        <Save size={16} className="mr-2" /> Salvar Rodapé
                     </Button>
                  </div>
                </div>
             </div>
          )}

          {activeTab === 'SECURITY' && (
              <div className="space-y-6">
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
                      placeholder="Departamento (Cargo)" 
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

               {/* User List & Tables ... (Unchanged logic) */}
               <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gerenciar Permissões</h3>
                <div className="border rounded-lg overflow-hidden dark:border-gray-600">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Usuário</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Função</th>
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
                              <span className="text-xs text-gray-400 dark:text-gray-500">{u.department || 'Sem cargo'}</span>
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
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end gap-2">
                                <button
                                    onClick={() => startEditingUser(u)}
                                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                    title="Editar Dados"
                                >
                                    <Edit size={16} />
                                </button>
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

          {activeTab === 'APPROVAL' && (
            <div className="space-y-6">
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">Fila de Aprovação</h3>
                  <button
                    onClick={loadPending}
                    className="text-xs px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Atualizar
                  </button>
                </div>

                {isLoadingPending ? (
                  <p className="text-sm text-gray-500">Carregando pendências...</p>
                ) : pendingDocs.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum documento pendente.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingDocs.map((d) => (
                      <div
                        key={d.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
                      >
                        <div className="min-w-0">
                          <div className="font-medium text-sm truncate">{d.title}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(d.created_at).toLocaleString()}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (mode === 'modal') onClose();
                              onOpenReviewCenter?.(d.id);
                            }}
                            className="text-xs px-3 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                            title="Abrir tela de revisao com comentario e decisao"
                          >
                            Revisar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'CATEGORIES' && (
             <div className="space-y-6">
              {/* Categories Tab Content - Unchanged Logic */}
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
                {/* Trash content unchanged */}
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
  );

  return (
    <>
    {mode === 'page' ? (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto h-[calc(100vh-3rem)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações de Admin</h1>
              <p className="text-gray-600 dark:text-gray-400">Gerencie as configurações do sistema</p>
            </div>
            <Button variant="secondary" onClick={onClose}>Fechar</Button>
          </div>
          <div className="h-[calc(100%-6rem)]">
            {body}
          </div>
        </div>
      </div>
    ) : (
      <Modal isOpen={isOpen} onClose={onClose} title="Configurações de Admin" size="lg">
        {body}
      </Modal>
    )}

    {/* User Edit Modal */}
    <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)} title="Editar Usuário" size="sm">
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome de Exibição</label>
                <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail (Login)</label>
                <input 
                    type="email" 
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Departamento (Cargo)</label>
                <input 
                    type="text" 
                    value={editDepartment}
                    onChange={(e) => setEditDepartment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 outline-none"
                />
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setEditingUser(null)}>Cancelar</Button>
                <Button onClick={saveEditedUser}>Salvar Alterações</Button>
            </div>
        </div>
    </Modal>
    </>
  );
};
