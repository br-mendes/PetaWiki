
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
import { Role, Document, Category, User, DocumentTemplate, DocumentTranslation, SupportedLanguage, SystemSettings, DocumentVersion } from './types';
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

// Componente interno para usar o hook useToast (que precisa estar dentro do Provider)
const AppContent = () => {
  const toast = useToast();

  // Auth & System State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  
  // Settings State (Inicia com Default, depois atualiza do Banco)
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

  // --- SESSÃO E INATIVIDADE ---
  
  // 1. Restaurar Sessão ao Iniciar
  useEffect(() => {
    const restoreSession = () => {
        const savedSession = localStorage.getItem(SESSION_KEY);
        if (savedSession) {
            try {
                const { user, lastActive } = JSON.parse(savedSession);
                const now = Date.now();
                
                // Verifica se a sessão expirou (15 min)
                if (now - lastActive < INACTIVITY_LIMIT) {
                    setCurrentUser(user);
                    setIsAuthenticated(true);
                    
                    // Atualiza o timestamp para o momento atual (refresh token logic equivalent)
                    const refreshedSession = { user, lastActive: now };
                    localStorage.setItem(SESSION_KEY, JSON.stringify(refreshedSession));
                    
                    if (user.themePreference) {
                        setIsDarkMode(user.themePreference === 'dark');
                    }
                    console.log('Sessão restaurada para:', user.email);
                } else {
                    console.log('Sessão expirada. Limpando storage.');
                    localStorage.removeItem(SESSION_KEY);
                }
            } catch (e) {
                console.error("Erro ao restaurar sessão", e);
                localStorage.removeItem(SESSION_KEY);
            }
        }
    };
    restoreSession();
  }, []);

  // 2. Monitorar Atividade e Logout Automático
  useEffect(() => {
    if (!isAuthenticated) return;

    let inactivityTimer: ReturnType<typeof setTimeout>;
    
    // Função para atualizar o timestamp de atividade
    const updateActivity = () => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const data = JSON.parse(stored);
            data.lastActive = Date.now();
            localStorage.setItem(SESSION_KEY, JSON.stringify(data));
        }
    };

    // Função para checar periodicamente se expirou
    const checkInactivity = () => {
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
            const { lastActive } = JSON.parse(stored);
            if (Date.now() - lastActive > INACTIVITY_LIMIT) {
                handleLogout(true); // True indica que foi por inatividade
            }
        }
    };

    // Listeners de eventos de atividade
    window.addEventListener('mousemove', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('click', updateActivity);
    window.addEventListener('scroll', updateActivity);

    // Intervalo de verificação (a cada 1 minuto)
    const intervalId = setInterval(checkInactivity, 60 * 1000);

    return () => {
        window.removeEventListener('mousemove', updateActivity);
        window.removeEventListener('keydown', updateActivity);
        window.removeEventListener('click', updateActivity);
        window.removeEventListener('scroll', updateActivity);
        clearInterval(intervalId);
    };
  }, [isAuthenticated]);

  // Computed Properties
  const categoryTree = useMemo(() => buildCategoryTree(categories), [categories]);
  
  // Separate pure active/trash from local state for admin management
  const activeDocuments = useMemo(() => documents.filter(d => !d.deletedAt), [documents]);
  const trashDocuments = useMemo(() => documents.filter(d => d.deletedAt), [documents]);

  // --- SEARCH LOGIC (Hybrid & Tracking) ---
  useEffect(() => {
    const performSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResultDocs(null); // Clear search results, revert to default view
            return;
        }

        setIsSearching(true);
        try {
            // 1. Tentar busca no Backend via RPC
            const { data, error } = await supabase.rpc('search_documents', {
                query_text: searchQuery
            });

            if (error) {
                console.warn("RPC 'search_documents' falhou (pode não existir ainda). Usando fallback local.", error.message);
                throw error; // Força cair no catch para fallback local
            }

            // Map Backend Results (snake_case) to Frontend Model (camelCase)
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
                categoryPath: getCategoryPath(d.category_id, categories), // Recalculate path
                versions: [] 
            }));

            setSearchResultDocs(mappedResults);

            // 2. ANALYTICS: Track successful search
            if (currentUser && mappedResults.length > 0) {
               // Fire and forget - don't await blocking UI
               supabase.rpc('log_search_event', {
                  p_query: searchQuery,
                  p_user_id: currentUser.id
               }).catch(err => console.error("Tracking error", err));
            }

        } catch (error) {
            // 3. Fallback: Busca Client-Side (usando dados já carregados em memória)
            // Isso garante que a busca funcione mesmo se a função SQL não tiver sido criada.
            const queryLower = searchQuery.toLowerCase();
            const localResults = documents.filter(d => {
                if (d.deletedAt) return false;
                const matchTitle = d.title.toLowerCase().includes(queryLower);
                const matchContent = d.content.toLowerCase().includes(queryLower);
                const matchTags = d.tags.some(t => t.toLowerCase().includes(queryLower));
                return matchTitle || matchContent || matchTags;
            });
            console.log(`Busca local realizada: ${localResults.length} encontrados.`);
            setSearchResultDocs(localResults);
        } finally {
            setIsSearching(false);
        }
    };

    // Debounce search by 800ms to allow typing and prevent spamming RPC
    const debounceTimer = setTimeout(performSearch, 800);
    return () => clearTimeout(debounceTimer);

  }, [searchQuery, categories, documents, currentUser]); 

  // --- VISIBLE DOCUMENTS CALCULATION ---
  const visibleDocuments = useMemo(() => {
    if (!currentUser) return [];
    
    // 1. Determine Source: Search Results OR Default Active Documents
    const isSearchingActive = searchQuery.trim().length > 0;
    
    const sourceDocs = (isSearchingActive && searchResultDocs !== null) 
        ? searchResultDocs 
        : activeDocuments;

    // 2. Filter by Role
    const roleFiltered = sourceDocs.filter(doc => {
      // Must not be in trash (unless we want to search trash, but usually not in main view)
      if (doc.deletedAt) return false;

      if (currentUser.role === 'ADMIN') return true;
      if (currentUser.role === 'EDITOR') return true;
      if (currentUser.role === 'READER') return doc.status === 'PUBLISHED';
      return false;
    });

    return roleFiltered;
  }, [activeDocuments, searchResultDocs, currentUser, searchQuery]);

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

  // Apply System Settings Effect (Favicon, Title)
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = systemSettings.logoCollapsedUrl;
    } else {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = systemSettings.logoCollapsedUrl;
      document.head.appendChild(newLink);
    }
    document.title = systemSettings.appName || 'Peta Wiki';
  }, [systemSettings]);

  // Initial Fetch - REAL DATA ONLY
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        console.log("Iniciando carregamento de dados...");
        
        const [docsRes, catsRes, usersRes, settingsRes] = await Promise.all([
            supabase.from('documents').select('*'),
            supabase.from('categories').select('*'),
            supabase.from('users').select('*'),
            supabase.from('system_settings').select('settings').single()
        ]);

        if (docsRes.error) throw new Error(`Erro Docs: ${docsRes.error.message}`);
        if (catsRes.error) throw new Error(`Erro Cats: ${catsRes.error.message}`);
        if (usersRes.error) throw new Error(`Erro Users: ${usersRes.error.message}`);

        // Mapper Categories (Needed first for getCategoryPath)
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
          deletedAt: d.deleted_at,
          views: d.views,
          tags: d.tags || [],
          categoryPath: getCategoryPath(d.category_id, mappedCats),
          versions: [] 
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
            avatar: u.avatar,
            themePreference: u.theme_preference
        }));

        setDocuments(mappedDocs);
        setCategories(mappedCats); 
        
        if (mappedUsers.length > 0) {
            setUsers(mappedUsers);
        } else {
            console.warn("DB Users Empty. Using Mocks.");
            setUsers(MOCK_USERS);
        }

        // Configurações Globais
        if (settingsRes.data && settingsRes.data.settings) {
            console.log("Configurações globais carregadas.");
            setSystemSettings(settingsRes.data.settings);
        } else {
            console.log("Nenhuma configuração global encontrada. Usando padrão.");
        }
        
        setTemplates(MOCK_TEMPLATES); 
        
      } catch (e) {
        console.error("Erro crítico ao carregar dados:", e);
        if (users.length === 0) setUsers(MOCK_USERS);
        const savedLocal = localStorage.getItem('peta_wiki_settings');
        if (savedLocal) setSystemSettings(JSON.parse(savedLocal));
        toast.error("Erro ao conectar ao banco de dados.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);


  // ... (Auth Handlers and other functions remain unchanged) ...
  // Auth Handlers
  const handleLogin = (usernameInput: string, passwordInput: string) => {
    const foundUser = users.find(u => u.username === usernameInput || u.email === usernameInput);
    
    if (foundUser && foundUser.password === passwordInput) {
      setCurrentUser(foundUser);
      setIsAuthenticated(true);
      const sessionData = { user: foundUser, lastActive: Date.now() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
      if (foundUser.themePreference) {
          setIsDarkMode(foundUser.themePreference === 'dark');
      }
      toast.success(`Bem-vindo, ${foundUser.name}!`);
    } else {
      toast.error('Usuário ou senha inválidos.');
    }
  };

  const handleSignUp = async (name: string, email: string, password: string): Promise<boolean> => {
      const domain = email.split('@')[1];
      const allowedDomains = systemSettings.allowedDomains || [];
      
      if (!allowedDomains.includes(domain)) {
          toast.error(`O domínio @${domain} não está autorizado para auto-cadastro.`);
          return false;
      }

      if (users.some(u => u.email === email || u.username === email)) {
          toast.error('Este e-mail já está cadastrado.');
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
          toast.success('Conta criada com sucesso! Faça login para continuar.');
          return true;
      } catch (e) {
          console.error("Signup error", e);
          toast.error('Erro ao criar conta no servidor.');
          return false;
      }
  };

  const handleLogout = (isTimeout = false) => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentView('HOME');
    localStorage.removeItem(SESSION_KEY);
    
    if (isTimeout) {
        toast.info('Sessão encerrada por inatividade (15min).');
    } else {
        toast.info('Você saiu do sistema.');
    }
  };

  const handleSaveSettingsGlobal = async (newSettings: SystemSettings) => {
      setSystemSettings(newSettings);
      try {
          const { error } = await supabase.from('system_settings').upsert({ 
              id: 1, 
              settings: newSettings,
              updated_at: new Date().toISOString()
          });
          if (error) throw error;
          localStorage.setItem('peta_wiki_settings', JSON.stringify(newSettings));
      } catch (e) {
          console.error("Erro ao salvar configurações globais:", e);
          toast.error("Erro ao salvar configurações no banco de dados.");
      }
  };

  const handleToggleTheme = async () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      
      if (currentUser) {
          try {
             const updatedUser = { ...currentUser, themePreference: newMode ? 'dark' : 'light' as 'dark' | 'light' };
             setCurrentUser(updatedUser);
             setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
             const storedSession = localStorage.getItem(SESSION_KEY);
             if (storedSession) {
                 const sessionData = JSON.parse(storedSession);
                 sessionData.user = updatedUser;
                 localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
             }
             await supabase.from('users').update({ 
                 theme_preference: newMode ? 'dark' : 'light' 
             }).eq('id', currentUser.id);
          } catch (error) {
              console.error("Erro ao salvar preferência de tema", error);
          }
      }
  };

  const handleUpdateUserRole = async (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    try {
        await supabase.from('users').update({ role: newRole }).eq('id', userId);
        toast.success('Permissão atualizada.');
        // Update local current user if needed AND update session storage
        if (currentUser && currentUser.id === userId) {
            const updatedUser = { ...currentUser, role: newRole };
            setCurrentUser(updatedUser);
            
            const stored = localStorage.getItem(SESSION_KEY);
            if (stored) {
                 const s = JSON.parse(stored);
                 s.user = updatedUser;
                 localStorage.setItem(SESSION_KEY, JSON.stringify(s));
            }
        }
    } catch (e) { 
        toast.error('Erro ao atualizar permissão.');
    }
  };

  const handleUpdateUserDetails = async (userId: string, data: Partial<User>) => {
    // Check email uniqueness if email is changing
    if (data.email) {
        const emailExists = users.some(u => u.email === data.email && u.id !== userId);
        if (emailExists) {
            toast.error("Este e-mail já está sendo usado por outro usuário.");
            return;
        }
    }

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
    
    // Update current user if it's them
    if (currentUser && currentUser.id === userId) {
        const updated = { ...currentUser, ...data };
        setCurrentUser(updated);
        // Update storage
        const stored = localStorage.getItem(SESSION_KEY);
        if (stored) {
             const s = JSON.parse(stored);
             s.user = updated;
             localStorage.setItem(SESSION_KEY, JSON.stringify(s));
        }
    }

    try {
        if (userId === 'mock_admin') {
           toast.success("Simulação: Dados atualizados.");
           return;
        }
        
        // Construct DB update object (snake_case)
        const dbData: any = {};
        if (data.name) dbData.name = data.name;
        if (data.email) dbData.email = data.email;
        if (data.department) dbData.department = data.department;

        if (Object.keys(dbData).length > 0) {
            const { error } = await supabase.from('users').update(dbData).eq('id', userId);
            if (error) throw error;
        }
        toast.success('Dados atualizados.');
    } catch (e) {
        toast.error('Erro ao salvar dados no banco.');
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
      password: '123',
      themePreference: 'light'
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
            avatar: newUser.avatar,
            theme_preference: 'light'
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

    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
         const s = JSON.parse(stored);
         s.user = updatedUser;
         localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    }

    if (currentUser.id === 'mock_admin') return;
    try {
        await supabase.from('users').update({ avatar: base64 }).eq('id', currentUser.id);
        toast.success('Avatar atualizado.');
    } catch(e) { toast.error('Erro ao salvar avatar.'); }
  };

  const selectedDocument = documents.find(d => d.id === selectedDocId) || null;
  const selectedTranslations = translations.filter(t => t.documentId === selectedDocId);
  const isAdminOrEditor = currentUser?.role === 'ADMIN' || currentUser?.role === 'EDITOR';

  const handleSelectDocument = (document: Document) => {
    if (document.deletedAt) return; 
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
    const hasChildren = categories.some(c => c.parentId === categoryId);
    if (hasChildren) {
        toast.error("Não é possível excluir: Esta categoria possui subcategorias.");
        return;
    }
    const hasDocuments = activeDocuments.some(d => d.categoryId === categoryId);
    if (hasDocuments) {
        toast.error("Não é possível excluir: Esta categoria contém documentos.");
        return;
    }
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

  const handleSoftDeleteDocument = async (doc: Document) => {
    if (currentUser?.role !== 'ADMIN' && currentUser?.role !== 'EDITOR') return;
    setConfirmModal({
        isOpen: true,
        title: 'Mover para Lixeira',
        message: `Deseja remover "${doc.title}"? O item será movido para a lixeira e poderá ser restaurado por um administrador.`,
        onConfirm: async () => {
            const now = new Date().toISOString();
            setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, deletedAt: now } : d));
            if (selectedDocId === doc.id) {
                setCurrentView('HOME');
                setSelectedDocId(null);
            }
            try {
                await supabase.from('documents').update({ deleted_at: now }).eq('id', doc.id);
                toast.success('Documento movido para a lixeira.');
                setCategories(prev => prev.map(c => 
                   c.id === doc.categoryId ? { ...c, docCount: Math.max(0, c.docCount - 1) } : c
                ));
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
    onCreateCategory: openCreateCategoryModal,
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
         />
      ) : (
         <Sidebar {...commonProps} searchQuery={searchQuery} />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {!isNavbarMode && (
            <Header 
                searchQuery={searchQuery}
                onSearch={setSearchQuery}
            />
        )}

        <main className="flex-1 overflow-y-auto">
          {/* A mensagem de busca agora é tratada pela Sidebar, então removemos daqui para não duplicar */}
          {/* Mas se quiser manter uma mensagem de "loading" global, pode deixar */}
          {isSearching && isLoading && (
             <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-center text-sm text-blue-600 dark:text-blue-300">
                <span className="animate-pulse">Buscando documentos...</span>
             </div>
          )}

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
              onCancel={() => {
                selectedDocument ? setCurrentView('DOCUMENT_VIEW') : setCurrentView('HOME');
              }}
              categories={categoryTree}
              allCategories={categories} // Added: Passing flat list for improved lookup in Editor
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
