
import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { DocumentView } from './components/DocumentView';
import { DocumentEditor } from './components/DocumentEditor';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { CategoryModal } from './components/CategoryModal';
import { TemplateSelector } from './components/TemplateSelector';
import { LoginPage } from './components/LoginPage';
import { AdminSettings } from './components/AdminSettings';
import { UserProfile } from './components/UserProfile';
import { Role, Document, Category, User, DocumentTemplate, DocumentTranslation, SupportedLanguage, SystemSettings, DocumentVersion } from './types';
import { MOCK_TEMPLATES, DEFAULT_SYSTEM_SETTINGS, MOCK_USERS } from './constants';
import { supabase } from './lib/supabase';
import { 
  buildCategoryTree, 
  getCategoryPath 
} from './lib/hierarchy';
import { translateDocument } from './lib/translate';
import { ToastProvider, useToast } from './components/Toast';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { AlertTriangle } from 'lucide-react';

type ViewState = 'HOME' | 'DOCUMENT_VIEW' | 'DOCUMENT_EDIT' | 'DOCUMENT_CREATE' | 'TEMPLATE_SELECTION' | 'ANALYTICS';

// Componente interno para usar o hook useToast (que precisa estar dentro do Provider)
const AppContent = () => {
  const toast = useToast();

  // Auth & System State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Settings State with Local Persistence
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('peta_wiki_settings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Erro ao carregar configurações salvas", e);
        }
      }
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
       return localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  // App View State
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  
  // Data State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [translations, setTranslations] = useState<DocumentTranslation[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]); // Flat list
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Document State
  const [newDocTemplate, setNewDocTemplate] = useState<{content: string, tags: string[], templateId?: string} | null>(null);

  // Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalParentId, setCategoryModalParentId] = useState<string | null>(null);
  const [isAdminSettingsOpen, setIsAdminSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  // Confirmation Modal State (Substitui window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Computed Properties
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  
  // --- VISIBILITY & FILTERING RULES ---
  // 1. activeDocuments: All non-deleted docs (used for logic/admin)
  // 2. visibleDocuments: Docs visible to the CURRENT USER based on role
  // 3. trashDocuments: Only deleted docs (for Admin Trash view)
  
  const activeDocuments = useMemo(() => documents.filter(d => !d.deletedAt), [documents]);
  const trashDocuments = useMemo(() => documents.filter(d => d.deletedAt), [documents]);

  const visibleDocuments = useMemo(() => {
    if (!currentUser) return [];

    return activeDocuments.filter(doc => {
      // Rule 1: ADMIN sees everything active
      if (currentUser.role === 'ADMIN') return true;

      // Rule 2: EDITOR sees PUBLISHED and DRAFT/PENDING
      // (Editors need to see drafts to edit them)
      if (currentUser.role === 'EDITOR') return true;

      // Rule 3: READER sees ONLY PUBLISHED
      if (currentUser.role === 'READER') {
        return doc.status === 'PUBLISHED';
      }

      return false;
    });
  }, [activeDocuments, currentUser]);

  // Apply Theme Effect
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Apply System Settings Effect (Favicon, Title, Persistence)
  useEffect(() => {
    // Persist
    localStorage.setItem('peta_wiki_settings', JSON.stringify(systemSettings));

    // Update Favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = systemSettings.logoCollapsedUrl;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = systemSettings.logoCollapsedUrl;
      document.head.appendChild(newLink);
    }
    
    // Update Title
    document.title = systemSettings.appName || 'Peta Wiki';
  }, [systemSettings]);

  // Initial Fetch - REAL DATA ONLY
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        console.log("Iniciando conexão com Supabase...");
        
        const [docsRes, catsRes, usersRes] = await Promise.all([
            supabase.from('documents').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('users').select('*')
        ]);

        if (docsRes.error) throw new Error(`Erro Docs: ${docsRes.error.message}`);
        if (catsRes.error) throw new Error(`Erro Cats: ${catsRes.error.message}`);
        if (usersRes.error) throw new Error(`Erro Users: ${usersRes.error.message}`);

        // Mapper Documents
        const mappedDocs = (docsRes.data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          categoryId: d.category_id,
          status: d.status,
          authorId: d.author_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          deletedAt: d.deleted_at, // Soft Delete
          views: d.views,
          tags: d.tags || [],
          categoryPath: '...',
          versions: [] 
        }));

        // Mapper Categories
        const mappedCats = (catsRes.data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parentId: c.parent_id,
            department_id: c.department_id,
            order: c.order,
            docCount: c.doc_count,
            description: c.description,
            icon: c.icon
        }));

        // Mapper Users
        const mappedUsers = (usersRes.data || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            password: u.password,
            name: u.name,
            role: u.role,
            department: u.department,
            avatar: u.avatar
        }));

        setDocuments(mappedDocs);
        setCategories(mappedCats); 
        
        // Persistence Logic:
        // Use users from DB if available (ensures persistence).
        // If DB is empty (first run), fallback to MOCK_USERS to allow initial login.
        if (mappedUsers.length > 0) {
            setUsers(mappedUsers);
        } else {
            console.warn("DB Users Empty. Using Mocks.");
            setUsers(MOCK_USERS);
        }
        
        setTemplates(MOCK_TEMPLATES); 
        
      } catch (e) {
        console.error("Erro crítico ao carregar dados:", e);
        // Fallback to mocks if DB fails, ensures UI still works for demo
        setUsers(MOCK_USERS);
        toast.error("Erro ao conectar ao banco de dados. Usando dados locais.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);


  // Auth Handlers - REAL DB CHECK
  const handleLogin = (usernameInput: string, passwordInput: string) => {
    const foundUser = users.find(u => u.username === usernameInput || u.email === usernameInput);
    
    if (foundUser && foundUser.password === passwordInput) {
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      toast.success(`Bem-vindo, ${foundUser.name}!`);
    } else {
      toast.error('Usuário ou senha inválidos.');
    }
  };

  const handleSignUp = async (name: string, email: string, password: string): Promise<boolean> => {
      // 1. Validar Domínio
      const domain = email.split('@')[1];
      const allowedDomains = systemSettings.allowedDomains || [];
      
      if (!allowedDomains.includes(domain)) {
          toast.error(`O domínio @${domain} não está autorizado para auto-cadastro.`);
          return false;
      }

      // 2. Validar se usuário já existe
      if (users.some(u => u.email === email || u.username === email)) {
          toast.error('Este e-mail já está cadastrado.');
          return false;
      }

      // 3. Criar Usuário
      const newUser: User = {
          id: `u${Date.now()}`,
          username: email, // Username padrão é o email no signup
          email: email,
          password: password,
          name: name,
          role: 'READER', // Segurança: Default é leitor
          department: 'Geral',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
      };

      // 4. Persistir
      try {
          const { error } = await supabase.from('users').insert({
            id: newUser.id,
            username: newUser.username,
            password: newUser.password,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            department: newUser.department,
            avatar: newUser.avatar
          });

          if (error) throw error;

          setUsers([...users, newUser]);
          toast.success('Conta criada com sucesso! Faça login para continuar.');
          return true;
      } catch (e) {
          console.error("Signup error", e);
          toast.error('Erro ao criar conta no servidor.');
          return false;
      }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('HOME');
    toast.info('Você saiu do sistema.');
  };

  // --- User Management Handlers ---

  const handleUpdateUserRole = async (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
        await supabase.from('users').update({ role: newRole }).eq('id', userId);
        toast.success('Permissão atualizada.');
    } catch (e) { 
        toast.error('Erro ao atualizar permissão.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (currentUser?.role !== 'ADMIN') return;
    if (currentUser?.id === userId) {
        toast.error('Você não pode excluir a si mesmo.');
        return;
    }

    setConfirmModal({
        isOpen: true,
        title: 'Excluir Usuário',
        message: 'Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.',
        onConfirm: async () => {
            const userToDelete = users.find(u => u.id === userId);
            setUsers(prev => prev.filter(u => u.id !== userId));
            try {
                // Check if user is mock
                if (userId === 'mock_admin') {
                   toast.success('Simulação: Usuário mock excluído.');
                   return;
                }
                await supabase.from('users').delete().eq('id', userId);
                toast.success(`Usuário ${userToDelete?.name} excluído.`);
            } catch (e) {
                toast.error('Erro ao excluir usuário no banco de dados.');
            }
        }
    });
  };

  const handleAddUser = async (userData: Partial<User>) => {
    const newUser: User = {
      id: `u${Date.now()}`,
      username: userData.email?.split('@')[0] || 'user',
      email: userData.email!,
      name: userData.name!,
      role: userData.role || 'READER',
      department: userData.department || 'Geral',
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name || 'User')}&background=random`,
      password: '123'
    };
    
    setUsers(prev => [...prev, newUser]);

    try {
        await supabase.from('users').insert({
            id: newUser.id,
            username: newUser.username,
            password: newUser.password,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            department: newUser.department,
            avatar: newUser.avatar
        });
        toast.success('Usuário criado com sucesso.');
    } catch (e) { toast.error('Erro ao criar usuário no banco.'); }
  };

  const handleUpdatePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser) return false;
    
    if (currentUser.password && currentUser.password !== oldPass) {
      return false;
    }
    
    const updatedUser = { ...currentUser, password: newPass };
    
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    if (currentUser.id === 'mock_admin') {
       toast.warning('Aviso: Senha de usuário mock não persiste no DB.');
       // We allow the change in memory for the session
       return true;
    }

    try {
        const { error } = await supabase.from('users').update({ password: newPass }).eq('id', currentUser.id);
        if (error) throw error;
        toast.success('Senha atualizada com sucesso.');
        return true;
    } catch (e) {
        toast.error('Erro ao salvar nova senha.');
        return false;
    }
  };
  
  const handleUpdateAvatar = async (base64: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, avatar: base64 };
    
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));

    if (currentUser.id === 'mock_admin') {
       // Mock update only in memory
       return;
    }

    try {
        await supabase.from('users').update({ avatar: base64 }).eq('id', currentUser.id);
        toast.success('Avatar atualizado.');
    } catch(e) { toast.error('Erro ao salvar avatar.'); }
  };

  const handleRoleChange = (role: Role) => {
    if (currentUser) {
      const updated = { ...currentUser, role };
      setCurrentUser(updated);
      toast.info(`Visualizando como: ${role}`);
    }
  };

  // Logic Guards
  // Use 'activeDocuments' for standard selection, but we might select a trash doc if in Trash view (handled by AdminSettings)
  const selectedDocument = documents.find(d => d.id === selectedDocId) || null;
  const selectedTranslations = translations.filter(t => t.documentId === selectedDocId);
  const isAdminOrEditor = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  // --- View Handlers ---
  const handleSelectDocument = (document: Document) => {
    if (document.deletedAt) return; // Prevent selecting deleted docs from normal navigation
    setSelectedDocId(document.id);
    setCurrentView('DOCUMENT_VIEW');
  };

  const handleSelectCategory = (category: Category) => {
    const docsInCat = visibleDocuments.filter(d => d.categoryId === category.id);
    if (docsInCat.length === 0) {
      if (isAdminOrEditor && (!category.children || category.children.length === 0)) {
        setConfirmModal({
            isOpen: true,
            title: 'Categoria Vazia',
            message: `Nenhum documento em "${category.name}". Deseja criar um agora?`,
            onConfirm: () => {
                setNewDocTemplate({ content: '', tags: [] }); 
                setCurrentView('TEMPLATE_SELECTION');
            }
        });
      }
    }
  };

  const openCreateCategoryModal = (parentId: string | null) => {
    setCategoryModalParentId(parentId);
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (data: Partial<Category>) => {
    if (!currentUser) return;
    const newCategory: Category = {
      id: `c${Date.now()}`,
      name: data.name!,
      slug: data.slug!,
      parentId: data.parentId || null,
      departmentId: data.departmentId || currentUser.department,
      order: categories.filter(c => c.parentId === data.parentId).length + 1,
      docCount: 0,
      description: data.description,
      icon: data.icon
    };
    
    setCategories([...categories, newCategory]);

    try {
        await supabase.from('categories').insert({
            id: newCategory.id,
            name: newCategory.name,
            slug: newCategory.slug,
            parent_id: newCategory.parentId,
            department_id: newCategory.departmentId,
            description: newCategory.description,
            icon: newCategory.icon,
            doc_count: 0,
            order: newCategory.order
        });
        toast.success('Categoria criada com sucesso.');
    } catch(e) { toast.error('Erro ao salvar categoria.'); }
  };
  
  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    try {
        const dbData: any = {};
        if (data.name) dbData.name = data.name;
        if (Object.keys(dbData).length > 0) {
            await supabase.from('categories').update(dbData).eq('id', id);
        }
    } catch(e) { console.error(e); }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (currentUser?.role !== 'ADMIN') {
      toast.error("Apenas Admins podem excluir categorias.");
      return;
    }

    // 1. Verificação de Subcategorias (Filhos)
    const hasChildren = categories.some(c => c.parentId === categoryId);
    if (hasChildren) {
        toast.error("Não é possível excluir: Esta categoria possui subcategorias.");
        return;
    }

    // 2. Verificação de Documentos (Arquivos) - Check Active Docs only
    const hasDocuments = activeDocuments.some(d => d.categoryId === categoryId);
    if (hasDocuments) {
        toast.error("Não é possível excluir: Esta categoria contém documentos.");
        return;
    }

    // Se chegou aqui, está vazio e pode excluir (Confirmação segura)
    setConfirmModal({
        isOpen: true,
        title: 'Excluir Categoria',
        message: 'Tem certeza que deseja excluir esta categoria vazia?',
        onConfirm: async () => {
            setCategories(categories.filter(c => c.id !== categoryId));
            try {
                await supabase.from('categories').delete().eq('id', categoryId);
                toast.success('Categoria excluída.');
            } catch(e) { toast.error('Erro ao excluir no banco de dados.'); }
        }
    });
  };

  const handleTemplateSelect = (template: DocumentTemplate | null) => {
    if (template) {
      setNewDocTemplate({
        content: template.content,
        tags: template.tags,
        templateId: template.id
      });
    } else {
      setNewDocTemplate({ content: '', tags: [] });
    }
    setCurrentView('DOCUMENT_CREATE');
  };
  
  const handleCreateTemplate = (doc: Partial<Document>) => {
    const newTemplate: DocumentTemplate = {
      id: `tpl_${Date.now()}`,
      name: doc.title || 'Novo Template',
      category: 'OTHER',
      description: 'Template criado a partir de documento.',
      icon: 'file-text',
      content: doc.content || '',
      tags: doc.tags || [],
      isGlobal: true,
      usageCount: 0,
      departmentId: currentUser?.department
    };
    setTemplates([...templates, newTemplate]);
    toast.success('Template salvo com sucesso!');
  };

  const handleCreateTranslation = async (targetLangs: SupportedLanguage[]) => {
    if (!selectedDocument) return;

    for (const lang of targetLangs) {
      const result = await translateDocument(selectedDocument.title, selectedDocument.content, lang);
      
      const translation: DocumentTranslation = {
        id: `trans_${selectedDocument.id}_${lang}_${Date.now()}`,
        documentId: selectedDocument.id,
        language: lang,
        translatedTitle: result.title,
        translatedContent: result.content,
        status: 'SYNCED',
        lastSyncedAt: new Date().toISOString()
      };
      
      setTranslations(prev => [
        ...prev.filter(t => !(t.documentId === selectedDocument.id && t.language === lang)),
        translation
      ]);
    }
    toast.success('Tradução concluída.');
  };

  const handleSaveDocument = async (data: Partial<Document>) => {
    if (!currentUser) return;
    let updatedDocs = [...documents];
    let newDocId = selectedDocument?.id;
    const targetCategoryId = data.categoryId || selectedDocument?.categoryId || (categories[0]?.id || 'c1'); 
    const path = getCategoryPath(targetCategoryId, categories);

    if (currentView === 'DOCUMENT_CREATE') {
      newDocId = `d${Date.now()}`;
      const newDoc: Document = {
        id: newDocId,
        title: data.title || 'Sem Título',
        content: data.content || '',
        categoryId: targetCategoryId, 
        status: currentUser.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING_REVIEW',
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        tags: data.tags || [],
        categoryPath: path,
        templateId: newDocTemplate?.templateId,
        versions: []
      };
      
      updatedDocs = [...documents, newDoc];
      
      // Update local category count
      setCategories(prev => prev.map(c => 
        c.id === targetCategoryId ? { ...c, docCount: c.docCount + 1 } : c
      ));

      try {
        await supabase.from('documents').insert({ 
            id: newDoc.id,
            title: newDoc.title,
            content: newDoc.content,
            category_id: newDoc.categoryId,
            status: newDoc.status,
            author_id: newDoc.authorId,
            tags: newDoc.tags,
            views: 0
        });
        
        const currentCat = categories.find(c => c.id === targetCategoryId);
        if (currentCat) {
             await supabase.from('categories').update({ doc_count: currentCat.docCount + 1 }).eq('id', targetCategoryId);
        }

      } catch (e) { toast.error('Erro ao salvar documento.'); }

      setSelectedDocId(newDocId);
    } else if (selectedDocument) {
      // Logic for Versioning (Max 3 versions)
      const oldDoc = documents.find(d => d.id === selectedDocument.id)!;
      
      const newVersion: DocumentVersion = {
        id: `v_${Date.now()}`,
        title: oldDoc.title,
        content: oldDoc.content,
        savedAt: new Date().toISOString(),
        savedBy: users.find(u => u.id === oldDoc.authorId)?.name || 'Desconhecido'
      };

      const updatedVersions = [newVersion, ...(oldDoc.versions || [])].slice(0, 3);

      updatedDocs = documents.map(d => 
        d.id === selectedDocument.id 
          ? { 
              ...d, 
              ...data, 
              categoryId: targetCategoryId, 
              updatedAt: new Date().toISOString(), 
              categoryPath: path,
              versions: updatedVersions 
            } 
          : d
      );

      setTranslations(prev => prev.map(t => 
        t.documentId === selectedDocument.id 
          ? { ...t, status: 'OUT_OF_SYNC' } 
          : t
      ));
      
      try {
        await supabase.from('documents').update({ 
            title: data.title,
            content: data.content,
            category_id: targetCategoryId,
            tags: data.tags,
            updated_at: new Date().toISOString(),
            status: data.status || selectedDocument.status
        }).eq('id', selectedDocument.id);
      } catch (e) { toast.error('Erro ao atualizar documento.'); }
    }
    
    setDocuments(updatedDocs);
    setCurrentView('DOCUMENT_VIEW');
    toast.success('Documento salvo.');
  };

  const handleRestoreVersion = async (version: DocumentVersion) => {
     if (!selectedDocument || !currentUser) return;
     
     setConfirmModal({
        isOpen: true,
        title: 'Restaurar Versão',
        message: `Deseja restaurar a versão de ${new Date(version.savedAt).toLocaleString()}? O conteúdo atual será salvo no histórico.`,
        onConfirm: async () => {
            await handleSaveDocument({
                title: version.title,
                content: version.content
            });
            toast.success('Versão restaurada com sucesso!');
        }
     });
  };

  // --- Document Deletion & Trash Logic ---

  const handleSoftDeleteDocument = async (doc: Document) => {
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'EDITOR') return;

    setConfirmModal({
        isOpen: true,
        title: 'Mover para Lixeira',
        message: `Deseja remover "${doc.title}"? O item será movido para a lixeira e poderá ser restaurado por um administrador.`,
        onConfirm: async () => {
            const now = new Date().toISOString();
            
            // Update State
            setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, deletedAt: now } : d));
            
            // If current view was this doc, go home
            if (selectedDocId === doc.id) {
                setCurrentView('HOME');
                setSelectedDocId(null);
            }

            // Update DB
            try {
                await supabase.from('documents').update({ deleted_at: now }).eq('id', doc.id);
                toast.success('Documento movido para a lixeira.');
                
                // Update category count locally
                setCategories(prev => prev.map(c => 
                   c.id === doc.categoryId ? { ...c, docCount: Math.max(0, c.docCount - 1) } : c
                ));

                // DB count update
                const cat = categories.find(c => c.id === doc.categoryId);
                if (cat) {
                   await supabase.from('categories').update({ doc_count: Math.max(0, cat.docCount - 1) }).eq('id', cat.id);
                }

            } catch(e) { toast.error('Erro ao atualizar status do documento.'); }
        }
    });
  };

  const handleRestoreDocument = async (doc: Document) => {
      if (currentUser?.role !== 'ADMIN') return;

      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, deletedAt: null } : d));

      try {
          await supabase.from('documents').update({ deleted_at: null }).eq('id', doc.id);
          toast.success('Documento restaurado.');
          
          // Update category count
          setCategories(prev => prev.map(c => 
             c.id === doc.categoryId ? { ...c, docCount: c.docCount + 1 } : c
          ));
          const cat = categories.find(c => c.id === doc.categoryId);
          if (cat) {
             await supabase.from('categories').update({ doc_count: cat.docCount + 1 }).eq('id', cat.id);
          }
      } catch(e) { toast.error('Erro ao restaurar documento.'); }
  };

  const handlePermanentDeleteDocument = async (doc: Document) => {
      if (currentUser?.role !== 'ADMIN') return;

      setConfirmModal({
          isOpen: true,
          title: 'Excluir Permanentemente',
          message: `ATENÇÃO: Deseja apagar definitivamente "${doc.title}"? Esta ação é irreversível.`,
          onConfirm: async () => {
              setDocuments(prev => prev.filter(d => d.id !== doc.id));
              
              try {
                  await supabase.from('documents').delete().eq('id', doc.id);
                  toast.success('Documento excluído permanentemente.');
              } catch(e) { toast.error('Erro ao excluir do banco de dados.'); }
          }
      });
  };

  if (isLoading) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-blue-600 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="animate-pulse">Preparando tudo para você...</p>
        </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} settings={systemSettings} />;
  }

  const commonProps = {
    categories: categoryTree,
    documents: visibleDocuments, // Sidebar/Search only sees docs permitted by user role
    onSelectCategory: handleSelectCategory,
    onSelectDocument: handleSelectDocument,
    onNavigateHome: () => setCurrentView('HOME'),
    user: currentUser,
    onCreateCategory: openCreateCategoryModal,
    onDeleteCategory: handleDeleteCategory,
    systemSettings,
    onOpenSettings: () => setIsAdminSettingsOpen(true),
    onLogout: handleLogout,
    onOpenProfile: () => setIsProfileOpen(true),
    toggleTheme: () => setIsDarkMode(!isDarkMode),
    isDarkMode,
    onNavigateToAnalytics: () => setCurrentView('ANALYTICS')
  };

  const isNavbarMode = systemSettings.layoutMode === 'NAVBAR';

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 ${isNavbarMode ? 'flex-col' : 'flex-row'}`}>
      
      {/* Navigation Layer */}
      {isNavbarMode ? (
         <Navbar {...commonProps} />
      ) : (
         <Sidebar {...commonProps} />
      )}

      {/* Main Content Layer */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Header only for search if in Sidebar mode (user controls are now in Sidebar footer) */}
        {!isNavbarMode && <Header />}

        <main className="flex-1 overflow-y-auto">
          {currentView === 'HOME' && (
            <div className="p-12 text-center animate-in fade-in duration-500">
              <img 
                src={systemSettings.logoCollapsedUrl} 
                alt="Logo" 
                className="w-24 h-24 mx-auto mb-6 rounded-xl shadow-md p-2 bg-white object-contain" 
              />
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
                {systemSettings.homeTitle || `Bem-vindo ao ${systemSettings.appName}`}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-8 whitespace-pre-line">
                {systemSettings.homeDescription || 'Selecione uma categoria na barra lateral para navegar pela documentação.'}
              </p>
              {isAdminOrEditor && (
                <button 
                  onClick={() => setCurrentView('TEMPLATE_SELECTION')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                >
                  Criar Novo Documento
                </button>
              )}
            </div>
          )}

          {currentView === 'ANALYTICS' && currentUser.role === 'ADMIN' && (
            <AnalyticsDashboard />
          )}

          {currentView === 'TEMPLATE_SELECTION' && (
            <TemplateSelector 
              templates={templates}
              onSelect={handleTemplateSelect}
              onCancel={() => setCurrentView('HOME')}
            />
          )}

          {currentView === 'DOCUMENT_VIEW' && selectedDocument && (
            <DocumentView 
              document={selectedDocument} 
              translations={selectedTranslations}
              user={currentUser}
              onEdit={() => setCurrentView('DOCUMENT_EDIT')}
              onDelete={() => handleSoftDeleteDocument(selectedDocument)}
              systemSettings={systemSettings}
              onRestoreVersion={handleRestoreVersion} 
            />
          )}

          {(currentView === 'DOCUMENT_EDIT' || currentView === 'DOCUMENT_CREATE') && (isAdminOrEditor) && (
            <DocumentEditor 
              document={currentView === 'DOCUMENT_EDIT' ? selectedDocument : null}
              user={currentUser}
              onSave={handleSaveDocument}
              onTranslate={currentView === 'DOCUMENT_EDIT' ? handleCreateTranslation : undefined}
              onCancel={() => {
                selectedDocument ? setCurrentView('DOCUMENT_VIEW') : setCurrentView('HOME');
              }}
              categories={categoryTree}
              initialCategoryId={selectedDocument?.categoryId}
              initialContent={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.content : undefined}
              initialTags={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.tags : undefined}
              onCreateTemplate={handleCreateTemplate}
            />
          )}

          {(currentView === 'ANALYTICS' && currentUser.role !== 'ADMIN') && (
            <div className="p-12 text-center text-red-600">Acesso Negado: Privilégios de administrador necessários.</div>
          )}
        </main>
      </div>

      <CategoryModal 
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        parentId={categoryModalParentId}
        categories={categories}
        user={currentUser}
        onSave={handleSaveCategory}
      />

      <AdminSettings 
        isOpen={isAdminSettingsOpen}
        onClose={() => setIsAdminSettingsOpen(false)}
        settings={systemSettings}
        onSaveSettings={setSystemSettings}
        users={users}
        onUpdateUserRole={handleUpdateUserRole}
        onDeleteUser={handleDeleteUser}
        onAddUser={handleAddUser}
        categories={categories}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
        onAddCategory={handleSaveCategory}
        trashDocuments={trashDocuments}
        onRestoreDocument={handleRestoreDocument}
        onPermanentDeleteDocument={handlePermanentDeleteDocument}
      />

      {currentUser && (
        <UserProfile 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={currentUser}
          onUpdatePassword={handleUpdatePassword}
          onUpdateAvatar={handleUpdateAvatar}
        />
      )}

      {/* Confirmação Modal Genérica */}
      <Modal 
        isOpen={confirmModal.isOpen} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
        title={confirmModal.title}
        size="sm"
      >
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <div className="p-2 bg-yellow-50 rounded-full text-yellow-600">
                    <AlertTriangle size={24} />
                </div>
                <p className="text-gray-700 dark:text-gray-300 pt-1">{confirmModal.message}</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}>Cancelar</Button>
                <Button onClick={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); }}>Confirmar</Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;
