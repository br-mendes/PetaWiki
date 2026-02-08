
import React, { useState, useEffect, useMemo, useRef, useCallback, memo } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams, Navigate } from 'react-router-dom';
import { listCategories, createCategory, renameCategory, deleteCategory, type Category } from "./lib/categories";
import { CategoryTree } from "./components/CategoryTree";
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { DocumentView } from './components/DocumentView';
import { DocumentEditor } from './components/DocumentEditor';
import { LazyWrapper } from './components/LazyWrapper';
import { LazyComponents } from './components/LazyComponents';
import { LoginPage } from './components/LoginPage';
import { Role, Document, User, DocumentTemplate, SystemSettings, DocumentVersion } from './types';
import { MOCK_TEMPLATES, DEFAULT_SYSTEM_SETTINGS, MOCK_USERS } from './constants';
import { supabase } from './lib/supabase';
import { 
  buildCategoryTree, 
  getCategoryPath,
  generateSlug
} from './lib/hierarchy';
import { ToastProvider, useToast } from './components/Toast';
import { Modal } from './components/Modal';
import { Button } from './components/Button';
import { NotFoundPage } from './components/NotFoundPage';
import { NotificationCenter } from './components/NotificationCenter';
import { DocumentViewRoute } from './routes/DocumentViewRoute';
import { CategoryViewRoute } from './routes/CategoryViewRoute';
import { NewDocumentRoute } from './routes/NewDocumentRoute';
import { AnalyticsRoute } from './routes/AnalyticsRoute';
import { AdminRoute } from './routes/AdminRoute';
import { ReviewRoute } from './routes/ReviewRoute';
import { DepartmentsRoute, DepartmentViewRoute } from './routes/DepartmentsRoute';
import { AreasRoute, AreaViewRoute } from './routes/AreasRoute';
import { FavoritesRoute } from './routes/FavoritesRoute';
import { NotificationsRoute } from './routes/NotificationsRoute';
import { ProfileRoute, UserProfileRoute } from './routes/ProfileRoute';
import { DocumentCommentsRoute } from './routes/DocumentCommentsRoute';
import { DocumentExportRoute, ExportsRoute } from './routes/ExportsRoute';
import { TemplatesRoute, TemplateViewRoute } from './routes/TemplatesRoute';
import { AlertTriangle, FileText } from 'lucide-react';
import { sanitizeHtml } from './lib/sanitize';
import { createTemplate as dbCreateTemplate, listTemplates as dbListTemplates, incrementTemplateUsage } from './lib/templates';

type ViewState =
  | 'HOME'
  | 'CATEGORY_VIEW'
  | 'DOCUMENT_VIEW'
  | 'DOCUMENT_EDIT'
  | 'DOCUMENT_CREATE'
  | 'TEMPLATE_SELECTION'
  | 'ANALYTICS'
  | 'REVIEW_CENTER'
  | 'ADMIN_SETTINGS'
  | 'NOTIFICATIONS';

const SESSION_KEY = 'peta_wiki_session';
const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutos em milissegundos
const CATEGORY_STORAGE_KEY = 'PETA_ACTIVE_CATEGORY_ID';

const AUTH_MODE = (import.meta.env.VITE_AUTH_MODE === 'mock' ? 'mock' : 'db') as 'mock' | 'db';
const isMockUser = (u: any) => !!u && (String(u.id || '').startsWith('mock_') || u.isMock);

