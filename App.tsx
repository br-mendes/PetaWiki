
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { Role, Document, Category, User, DocumentTemplate, SystemSettings, DocumentVersion } from './types';
import { MOCK_TEMPLATES, DEFAULT_SYSTEM_SETTINGS, MOCK_USERS } from './constants';
import { supabase } from './lib/supabase';
import { 
  buildCategoryTree, 
  getCategoryPath 
} from './lib/hierarchy';
import { ToastProvider, useToast } from './components/Toast';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { AlertTriangle } from 'lucide-react';

type ViewState = 'HOME' | 'DOCUMENT_VIEW' | 'DOCUMENT_EDIT' | 'DOCUMENT_CREATE' | 'TEMPLATE_SELECTION' | 'ANALYTICS';

const SESSION_KEY = 'peta_wiki_session';
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos em milissegundos

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE === 'mock' ? 'mock' : 'db') as 'mock' | 'db';
const isMockUser = (u: any) => !!u && (String(u.id || '').startsWith('mock_') || u.isMock);

const AppContent = () => {
  const toast = useToast();

  // Auth & System State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Settings State
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  
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
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultDocs, setSearchResultDocs] = useState<Document[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Data State
  const [documents, setDocuments] = useState<Document[]>([]);
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
  
  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

// --- SESSÃO E INATIVIDADE ---
  useEffect(() => {
    const restoreSession = async () => {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
            try {
                const { user, lastActive } = JSON.parse(savedSession);
                const now = Date.now();
                if (now - lastActive < INACTIVITY_LIMIT) {
                    // Check for mock user first
                    if (isMockUser(user)) {
                      setIsDarkMode((user.themePreference || 'light') === 'dark');
                      const refreshedSession = { user, lastActive: now };
                      localStorage.setItem(SESSION_KEY, JSON.stringify(refreshedSession));
                      setCurrentUser(user);
                      setIsAuthenticated(true);
                      return;
                    }
                    
                    // 1. Restaurar sessão localmente (Optimistic)
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    
                    // 2. Buscar dados frescos do usuário no banco (especialmente tema)
                    const { data: freshData } = await supabase
                        .from('users')
                        .select('theme_preference, role, avatar, name, department')
                        .eq('id', user.id)
                        .single();

                    let finalUser = user;

                    if (freshData) {
                        // Sincronizar tema
                        if (freshData.theme_preference) {
                            setIsDarkMode(freshData.theme_preference === 'dark');
                        } else {
                            // Fallback se nulo no banco: Forçar Light
                            setIsDarkMode(false);
                            await supabase.from('users').update({ theme_preference: 'light' }).eq('id', user.id);
                            freshData.theme_preference = 'light';
                        }
                        
                        // Atualizar usuário com dados do banco
                        finalUser = { 
                            ...user, 
                            ...freshData,
                            themePreference: freshData.theme_preference 
                        };
                        setCurrentUser(finalUser);
                    }

                    // Atualizar sessão com timestamp e dados novos
                    const refreshedSession = { user: finalUser, lastActive: now };
                    localStorage.setItem(SESSION_KEY, JSON.stringify(refreshedSession));
                    
                } else {
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch (e) {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    };
    restoreSession();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;
    
    const updateActivity = () => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            data.lastActive = Date.now();
            localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        }
    };

    const checkInactivity = () => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const { lastActive } = JSON.parse(stored);
            if (Date.now() - lastActive > INACTIVITY_LIMIT) {
                handleLogout(true);
            }
        }
    };

    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    const intervalId = setInterval(checkInactivity, 60 * 1000);

    return () => {
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
        window.removeEventListener('scroll', updateActivity);
        clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  
  // FILTROS: Docs Ativos vs Lixeira
  const activeDocuments = useMemo(() => documents.filter(d => !d.deletedAt), [documents]);
  const trashDocuments = useMemo(() => documents.filter(d => !!d.deletedAt), [documents]);

  // --- SEARCH LOGIC ---
  useEffect(() => {
    const performSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResultDocs(null);
            return;
        }

        setIsSearching(true);
        try {
            const { data, error } = await supabase.rpc('search_documents', {
                query_text: searchQuery
            });

            if (error) throw error;

            const mappedResults: Document[] = (data || []).map((d: any) => ({
                id: d.id,
                title: d.title,
                content: d.content,
                categoryId: d.category_id,
                status: d.status,
                authorId: d.author_id,
                createdAt: d.created_at,
                updatedAt: d.updated_at,
                deletedAt: d.deleted_at,
                views: d.views,
                tags: d.tags || [],
                categoryPath: getCategoryPath(d.category_id, categories),
                versions: [] 
            }));

            setSearchResultDocs(mappedResults);

            if (currentUser && mappedResults.length > 0) {
               supabase.rpc('log_search_event', {
                  p_query: searchQuery,
                  p_user_id: currentUser.id
               }).catch(err => console.error("Tracking error", err));
            }

        } catch (error) {
            // Fallback para busca local
            const queryLower = searchQuery.toLowerCase();
            const localResults = activeDocuments.filter(d => {
                const matchTitle = d.title.toLowerCase().includes(queryLower);
                const matchContent = d.content.toLowerCase().includes(queryLower);
                const matchTags = d.tags.some(t => t.toLowerCase().includes(queryLower));
                return matchTitle || matchContent || matchTags;
            });
            setSearchResultDocs(localResults);
        } finally {
            setIsSearching(false);
        }
    };

    const debounceTimer = setTimeout(performSearch, 800);
    return () => clearTimeout(debounceTimer);

  }, [searchQuery, categories, documents, currentUser]); 

  // --- VISIBLE DOCUMENTS (Sidebar) ---
  const visibleDocuments = useMemo(() => {
    if (!currentUser) return [];
    
    return activeDocuments.filter(doc => {
      if (currentUser.role === 'ADMIN') return true;
      if (currentUser.role === 'EDITOR') return true;
      if (currentUser.role === 'READER') return doc.status === 'PUBLISHED';
      return false;
    });
  }, [activeDocuments, currentUser]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // --- Sincronização do Título da Aba (Browser Tab) ---
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = systemSettings.logoCollapsedUrl;
    }
    // Sincroniza o título da aba: AppName > LandingTitle (H1) > Default
    document.title = systemSettings.appName || systemSettings.landingTitle || 'Peta Wiki';
  }, [systemSettings]);

  // Initial Fetch
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [docsRes, catsRes, usersRes, settingsRes] = await Promise.all([
            supabase.from('documents').select('*'), // Traz TODOS, inclusive deletados
            supabase.from('categories').select('*'),
            supabase.from('users').select('*'),
            supabase.from('system_settings').select('settings').single()
        ]);

        if (docsRes.error) throw new Error(`Docs: ${docsRes.error.message}`);
        
        const mappedCats = (catsRes.data || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            parentId: c.parent_id,
            departmentId: c.department_id,
            order: c.sort_order, // Mapeamento DB sort_order -> App order
            docCount: c.doc_count,
            description: c.description,
            icon: c.icon
        }));

        const mappedDocs = (docsRes.data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          categoryId: d.category_id,
          status: d.status,
          authorId: d.author_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          deletedAt: d.deleted_at, 
          views: d.views,
          tags: d.tags || [],
          categoryPath: getCategoryPath(d.category_id, mappedCats),
          versions: [] 
        }));

        const mappedUsers = (usersRes.data || []).map((u: any) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            password: u.password,
            name: u.name,
            role: u.role,
            department: u.department,
            avatar: u.avatar,
            themePreference: u.theme_preference
        }));

        setDocuments(mappedDocs);
        setCategories(mappedCats); 
        
        if (mappedUsers.length > 0) {
            setUsers(mappedUsers);
        } else {
            setUsers(MOCK_USERS);
        }

        if (settingsRes.data?.settings) {
            setSystemSettings(settingsRes.data.settings);
        }
        
        setTemplates(MOCK_TEMPLATES); 
        
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        if (users.length === 0) setUsers(MOCK_USERS);
        toast.error("Erro ao conectar ao banco de dados.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

const handleLogin = (usernameInput: string, passwordInput: string) => {
    // Mock authentication mode
    if (AUTH_MODE === 'mock') {
      if (usernameInput === 'admin' && passwordInput === 'admin') {
        const admin = { ...MOCK_USERS[0], isMock: true, themePreference: 'light' as const };
        setCurrentUser(admin);
        setIsAuthenticated(true);
        setIsDarkMode(false);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: admin, lastActive: Date.now() }));
        toast.success(`Bem-vindo, ${admin.name}!`);
      } else {
        toast.error('Usuário ou senha inválidos.');
      }
      return;
    }

    // Database authentication mode
    const foundUser = users.find(u => u.username === usernameInput || u.email === usernameInput);
    if (foundUser && foundUser.password === passwordInput) {
      
      // Determina preferência, default para light se nulo
      const themePref = foundUser.themePreference || 'light';
      
      // Se não tinha preferência, salva 'light' no banco para evitar nulos futuros
      if (!foundUser.themePreference) {
          supabase.from('users').update({ theme_preference: 'light' }).eq('id', foundUser.id).then();
      }

      const userWithSettings = { ...foundUser, themePreference: themePref };

      setCurrentUser(userWithSettings);
      setIsAuthenticated(true);
      
      // Aplica tema imediatamente
      setIsDarkMode(themePref === 'dark');

      const sessionData = { user: userWithSettings, lastActive: Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      
      toast.success(`Bem-vindo, ${foundUser.name}!`);
    } else {
      // Fallback mock authentication for emergency access
      if (usernameInput === 'admin' && passwordInput === 'admin') {
        const admin = { ...MOCK_USERS[0], isMock: true, themePreference: 'light' as const };
        setCurrentUser(admin);
        setIsAuthenticated(true);
        setIsDarkMode(false);
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user: admin, lastActive: Date.now() }));
        toast.success(`Bem-vindo, ${admin.name}!`);
        return;
      }
      toast.error('Usuário ou senha inválidos.');
    }
  };

  const handleSignUp = async (name: string, email: string, password: string): Promise<boolean> => {
      // ... (mantido igual)
      const domain = email.split('@')[1];
      const allowedDomains = systemSettings.allowedDomains || [];
      if (!allowedDomains.includes(domain)) {
          toast.error(`O domínio @${domain} não está autorizado.`);
          return false;
      }
      if (users.some(u => u.email === email)) {
          toast.error('E-mail já cadastrado.');
          return false;
      }

      const newUser: User = {
          id: `u${Date.now()}`,
          username: email,
          email: email,
          password: password,
          name: name,
          role: 'READER',
          department: 'Geral',
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
          themePreference: 'light'
      };

      try {
          const { error } = await supabase.from('users').insert({
            id: newUser.id,
            username: newUser.username,
            password: newUser.password,
            email: newUser.email,
            name: newUser.name,
            role: newUser.role,
            department: newUser.department,
            avatar: newUser.avatar,
            theme_preference: 'light'
          });
          if (error) throw error;
          setUsers([...users, newUser]);
          toast.success('Conta criada! Faça login.');
          return true;
      } catch (e: any) {
          toast.error(`Erro ao criar conta: ${e.message}`);
          return false;
      }
  };

  const handleLogout = (isTimeout = false) => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('HOME');
    localStorage.removeItem(SESSION_KEY);
    if (isTimeout) toast.info('Sessão expirada.');
    else toast.info('Você saiu do sistema.');
  };

  // ... (Settings, Theme, User Management functions unchaged) ...
  const handleSaveSettingsGlobal = async (newSettings: SystemSettings) => {
      setSystemSettings(newSettings);
      try {
          await supabase.from('system_settings').upsert({ 
              id: 1, 
              settings: newSettings,
              updated_at: new Date().toISOString()
          });
          localStorage.setItem('peta_wiki_settings', JSON.stringify(newSettings));
      } catch (e) { toast.error("Erro ao salvar configurações."); }
  };