const AppContent = () => {
  const toast = useToast();

  const {
    AnalyticsDashboard,
    ReviewCenter,
    TemplateSelector,
    CategoryModal,
    AdminSettings,
    UserProfile,
  } = LazyComponents;

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
  const [reviewCenterDocId, setReviewCenterDocId] = useState<string | null>(null);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultDocs, setSearchResultDocs] = useState<Document[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
// Data State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]); // Flat list
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Favorites State
  type DocFilter = 'ALL' | 'FAVORITES';
  const [docFilter, setDocFilter] = useState<DocFilter>('ALL');
  const [favoriteDocIds, setFavoriteDocIds] = useState<string[]>([]);

// Category States
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | null>(null);

  // Category persistence
  useEffect(() => {
    localStorage.setItem(CATEGORY_STORAGE_KEY, activeCategoryId ?? '');
}, [activeCategoryId]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated || !currentUser) return;

      if (isMockUser(currentUser)) {
        setFavoriteDocIds([]);
        return;
      }

      const { data, error } = await supabase
        .from("document_favorites")
        .select("document_id")
        .eq("user_id", currentUser.id);

      if (error) {
        console.error("Erro ao carregar favoritos:", error);
        setFavoriteDocIds([]);
        return;
      }

      setFavoriteDocIds((data || []).map((r: any) => r.document_id));
    };

    loadFavorites();
  }, [isAuthenticated, currentUser?.id]);

  // New Document State
  const [newDocTemplate, setNewDocTemplate] = useState<{content: string, tags: string[], templateId?: string} | null>(null);

  // Clear template when leaving DOCUMENT_CREATE view
  useEffect(() => {
    if (currentView !== 'DOCUMENT_CREATE' && newDocTemplate) {
      setNewDocTemplate(null);
    }
  }, [currentView, newDocTemplate]);

  // Modal State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalParentId, setCategoryModalParentId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [settingsReturnView, setSettingsReturnView] = useState<ViewState>('HOME');

  // Notifications State
  const [notifications, setNotifications] = useState([]);

  // ========== ROUTING HOOKS ==========
  const navigate = useNavigate();
  const params = useParams<{ categoryId?: string; docId?: string; action?: string }>();
  const [searchParams] = useSearchParams();

  // Single unified useEffect for all URL handling - simplified without flags
  useEffect(() => {
    if (!isAuthenticated || !params) return;

    const processUrl = async () => {
      const path = window.location.pathname;
      console.log('Processing URL:', path, 'params:', params);

      // Handle special routes first
      if (path === '/novo' || path.startsWith('/novo')) {
        setCurrentView('DOCUMENT_CREATE');
        const catParam = searchParams.get('categoria');
        if (catParam) setActiveCategoryId(catParam);
        return;
      }

      if (path === '/analytics' || path.startsWith('/analytics')) {
        setCurrentView('ANALYTICS');
        return;
      }

      if (path === '/admin' || path.startsWith('/admin')) {
        setCurrentView('ADMIN_SETTINGS');
        return;
      }

      if (path === '/revisoes' || path.startsWith('/revisoes')) {
        setCurrentView('REVIEW_CENTER');
        if (params.docId) {
          setReviewCenterDocId(params.docId);
        }
        return;
      }

      // Handle category view
      if (params.categoryId) {
        console.log('Category ID from URL:', params.categoryId);
        
        // Wait for data to load before checking
        if (isLoading) {
          console.log('Data still loading, waiting...');
          return;
        }
        
        const category = findCategoryById(categories, params.categoryId);
        console.log('Found category:', category);
        
        if (category) {
          console.log('Setting active category');
          setActiveCategoryId(params.categoryId);
          setCurrentView('CATEGORY_VIEW');
          // Documents will be filtered by activeCategoryId in useMemo
        } else {
          console.log('Category not found after loading, redirecting to home');
          navigate('/');
        }
        return;
      }

      // Handle document view/edit
      if (params.docId) {
        console.log('Document ID from URL:', params.docId);
        
        // Wait for data to load before checking
        if (isLoading) {
          console.log('Data still loading, waiting...');
          return;
        }
        
        // Check if document is in cache
        const existingDoc = documents.find(d => d.id === params.docId);
        
          if (!existingDoc) {
            console.log('Document not found after loading, redirecting to home');
            navigate('/');
            return;
        } else {
          console.log('Document found in cache');
          setSelectedDocId(params.docId);
          setActiveCategoryId(existingDoc.categoryId || null);
          setCurrentView(params.action === 'editar' ? 'DOCUMENT_EDIT' : 'DOCUMENT_VIEW');
        }
        return;
      }

      // Handle notifications route
      if (path === '/notificacoes' || path.startsWith('/notificacoes')) {
        setCurrentView('NOTIFICATIONS');
        return;
      }

      // Handle root path (/)
      if (!params.categoryId && !params.docId && (path === '/' || path === '')) {
        console.log('Setting to HOME');
        setCurrentView('HOME');
        setActiveCategoryId(null);
        setSelectedDocId(null);
        return;
      }
    };

    // Process immediately
    processUrl();
  }, [params, isAuthenticated, categories, documents, isLoading]); // Added isLoading to prevent redirects before data is ready

  // Removed redundant useEffect to prevent race conditions
  // Document view is now handled in the main URL processing effect

  // Helper functions for navigation - simplified without artificial delays
  const navigateToCategory = useCallback((categoryId: string | null) => {
    if (categoryId) {
      navigate(`/categoria/${categoryId}`);
    } else {
      navigate('/');
    }
  }, [navigate]);

  const navigateToDocument = useCallback((docId: string, action?: 'editar') => {
    if (action === 'editar') {
      navigate(`/documento/${docId}/editar`);
    } else {
      navigate(`/documento/${docId}`);
    }
  }, [navigate]);

  const navigateToCreate = useCallback((categoryId?: string) => {
    const url = categoryId ? `/novo?categoria=${categoryId}` : '/novo';
    navigate(url);
  }, [navigate]);

  const navigateToReview = useCallback((docId?: string) => {
    if (docId) {
      navigate(`/revisoes/${docId}`);
    } else {
      navigate('/revisoes');
    }
  }, [navigate]);

  const navigateToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const navigateToAnalytics = useCallback(() => {
    navigate('/analytics');
  }, [navigate]);

  const navigateToAdmin = useCallback(() => {
    navigate('/admin');
  }, [navigate]);

  // Helper to find category by ID
  const findCategoryById = React.useCallback((nodes: Category[], id: string): Category | null => {
    for (const n of nodes) {
      if (n.id === id) return n;
      const kids = (n.children || []) as Category[];
      if (kids.length) {
        const found = findCategoryById(kids, id);
        if (found) return found;
      }
    }
    return null;
  }, []);

  // Replace state setters with navigate functions
  const openReviewCenter = useCallback((docId?: string | null) => {
    navigateToReview(docId || undefined);
  }, [navigateToReview]);

  const openAdminSettings = useCallback(() => {
    setSettingsReturnView(currentView);
    navigateToAdmin();
  }, [currentView, navigateToAdmin]);

  // Simple navigation handlers - let React Router handle everything
  const handleSelectDocumentWithNavigate = useCallback((doc: Document) => {
    navigateToDocument(doc.id);
  }, [navigateToDocument]);

  const handleSelectCategoryWithNavigate = useCallback((category: Category) => {
    navigateToCategory(category.id);
  }, [navigateToCategory]);

  // Notification handlers
  const handleMarkNotificationAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, is_read: true } : n
    ));
  }, []);

  const handleMarkAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, []);

  const handleRefreshNotifications = useCallback(async () => {
    // TODO: Load fresh notifications from database
    console.log('Refreshing notifications...');
  }, []);
   
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
                        .select('theme_preference, role, avatar, name, department, is_super_admin')
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
                        
                        // Atualizar usuário com dados do banco (mapeando snake_case -> camelCase)
                        finalUser = {
                            ...user,
                            role: freshData.role ?? user.role,
                            avatar: freshData.avatar ?? user.avatar,
                            name: freshData.name ?? user.name,
                            department: freshData.department ?? user.department,
                            themePreference: freshData.theme_preference ?? (user.themePreference || 'light'),
                            isSuperAdmin: typeof (freshData as any).is_super_admin === 'boolean'
                              ? (freshData as any).is_super_admin
                              : (user.isSuperAdmin ?? false),
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

  const safeHomeContent = useMemo(
    () => sanitizeHtml(systemSettings.homeContent || ''),
    [systemSettings.homeContent]
  );
  
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
const searchParams: any = {
                query_text: searchQuery
            };
            if (activeCategoryId) searchParams.category_id = activeCategoryId;

            const { data, error } = await supabase.rpc('search_documents', searchParams);

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
               void (async () => {
                 try {
                   await supabase.rpc('log_search_event', {
                     p_query: searchQuery,
                     p_user_id: currentUser.id
                   });
                 } catch (err) {
                   console.error("Tracking error", err);
                 }
               })();
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
      if (currentUser.role === 'EDITOR') {
        // Editors can see all published docs, plus their own drafts/review/rejected.
        if (doc.status === 'PUBLISHED') return true;
        return doc.authorId === currentUser.id;
      }
      if (currentUser.role === 'READER') return doc.status === 'PUBLISHED';
      return false;
    });
 }, [activeDocuments, currentUser]);

  const visibleDocumentsFiltered = useMemo(() => {
    if (docFilter !== 'FAVORITES') return visibleDocuments;
    const favSet = new Set(favoriteDocIds);
    return visibleDocuments.filter(d => favSet.has(d.id));
  }, [docFilter, visibleDocuments, favoriteDocIds]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
}, [isDarkMode]);

  // --- Favorites Event Listener ---
  useEffect(() => {
    const handler = (e: any) => {
      const { docId, isFavorite } = e?.detail || {};
      if (!docId) return;

      setFavoriteDocIds(prev => {
        if (isFavorite) return Array.from(new Set([...prev, docId]));
        return prev.filter(id => id !== docId);
      });
    };

    window.addEventListener('peta:favorite-changed', handler);
    return () => window.removeEventListener('peta:favorite-changed', handler);
  }, []);

  const getDescendantIds = (categoryId: string) => {
    const childrenByParent = new Map<string | null, string[]>();
    for (const c of categories) {
      const p = c.parentId ?? null;
      if (!childrenByParent.has(p)) childrenByParent.set(p, []);
      childrenByParent.get(p)!.push(c.id);
    }

    const out = new Set<string>();
    const stack = [categoryId];
    while (stack.length) {
      const cur = stack.pop()!;
      const kids = childrenByParent.get(cur) || [];
      for (const k of kids) {
        if (!out.has(k)) {
          out.add(k);
          stack.push(k);
        }
      }
    }
    return out;
  };

  const moveCategoryToParent = async (categoryId: string, newParentId: string | null) => {
    if (categoryId === newParentId) {
      toast.error("Uma pasta nao pode ser filha dela mesma.");
      return;
    }

    if (newParentId) {
      const descendants = getDescendantIds(categoryId);
      if (descendants.has(newParentId)) {
        toast.error("Movimento invalido: isso criaria um ciclo.");
        return;
      }
    }

    const siblings = categories.filter(c => (c.parentId ?? null) === newParentId && c.id !== categoryId);
    const maxOrder = siblings.reduce((m, c) => Math.max(m, c.order ?? 0), -1);
    const nextOrder = maxOrder + 1;

    const { error } = await supabase
      .from("categories")
      .update({ parent_id: newParentId, sort_order: nextOrder })
      .eq("id", categoryId);

    if (error) {
      console.error(error);
      toast.error("Falha ao mover pasta.");
      return;
    }

    setCategories(prev =>
      prev.map(c => c.id === categoryId ? { ...c, parentId: newParentId, order: nextOrder } : c)
    );

    toast.success("Pasta movida!");
  };

  const reorderCategory = async (categoryId: string, direction: "up" | "down") => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;

    const parentId = cat.parentId ?? null;

    const siblings = categories
      .filter(c => (c.parentId ?? null) === parentId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.name.localeCompare(b.name));

    const idx = siblings.findIndex(s => s.id === categoryId);
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= siblings.length) return;

    const newOrder = [...siblings];
    [newOrder[idx], newOrder[swapWith]] = [newOrder[swapWith], newOrder[idx]];

    const ids = newOrder.map(x => x.id);

    const { error } = await supabase.rpc("set_category_order", {
      p_parent_id: parentId,
      p_ids: ids,
    });

    if (error) {
      console.error(error);
      toast.error("Falha ao reordenar pastas.");
      return;
    }

    const orderMap = new Map(ids.map((id, i) => [id, i]));
    setCategories(prev =>
      prev.map(c => ((c.parentId ?? null) === parentId && orderMap.has(c.id))
        ? { ...c, order: orderMap.get(c.id)! }
        : c
      )
    );

    toast.success("Ordem atualizada!");
  };

  const moveDocumentToCategory = async (docId: string, categoryId: string) => {
    const { error } = await supabase
      .from("documents")
      .update({ category_id: categoryId })
      .eq("id", docId);

    if (error) {
      console.error(error);
      toast.error("Falha ao mover documento de pasta.");
      return;
    }

    setDocuments(prev =>
      prev.map(d => d.id === docId ? { ...d, categoryId } : d)
    );

    if (activeCategoryId && activeCategoryId !== categoryId) {
      setDocuments(prev => prev.filter(d => d.id !== docId));
    }

    toast.success("Documento movido!");
  };

  const handleToggleFavorite = async (docId: string) => {
    if (!currentUser) return;

    const isFav = favoriteDocIds.includes(docId);

    setFavoriteDocIds(prev => (isFav ? prev.filter(id => id !== docId) : [...prev, docId]));

    if (isMockUser(currentUser)) {
      toast.info(isFav ? "Removido dos favoritos (mock)." : "Adicionado aos favoritos (mock).");
      return;
    }

    try {
      if (isFav) {
        const { error } = await supabase
          .from("document_favorites")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("document_id", docId);

        if (error) throw error;
        toast.success("Removido dos favoritos.");
      } else {
        const { error } = await supabase
          .from("document_favorites")
          .insert({ user_id: currentUser.id, document_id: docId });

        if (error && error.code !== "23505") throw error;

        toast.success("Adicionado aos favoritos.");
      }
    } catch (e: any) {
      console.error(e);

      setFavoriteDocIds(prev => (isFav ? [...prev, docId] : prev.filter(id => id !== docId)));

      toast.error(`Falha ao atualizar favorito: ${e.message || "erro"}`);
    }
  };

  const openDocumentById = async (docId: string) => {
    const local = documents.find((d) => d.id === docId);
    if (local) {
      setActiveCategoryId(local.categoryId || null);
      navigateToDocument(local.id);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", docId)
        .single();

      if (error) throw error;

      const fallbackCatId = defaultCategoryId || categories[0]?.id || null;
      const mapped = {
        id: data.id,
        title: data.title,
        content: data.content,
        categoryId: data.category_id || fallbackCatId || "",
        status: data.status,
        authorId: data.author_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deletedAt: data.deleted_at,
        views: data.views,
        tags: data.tags || [],
        categoryPath: getCategoryPath(data.category_id, categories),
        versions: [],
        reviewNote: data.review_note ?? null,
      };

      setDocuments((prev) => (prev.some((d) => d.id === mapped.id) ? prev : [...prev, mapped]));
      setActiveCategoryId(mapped.categoryId || null);
      navigateToDocument(mapped.id);
    } catch (e: any) {
      console.error(e);
      toast.error("Nao foi possivel abrir o documento da notificacao.");
    }
  };

  // --- Sincronização do Título da Aba (Browser Tab) ---
  useEffect(() => {
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) {
      link.href = systemSettings.logoCollapsedUrl;
    }
    // Sincroniza o título da aba: AppName > LandingTitle (H1) > Default
    document.title = systemSettings.appName || systemSettings.landingTitle || 'Peta Wiki';
  }, [systemSettings]);

  const refreshTemplates = useCallback(async () => {
    try {
      const t = await dbListTemplates();
      setTemplates(t);
    } catch (e) {
      console.error('Erro ao carregar templates do banco, usando mock:', e);
      // Fallback: keep mock templates if DB isn't ready
      setTemplates(MOCK_TEMPLATES);
    }
  }, []);

  const seedTemplatesIfEmpty = useCallback(async () => {
    try {
      const { count, error } = await supabase
        .from('document_templates')
        .select('*', { count: 'exact', head: true });

      if (error) throw error;
      
      if (count === 0) {
        console.log('Iniciando seed de templates - nenhum template encontrado no banco...');
        for (const template of MOCK_TEMPLATES) {
          const { error } = await supabase
            .from('document_templates')
            .upsert({
              id: template.id,
              name: template.name,
              category: template.category,
              description: template.description,
              icon: template.icon,
              content: template.content,
              tags: template.tags,
              is_global: template.isGlobal,
              department_id: null,
              usage_count: template.usageCount,
              is_active: true
            }, {
              onConflict: 'id'
            });
          
          if (error) {
            console.error(`Erro ao inserir template ${template.name}:`, error);
          } else {
            console.log(`Template ${template.name} inserido com sucesso`);
          }
        }
        // Recarregar templates após o seed
        await refreshTemplates();
      }
    } catch (e) {
      console.error('Erro no seed de templates:', e);
    }
  }, [refreshTemplates]);

  // Initial Fetch
  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
 try {
        const [docsRes, cats, usersRes, settingsRes] = await Promise.all([
            supabase.from("documents").select("*"), // Traz TODOS, inclusive deletados
            listCategories(),
            supabase.from('users').select('*'),
            supabase.from('system_settings').select('settings').single()
        ]);

        if (docsRes.error) throw new Error(`Docs: ${docsRes.error.message}`);
        
// Garantir "Geral" e definir defaults
        let finalCats = cats.map((c: any) => ({
          ...c,
          parentId: c.parent_id ?? null,
          order: c.sort_order ?? 0,
          docCount: c.doc_count ?? 0,
        }));

        let geral = finalCats.find((c: any) => c.slug === "geral" && !c.parent_id) || null;

        if (!geral) {
          const geralId = (crypto?.randomUUID?.() ?? `c_${Date.now()}`);
          const newGeral = {
            id: geralId,
            name: 'Geral',
            slug: 'geral',
            parentId: null,
            departmentId: null,
            order: 0,
            docCount: 0,
            description: null,
            icon: null,
          };
          // tenta persistir (best-effort)
          try {
            await supabase.from('categories').insert({
              id: newGeral.id,
              name: newGeral.name,
              slug: newGeral.slug,
              parent_id: null,
              department_id: null,
              sort_order: 0,
              doc_count: 0,
            });
          } catch (e) {
            console.warn('Could not create "Geral" category:', e);
          }
          finalCats = [newGeral, ...finalCats];
          geral = newGeral;
        }

        setCategories(finalCats);
        setDefaultCategoryId(geral?.id ?? null);

        const fallbackCatId = geral?.id || finalCats[0]?.id || null;
        const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
        const savedOk = saved && finalCats.some((c: any) => c.id === saved);
        setActiveCategoryId((prev) => prev ?? (savedOk ? saved : fallbackCatId));

        const mappedDocs = (docsRes.data || []).map((d: any) => ({
          id: d.id,
          title: d.title,
          content: d.content,
          categoryId: d.category_id || fallbackCatId || '',
          status: d.status,
          authorId: d.author_id,
          createdAt: d.created_at,
          updatedAt: d.updated_at,
          deletedAt: d.deleted_at, 
          views: d.views,
          tags: d.tags || [],
          categoryPath: getCategoryPath(d.category_id || fallbackCatId, finalCats),
          versions: [],
          reviewNote: d.review_note ?? null,
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
            themePreference: u.theme_preference,
            // valor booleano convertido
            isSuperAdmin: !!u.is_super_admin
        }));
        
        setDocuments(mappedDocs);
        
        if (mappedUsers.length > 0) {
            setUsers(mappedUsers);
        } else {
            setUsers(MOCK_USERS);
        }

        if (settingsRes.data?.settings) {
            setSystemSettings(settingsRes.data.settings);
        }

        await refreshTemplates();
        
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
        if (users.length === 0) setUsers(MOCK_USERS);
        toast.error("Erro ao conectar ao banco de dados.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [refreshTemplates]);

  useEffect(() => {
    const handler = () => {
      navigateToHome();
    };

    window.addEventListener('clearCategoryFilter', handler as any);
    return () => window.removeEventListener('clearCategoryFilter', handler as any);
  }, [navigateToHome]);

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

      const userWithSettings = {
        ...foundUser,
        themePreference: themePref,
        isSuperAdmin: foundUser.isSuperAdmin
      };

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
          themePreference: 'light',
          // novos usuários não são super admin
          isSuperAdmin: false
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
            theme_preference: 'light',
            is_super_admin: false
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
    setActiveCategoryId(null);
    setSelectedDocId(null);
    setReviewCenterDocId(null);
    localStorage.removeItem(SESSION_KEY);
    // Clear URL on logout
    navigate('/');
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

  const handleToggleSuperAdmin = async (targetUserId: string, newValue: boolean) => {
    if (!currentUser?.isSuperAdmin) {
      toast.error('Apenas Super Admin pode alterar esta permissão.');
      return;
    }

    try {
      const { error } = await supabase.rpc('set_user_super_admin', {
        p_actor_id: currentUser.id,
        p_target_id: targetUserId,
        p_value: newValue
      });

      if (error) throw error;

      // Atualiza lista local de usuários
      setUsers((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, isSuperAdmin: newValue } : u))
      );

      toast.success('Permissão de Super Admin atualizada.');
    } catch (e: any) {
      const msg =
        e?.message === 'cannot_remove_last_super_admin'
          ? 'Não é permitido remover o último Super Admin.'
          : 'Erro ao atualizar Super Admin.';

      toast.error(msg);
    }
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
      themePreference: 'light',
      // novos usuários não são super admin
      isSuperAdmin: false
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
        theme_preference: 'light',
        is_super_admin: false
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

  // Enhanced selectedDocument calculation
  const selectedDocument = documents.find(d => d.id === selectedDocId) || null;

  // Add logging to debug selectedDocument
  React.useEffect(() => {
    console.log('State update:', {
      selectedDocId,
      documentsCount: documents.length,
      selectedDocument: selectedDocument ? {id: selectedDocument.id, title: selectedDocument.title} : null,
      currentView
    });
  }, [selectedDocId, selectedDocument, currentView]);
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
    handleSelectCategoryWithNavigate(category);
  };

  const handleSelectCategoryWithoutNavigate = (category: Category) => {
    setActiveCategoryId(category.id);
    setSelectedDocId(null);
    setSearchQuery('');
    setSearchResultDocs(null);
    setCurrentView('CATEGORY_VIEW');

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

  const activeCategory = useMemo(
    () => (activeCategoryId ? categories.find((c) => c.id === activeCategoryId) || null : null),
    [activeCategoryId, categories]
  );

  const activeCategoryDocs = useMemo(() => {
    if (!activeCategoryId) return [];
    return visibleDocumentsFiltered.filter((d) => d.categoryId === activeCategoryId);
  }, [activeCategoryId, visibleDocumentsFiltered]);

  const availableTemplates = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return templates;
    if (currentUser.role === 'EDITOR') {
      return templates.filter((t) => t.isGlobal || !t.departmentId || t.departmentId === currentUser.department);
    }
    return [];
  }, [currentUser, templates]);

 const handleSaveCategory = async (data: Partial<Category>) => {
    const parentId = data.parentId ?? null;
    const departmentId = data.departmentId ?? (currentUser?.department ?? null);
    const order = categories.filter(c => c.parentId === parentId).length + 1;

    const newCategory: Category = {
      id: (crypto?.randomUUID?.() ?? `c_${Date.now()}`),
      name: data.name!,
      slug: (data.slug || generateSlug(data.name!)),
      parent_id: parentId,
      department_id: departmentId,
      sort_order: order,
      doc_count: 0,
      description: data.description ?? null,
      icon: data.icon ?? null,
      created_at: new Date().toISOString(),

      parentId,
      departmentId,
      order,
      docCount: 0,
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
    console.log('Template selecionado:', template?.name);
    console.log('Conteúdo template:', template?.content?.substring(0, 100));
    
    if (template?.id) {
      console.log('Incrementando uso do template...');
      void incrementTemplateUsage(template.id);
    }
    
    const newTemplate = template ? {
        content: template.content,
        tags: template.tags,
        templateId: template.id
    } : { content: '', tags: [] };
    
    setNewDocTemplate(newTemplate);
    
    // Pequeno atraso para garantir que o estado seja atualizado antes da navegação
    setTimeout(() => {
      navigateToCreate(activeCategoryId || undefined);
    }, 100);
  };
  
  const handleSaveDocument = async (data: Partial<Document> & { saveAsTemplate?: boolean; templateName?: string }) => {
    if (!currentUser) return;
    
const targetCategoryId = 
      data.categoryId ||
      activeCategoryId ||
      selectedDocument?.categoryId ||
      defaultCategoryId ||
      categories[0]?.id;

    if (!targetCategoryId) {
      toast.error('Nenhuma categoria encontrada. Crie uma categoria antes de salvar o documento.');
      return;
    }

    const docId = (crypto?.randomUUID?.() ?? `d_${Date.now()}`);

    if (currentView === 'DOCUMENT_CREATE') {
      const desiredStatus = (data.status || (currentUser.role === 'ADMIN' ? 'PUBLISHED' : 'PENDING_REVIEW')) as any;

      const newDoc: Document = {
        id: docId,
        title: data.title || 'Sem Título',
        content: data.content || '',
        categoryId: targetCategoryId, 
        status: desiredStatus,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        views: 0,
        tags: data.tags || [],
        categoryPath: getCategoryPath(targetCategoryId, categories),
        templateId: newDocTemplate?.templateId,
        versions: [],
        reviewNote: null,
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
            views: 0,
            updated_by: currentUser.id,
            review_note: null,
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

          if (!isMockUser(currentUser) && currentUser.role === 'ADMIN' && data.saveAsTemplate) {
            const name = (data.templateName || newDoc.title || '').trim() || 'Novo Modelo';
            try {
              await dbCreateTemplate({
                name,
                content: newDoc.content,
                tags: newDoc.tags,
                category: 'OTHER',
                isGlobal: true,
                createdBy: currentUser.id,
              });
        await refreshTemplates();
        await seedTemplatesIfEmpty();
              toast.success('Modelo criado a partir do documento.');
            } catch (e: any) {
              console.error(e);
              toast.error(`Documento criado, mas falha ao salvar modelo: ${e?.message || 'erro'}`);
            }
          }
          if (!isMockUser(currentUser) && newDoc.status === "PENDING_REVIEW") {
            const admins = users.filter(u => u.role === "ADMIN" && !String(u.id).startsWith("mock_"));
            await Promise.all(
              admins.map(a =>
                supabase.rpc("create_notification", {
                  p_to_user_id: a.id,
                  p_title: "Documento pendente de aprovacao",
                  p_body: `"${newDoc.title}" aguarda revisao.`,
                  p_type: "REVIEW",
                  p_document_id: newDoc.id
                })
              )
            );
          }
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

      const nextStatus = (data.status || selectedDocument.status) as any;

      const updatePayload: any = {
        title: data.title,
        content: data.content,
        category_id: targetCategoryId,
        tags: data.tags,
        updated_at: new Date().toISOString(),
        status: nextStatus,
        updated_by: currentUser.id,
      };

      // When resubmitting, clear old reviewer note.
      if (nextStatus === 'PENDING_REVIEW') {
        updatePayload.review_note = null;
      }

      const { error } = await supabase
        .from('documents')
        .update(updatePayload)
        .eq('id', selectedDocument.id);

      if (error) {
          toast.error(`Erro ao atualizar: ${error.message}`);
      } else {
          toast.success('Documento atualizado.');

          if (!isMockUser(currentUser) && nextStatus === 'PENDING_REVIEW') {
            const admins = users.filter(u => u.role === "ADMIN" && !String(u.id).startsWith("mock_"));
            await Promise.all(
              admins.map(a =>
                supabase.rpc("create_notification", {
                  p_to_user_id: a.id,
                  p_title: "Documento pendente de aprovacao",
                  p_body: `"${data.title || selectedDocument.title}" aguarda revisao.`,
                  p_type: "REVIEW",
                  p_document_id: selectedDocument.id
                })
              )
            );
          }
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

  // Show loading only when we have no data yet (first load after login/refresh)
  // Don't show loading if we already have documents or categories loaded
  const hasAnyData = documents.length > 0 || categories.length > 0 || users.length > 0;
  if (isLoading && !hasAnyData) {
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

const toggleFavorites = () => {
  setDocFilter(prev => (prev === 'FAVORITES' ? 'ALL' : 'FAVORITES'));
  setCurrentView('HOME');
};

  const commonProps = {
    categories: categoryTree,
    documents: visibleDocumentsFiltered,
    onSelectCategory: handleSelectCategoryWithNavigate,
    onSelectDocument: handleSelectDocumentWithNavigate,
    onNavigateHome: () => {
      navigateToHome();
    },
    user: currentUser,
    onCreateCategory: (pid: string | null) => { setCategoryModalParentId(pid); setIsCategoryModalOpen(true); },
    onDeleteCategory: handleDeleteCategory,
    systemSettings,
    onOpenSettings: openAdminSettings,
    onLogout: () => handleLogout(false),
    onOpenProfile: () => setIsProfileOpen(true),
    toggleTheme: handleToggleTheme,
    isDarkMode,
    onNavigateToAnalytics: navigateToAnalytics,
    onNavigateToReviewCenter: () => openReviewCenter(null),
    activeCategoryId,
    setCategories,
    onDropDocument: moveDocumentToCategory,
    onDropCategory: moveCategoryToParent,
    onReorderCategory: reorderCategory,
    favoriteDocuments: visibleDocuments.filter(d => favoriteDocIds.includes(d.id)),
    onToggleFavorites: toggleFavorites,
    favoriteCount: favoriteDocIds.length,
    onOpenDocumentById: openDocumentById,
    onOpenReviewCenterByDocId: openReviewCenter,
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
             onOpenReviewCenterByDocId={openReviewCenter}
         />
      ) : (
         <Sidebar {...commonProps} searchQuery={searchQuery} />
      )}

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Subtle loading indicator for background refreshes */}
        {isLoading && hasAnyData && (
          <div className="h-1 bg-blue-600 animate-pulse" />
        )}
        {!isNavbarMode && (
              <Header
                  searchQuery={searchQuery}
                  onSearch={setSearchQuery}
                  searchResults={searchResultDocs}
                  onSelectDocument={handleSelectDocumentWithNavigate}
                  userId={currentUser.id}
                  onOpenDocumentById={openDocumentById}
                  onOpenReviewCenterByDocId={openReviewCenter}
                  showNotifications={false}
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
                   <div className="prose prose-blue dark:prose-invert max-w-none text-gray-800 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: safeHomeContent }} />
                </div>
              )}
            </div>
          )}

          {currentView === 'CATEGORY_VIEW' && activeCategoryId && (
            <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                      {activeCategory?.name || 'Categoria'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {getCategoryPath(activeCategoryId, categories)}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {activeCategoryDocs.length} documento(s)
                    </p>
                  </div>

                  {isAdminOrEditor && (
                    <Button onClick={() => setCurrentView('TEMPLATE_SELECTION')} className="shrink-0">
                      Criar Documento
                    </Button>
                  )}
                </div>

                <div className="mt-6">
                  {activeCategoryDocs.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-10 text-center text-gray-500 dark:text-gray-400">
                      <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                        <FileText size={18} className="opacity-60" />
                      </div>
                      <div className="text-sm">Nenhum documento nesta pasta.</div>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      {activeCategoryDocs.map((doc) => (
                        <button
                          key={doc.id}
                          onClick={() => handleSelectDocumentWithNavigate(doc)}
                          className="w-full text-left px-4 py-3 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title={doc.title}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-gray-400">
                              <FileText size={16} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-medium text-gray-900 dark:text-white truncate">{doc.title}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Atualizado em {new Date(doc.updatedAt).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentView === 'ANALYTICS' && currentUser.role === 'ADMIN' && (
            <LazyWrapper>
              <AnalyticsDashboard />
            </LazyWrapper>
          )}
          {currentView === 'REVIEW_CENTER' && currentUser.role === 'ADMIN' && (
            <LazyWrapper>
              <ReviewCenter
                actorUserId={currentUser.id}
                onOpenDocumentById={openDocumentById}
                initialDocId={reviewCenterDocId}
                onStatusChanged={(docId, status, note) => {
                  setDocuments((prev) =>
                    prev.map((d) =>
                      d.id === docId ? { ...d, status: status as any, reviewNote: note ?? null } : d
                    )
                  );
                }}
              />
            </LazyWrapper>
          )}

          {currentView === 'ADMIN_SETTINGS' && currentUser && currentUser.role === 'ADMIN' && (
            <LazyWrapper>
              <AdminSettings
                mode="page"
                isOpen={true}
                onClose={() => setCurrentView(settingsReturnView)}
                settings={systemSettings}
                onSaveSettings={handleSaveSettingsGlobal}
                users={users}
                onUpdateUserRole={handleUpdateUserRole}
                onUpdateUserDetails={handleUpdateUserDetails}
                onDeleteUser={handleDeleteUser}
                onAddUser={handleAddUser}
                onToggleSuperAdmin={handleToggleSuperAdmin}
                categories={categories}
                onUpdateCategory={handleUpdateCategory}
                onDeleteCategory={handleDeleteCategory}
                onAddCategory={handleSaveCategory}
                trashDocuments={trashDocuments}
                onRestoreDocument={handleRestoreDocument}
                onPermanentDeleteDocument={handlePermanentDeleteDocument}
                actorUserId={currentUser.id}
                onOpenReviewCenter={(docId) => openReviewCenter(docId)}
              />
            </LazyWrapper>
          )}

          {currentView === 'NOTIFICATIONS' && (
            <LazyWrapper>
              <NotificationCenter 
                userId={currentUser.id}
                notifications={notifications}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
                onRefresh={handleRefreshNotifications}
              />
            </LazyWrapper>
          )}

          {currentView === 'TEMPLATE_SELECTION' && (
            <LazyWrapper>
              <TemplateSelector 
                templates={availableTemplates}
                onSelect={handleTemplateSelect}
                onCancel={() => activeCategoryId ? navigateToCategory(activeCategoryId) : navigateToHome()}
              />
            </LazyWrapper>
          )}

          {currentView === 'DOCUMENT_VIEW' && selectedDocument && (
            <DocumentView 
              document={selectedDocument} 
              user={currentUser}
              onEdit={() => navigateToDocument(selectedDocument.id, 'editar')}
              onDelete={() => handleSoftDeleteDocument(selectedDocument)}
              systemSettings={systemSettings}
              onRestoreVersion={handleRestoreVersion}
              onSearchTag={handleSearchTag}
              isFavorite={!!selectedDocument && favoriteDocIds.includes(selectedDocument.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          )}

          {(currentView === 'DOCUMENT_EDIT' || currentView === 'DOCUMENT_CREATE') && (isAdminOrEditor) && (
            <DocumentEditor 
              document={currentView === 'DOCUMENT_EDIT' ? selectedDocument : null}
              user={currentUser}
              onSave={handleSaveDocument}
              onCancel={() => { 
                if (selectedDocument) {
                  navigateToDocument(selectedDocument.id);
                } else {
                  navigateToHome();
                }
              }}
              categories={categoryTree}
              allCategories={categories} 
              initialCategoryId={currentView === 'DOCUMENT_CREATE' ? (activeCategoryId ?? selectedDocument?.categoryId) : selectedDocument?.categoryId}
              initialContent={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.content : undefined}
              initialTags={currentView === 'DOCUMENT_CREATE' ? newDocTemplate?.tags : undefined}
              onChangeCategory={(id) => setActiveCategoryId(id)}
            />
          )}
        </main>
      </div>

      <LazyWrapper>
        <CategoryModal 
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          parentId={categoryModalParentId}
          categories={categories}
          user={currentUser}
          onSave={handleSaveCategory}
        />
      </LazyWrapper>

      {currentUser && (
        <LazyWrapper>
          <UserProfile 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={currentUser}
            onUpdatePassword={handleUpdatePassword}
            onUpdateAvatar={handleUpdateAvatar}
            onUpdateUser={(data) => handleUpdateUserDetails(currentUser.id, data)}
          />
        </LazyWrapper>
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
                 <Button onClick={() => { 
                   confirmModal.onConfirm(); 
                   setConfirmModal({ ...confirmModal, isOpen: false }); 
                 }}>Confirmar</Button>
            </div>
        </div>
      </Modal>

    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Core Routes */}
          <Route path="/" element={<AppContent />} />
          <Route path="/categoria/:categoryId" element={<CategoryViewRoute />} />
          <Route path="/documento/:docId" element={<DocumentViewRoute />} />
          <Route path="/documento/:docId/:action" element={<DocumentViewRoute />} />
          <Route path="/documento/:docId/comentarios" element={<DocumentCommentsRoute />} />
          <Route path="/documento/:docId/exportar" element={<DocumentExportRoute />} />
          <Route path="/documento/:docId/exportar/:format" element={<DocumentExportRoute />} />
          <Route path="/novo" element={<NewDocumentRoute />} />
          
          {/* Organization Structure */}
          <Route path="/departamentos" element={<DepartmentsRoute />} />
          <Route path="/departamento/:id" element={<DepartmentViewRoute />} />
          <Route path="/areas" element={<AreasRoute />} />
          <Route path="/area/:id" element={<AreaViewRoute />} />
          
          {/* User Features */}
          <Route path="/favoritos" element={<FavoritesRoute />} />
          <Route path="/notificacoes" element={<NotificationsRoute />} />
          <Route path="/perfil" element={<ProfileRoute />} />
          <Route path="/perfil/:id" element={<UserProfileRoute />} />
          
          {/* Templates */}
          <Route path="/templates" element={<TemplatesRoute />} />
          <Route path="/template/:id" element={<TemplateViewRoute />} />
          
          {/* Admin & Analytics */}
          <Route path="/analytics" element={<AnalyticsRoute />} />
          <Route path="/admin" element={<AdminRoute />} />
          <Route path="/revisoes" element={<ReviewRoute />} />
          <Route path="/revisoes/:docId" element={<ReviewRoute />} />
          <Route path="/exports" element={<ExportsRoute />} />
          
          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
};

export { AppContent, NotificationsRoute };
export default App;