const handleToggleTheme = async () => {
      if (isMockUser(currentUser)) return;
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      if (currentUser) {
          const updatedUser = { ...currentUser, themePreference: newMode ? 'dark' : 'light' as 'dark' | 'light' };
          setCurrentUser(updatedUser);
          setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
          await supabase.from('users').update({ theme_preference: newMode ? 'dark' : 'light' }).eq('id', currentUser.id);
      }
  };

  const handleUpdateUserRole = async (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    await supabase.from('users').update({ role: newRole }).eq('id', userId);
    toast.success('Permissão atualizada.');
  };

const handleUpdateUserDetails = async (userId: string, data: Partial<User>) => {
    if (isMockUser(currentUser)) {
      toast.info("Modo mock: edição de usuário desativada.");
      return;
    }
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    if (currentUser?.id === userId) setCurrentUser({ ...currentUser, ...data });
    await supabase.from('users').update({
        name: data.name,
        email: data.email,
        department: data.department
    }).eq('id', userId);
    toast.success('Dados atualizados.');
  };

  const handleDeleteUser = async (userId: string) => {
    setConfirmModal({
        isOpen: true,
        title: 'Excluir Usuário',
        message: 'Tem certeza?',
        onConfirm: async () => {
            setUsers(prev => prev.filter(u => u.id !== userId));
            await supabase.from('users').delete().eq('id', userId);
            toast.success('Usuário excluído.');
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
      password: '123',
      themePreference: 'light'
    };
    
    // Optimistic Update
    setUsers(prev => [...prev, newUser]);
    
    const { error } = await supabase.from('users').insert({
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        password: newUser.password,
        name: newUser.name,
        role: newUser.role,
        department: newUser.department,
        avatar: newUser.avatar,
        theme_preference: 'light'
    });

    if (error) {
       toast.error(`Erro ao salvar usuário: ${error.message}`);
       // Revert optimistic update if needed, but for now just warn
    } else {
       toast.success('Usuário criado.');
    }
  };

const handleUpdatePassword = async (oldPass: string, newPass: string): Promise<boolean> => {
    if (isMockUser(currentUser)) {
      toast.info("Modo mock: alteração de senha desativada.");
      return false;
    }
    if (!currentUser) return false;
    if (currentUser.password && currentUser.password !== oldPass) return false;
    
    const updatedUser = { ...currentUser, password: newPass };
    setCurrentUser(updatedUser);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
    await supabase.from('users').update({ password: newPass }).eq('id', currentUser.id);
    toast.success('Senha atualizada.');
    return true;
  };

const handleUpdateAvatar = async (base64: string) => {
    if (isMockUser(currentUser)) {
      toast.info("Modo mock: alteração de avatar desativada.");
      return;
    }
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, avatar: base64 });
    setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, avatar: base64 } : u));
    await supabase.from('users').update({ avatar: base64 }).eq('id', currentUser.id);
  };

  // --- Document & Category Handlers ---

  const selectedDocument = documents.find(d => d.id === selectedDocId) || null;
  const isAdminOrEditor = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  const handleSelectDocument = (document: Document) => {
    if (document.deletedAt) return; 
    setSelectedDocId(document.id);
    setSearchQuery(''); 
    setCurrentView('DOCUMENT_VIEW');
  };

  const handleSearchTag = (tag: string) => {
    setSearchQuery(tag);
  };

  const handleSelectCategory = (category: Category) => {
    const docsInCat = visibleDocuments.filter(d => d.categoryId === category.id);
    if (docsInCat.length === 0 && isAdminOrEditor && (!category.children || category.children.length === 0)) {
        setConfirmModal({
            isOpen: true,
            title: 'Categoria Vazia',
            message: `Nenhum documento aqui. Criar um?`,
            onConfirm: () => {
                setNewDocTemplate({ content: '', tags: [] }); 
                setCurrentView('TEMPLATE_SELECTION');
            }
        });
    }
  };

  const handleSaveCategory = async (data: Partial<Category>) => {
    const newCategory: Category = {
      id: `c${Date.now()}`,
      name: data.name!,
      slug: data.slug!,
      parentId: data.parentId || null,
      departmentId: data.departmentId || currentUser?.department,
      order: categories.filter(c => c.parentId === data.parentId).length + 1,
      docCount: 0,
      description: data.description,
      icon: data.icon
    };
    
    // Optimistic Update
    setCategories([...categories, newCategory]);
    
    const { error } = await supabase.from('categories').insert({
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        parent_id: newCategory.parentId,
        department_id: newCategory.departmentId,
        description: newCategory.description,
        icon: newCategory.icon,
        doc_count: 0,
        sort_order: newCategory.order // Mapeamento App order -> DB sort_order
    });

    if (error) {
        console.error("Erro ao criar categoria:", error);
        toast.error(`Erro ao salvar categoria: ${error.message}`);
        // Remove from optimistic state
        setCategories(prev => prev.filter(c => c.id !== newCategory.id));
    } else {
        toast.success('Categoria criada com sucesso.');
    }
  };
  
  const handleUpdateCategory = async (id: string, data: Partial<Category>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    await supabase.from('categories').update({ name: data.name }).eq('id', id);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setConfirmModal({
        isOpen: true,
        title: 'Excluir Categoria',
        message: 'Tem certeza?',
        onConfirm: async () => {
            setCategories(categories.filter(c => c.id !== categoryId));
            const { error } = await supabase.from('categories').delete().eq('id', categoryId);
            if(error) toast.error("Erro ao excluir do banco.");
            else toast.success('Categoria excluída.');
        }
    });
  };

  const handleTemplateSelect = (template: DocumentTemplate | null) => {
    setNewDocTemplate(template ? {
        content: template.content,
        tags: template.tags,
        templateId: template.id
    } : { content: '', tags: [] });
    setCurrentView('DOCUMENT_CREATE');
  };
  
  const handleCreateTemplate = (doc: Partial<Document>) => {
    const newTemplate: DocumentTemplate = {
      id: `tpl_${Date.now()}`,
      name: doc.title || 'Novo Template',
      category: 'OTHER',
      content: doc.content || '',
      tags: doc.tags || [],
      isGlobal: true,
      usageCount: 0,
    };
    setTemplates([...templates, newTemplate]);
    toast.success('Template salvo.');
  };

  const handleSaveDocument = async (data: Partial<Document>) => {
    if (!currentUser) return;
    
    const targetCategoryId = data.categoryId || selectedDocument?.categoryId || (categories[0]?.id || 'c1'); 
    
    if (currentView === 'DOCUMENT_CREATE') {
      const newDoc: Document = {
        id: `d${Date.now()}`,
        title: data.title || 'Sem Título',
        content: data.content || '',
        categoryId: targetCategoryId, 
        status: currentUser.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING_REVIEW',
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        tags: data.tags || [],
        categoryPath: getCategoryPath(targetCategoryId, categories),
        templateId: newDocTemplate?.templateId,
        versions: []
      };
      
      // Optimistic
      setDocuments(prev => [...prev, newDoc]);
      setCategories(prev => prev.map(c => c.id === targetCategoryId ? { ...c, docCount: c.docCount + 1 } : c));

      const { error } = await supabase.from('documents').insert({ 
            id: newDoc.id,
            title: newDoc.title,
            content: newDoc.content,
            category_id: newDoc.categoryId,
            status: newDoc.status,
            author_id: newDoc.authorId,
            tags: newDoc.tags,
            views: 0
      });

      if (error) {
          console.error("Erro ao criar documento:", error);
          toast.error(`Erro ao salvar documento: ${error.message}`);
          // Revert optimistic update
          setDocuments(prev => prev.filter(d => d.id !== newDoc.id));
      } else {
          // Atualizar contador no banco
          const currentCat = categories.find(c => c.id === targetCategoryId);
          if (currentCat) {
              await supabase.from('categories').update({ doc_count: currentCat.docCount + 1 }).eq('id', targetCategoryId);
          }
          toast.success('Documento salvo e persistido.');
          setSelectedDocId(newDoc.id);
          setCurrentView('DOCUMENT_VIEW');
      }

    } else if (selectedDocument) {
      const oldDoc = documents.find(d => d.id === selectedDocument.id)!;
      const newVersion: DocumentVersion = {
        id: `v_${Date.now()}`,
        title: oldDoc.title,
        content: oldDoc.content,
        savedAt: new Date().toISOString(),
        savedBy: currentUser.name
      };
      const updatedVersions = [newVersion, ...(oldDoc.versions || [])].slice(0, 3);
      
      setDocuments(prev => prev.map(d => d.id === selectedDocument.id ? { 
          ...d, ...data, 
          categoryId: targetCategoryId, 
          updatedAt: new Date().toISOString(), 
          categoryPath: getCategoryPath(targetCategoryId, categories),
          versions: updatedVersions
      } : d));

      const { error } = await supabase.from('documents').update({ 
            title: data.title,
            content: data.content,
            category_id: targetCategoryId,
            tags: data.tags,
            updated_at: new Date().toISOString(),
            status: data.status || selectedDocument.status
      }).eq('id', selectedDocument.id);

      if (error) {
          toast.error(`Erro ao atualizar: ${error.message}`);
      } else {
          toast.success('Documento atualizado.');
      }
      
      setCurrentView('DOCUMENT_VIEW');
    }
  };

  const handleRestoreVersion = async (version: DocumentVersion) => {
     if (!selectedDocument) return;
     await handleSaveDocument({ title: version.title, content: version.content });
     toast.success('Versão restaurada.');
  };

  const handleSoftDeleteDocument = async (doc: Document) => {
    setConfirmModal({
        isOpen: true,
        title: 'Mover para Lixeira',
        message: `Remover "${doc.title}"?`,
        onConfirm: async () => {
            const now = new Date().toISOString();
            setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, deletedAt: now } : d));
            
            if (selectedDocId === doc.id) {
                setCurrentView('HOME');
                setSelectedDocId(null);
            }
            
            const { error } = await supabase.from('documents').update({ deleted_at: now }).eq('id', doc.id);
            if (error) toast.error("Erro ao mover para lixeira no banco.");
            else toast.success('Documento na lixeira.');
            
            const cat = categories.find(c => c.id === doc.categoryId);
            if (cat) {
               setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, docCount: Math.max(0, c.docCount - 1) } : c));
               await supabase.from('categories').update({ doc_count: Math.max(0, cat.docCount - 1) }).eq('id', cat.id);
            }
        }
    });
  };

  const handleRestoreDocument = async (doc: Document) => {
      setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, deletedAt: undefined } : d)); 
      const { error } = await supabase.from('documents').update({ deleted_at: null }).eq('id', doc.id);
      
      if(error) toast.error("Erro ao restaurar.");
      else toast.success('Documento restaurado.');
      
      const cat = categories.find(c => c.id === doc.categoryId);
      if (cat) {
         setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, docCount: c.docCount + 1 } : c));
         await supabase.from('categories').update({ doc_count: cat.docCount + 1 }).eq('id', cat.id);
      }
  };

  const handlePermanentDeleteDocument = async (doc: Document) => {
      setConfirmModal({
          isOpen: true,
          title: 'Excluir Permanentemente',
          message: `Esta ação é irreversível.`,
          onConfirm: async () => {
              setDocuments(prev => prev.filter(d => d.id !== doc.id));
              const { error } = await supabase.from('documents').delete().eq('id', doc.id);
              if (error) toast.error("Erro ao excluir permanentemente.");
              else toast.success('Excluído permanentemente.');
          }
      });
  };

  if (isLoading) {
    return (
        <div className="flex flex-col h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 text-blue-600 gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="animate-pulse">Sincronizando sistema...</p>
        </div>
    );
  }

  if (!isAuthenticated || !currentUser) {
    return <LoginPage onLogin={handleLogin} onSignUp={handleSignUp} settings={systemSettings} />;
  }

  const commonProps = {
    categories: categoryTree,
    documents: visibleDocuments,
    onSelectCategory: handleSelectCategory,
    onSelectDocument: handleSelectDocument,
    onNavigateHome: () => setCurrentView('HOME'),
    user: currentUser,
    onCreateCategory: (pid: string | null) => { setCategoryModalParentId(pid); setIsCategoryModalOpen(true); },
    onDeleteCategory: handleDeleteCategory,
    systemSettings,
    onOpenSettings: () => setIsAdminSettingsOpen(true),
    onLogout: () => handleLogout(false),
    onOpenProfile: () => setIsProfileOpen(true),
    toggleTheme: handleToggleTheme,
    isDarkMode,
    onNavigateToAnalytics: () => setCurrentView('ANALYTICS')
  };

  const isNavbarMode = systemSettings.layoutMode === 'NAVBAR';

  return (
    <div className={`flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans transition-colors duration-200 ${isNavbarMode ? 'flex-col' : 'flex-row'}`}>
      
      {isNavbarMode ? (
         <Navbar 
            {...commonProps} 
            searchQuery={searchQuery}
            onSearch={setSearchQuery}
            searchResults={searchResultDocs} 
         />
      ) : (
         <Sidebar {...commonProps} searchQuery={searchQuery} />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {!isNavbarMode && (
            <Header 
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
                searchResults={searchResultDocs}
                onSelectDocument={handleSelectDocument}
            />
        )}

        <main className="flex-1 overflow-y-auto">
          {currentView === 'HOME' && (
            <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
              {systemSettings.showWelcomeCard !== false && (
                <div className="text-center py-8">
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
              {/* Home Content Personalizado */}
              {systemSettings.homeContent && (
                <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                   <div className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: systemSettings.homeContent }} />
                </div>
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
              user={currentUser}
              onEdit={() => setCurrentView('DOCUMENT_EDIT')}
              onDelete={() => handleSoftDeleteDocument(selectedDocument)}
              systemSettings={systemSettings}
              onRestoreVersion={handleRestoreVersion}
              onSearchTag={handleSearchTag}
            />
          )}

          {(currentView === 'DOCUMENT_EDIT' || currentView === 'DOCUMENT_CREATE') && (isAdminOrEditor) && (
            <DocumentEditor 
              document={currentView === 'DOCUMENT_EDIT' ? selectedDocument : null}
              user={currentUser}
              onSave={handleSaveDocument}
              onCancel={() => { selectedDocument ? setCurrentView('DOCUMENT_VIEW') : setCurrentView('HOME'); }}
              categories={categoryTree}
              allCategories={categories} 
              initialCategoryId={selectedDocument?.categoryId}
              initialContent={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.content : undefined}
              initialTags={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.tags : undefined}
              onCreateTemplate={handleCreateTemplate}
            />
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
        onSaveSettings={handleSaveSettingsGlobal}
        users={users}
        onUpdateUserRole={handleUpdateUserRole}
        onUpdateUserDetails={handleUpdateUserDetails}
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
          onUpdateUser={(data) => handleUpdateUserDetails(currentUser.id, data)}
        />
      )}

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
