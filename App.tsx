import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ToastProvider, useToast } from './components/Toast';
import { FullPageLoader } from './components/LoadingSpinner';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DocumentView } from './components/DocumentView';
import { DocumentEditor } from './components/DocumentEditor';
import { HomePage } from './components/HomePage';
import { LazyWrapper } from './components/LazyWrapper';
import { LazyComponents } from './components/LazyComponents';
import { LoginPage } from './components/LoginPage';
import { NotificationsPage } from './components/NotificationsPage';

// Types
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  department?: string;
  themePreference?: 'light' | 'dark';
  isMock?: boolean;
}

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  description: string | null;
  icon: string | null;
  order: number;
}

interface Document {
  id: string;
  title: string;
  content: string;
  categoryId: string;
  status: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
}

interface SystemSettings {
  appName: string;
  logoCollapsedUrl: string;
  logoExpandedUrl: string;
  layoutMode: 'SIDEBAR' | 'NAVBAR';
  [key: string]: any;
}

// Mock data
const MOCK_USERS: User[] = [
  {
    id: 'mock_admin',
    username: 'admin',
    email: 'admin@petawiki.com',
    password: 'admin',
    name: 'Admin',
    role: 'ADMIN',
    avatar: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%23111827"/%3E%3Ctext x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-size="40" font-weight="bold"%3EA%3C/text%3E%3C/svg%3E',
    department: 'Gestão',
    isMock: true,
    themePreference: 'light'
  }
];

const MOCK_CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Geral',
    parentId: null,
    description: 'Documentos gerais',
    icon: 'folder',
    order: 0
  },
  {
    id: 'cat2',
    name: 'Políticas',
    parentId: null,
    description: 'Políticas da empresa',
    icon: 'shield',
    order: 1
  },
  {
    id: 'cat3',
    name: 'Manuais',
    parentId: 'cat2',
    description: 'Manuais de procedimentos',
    icon: 'book',
    order: 0
  }
];

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    title: 'Política de Privacidade',
    content: '<h1>Política de Privacidade</h1><p>Esta é a política de privacidade da empresa...</p>',
    categoryId: 'cat2',
    status: 'PUBLISHED',
    authorId: 'mock_admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['política', 'privacidade']
  },
  {
    id: 'doc2',
    title: 'Manual do Colaborador',
    content: '<h1>Manual do Colaborador</h1><p>Bem-vindo à empresa!</p>',
    categoryId: 'cat3',
    status: 'PUBLISHED',
    authorId: 'mock_admin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: ['manual', 'colaborador']
  }
];

const SESSION_KEY = 'peta_wiki_session';
const INACTIVITY_LIMIT = 15 * 60 * 1000;
const CATEGORY_STORAGE_KEY = 'PETA_ACTIVE_CATEGORY_ID';

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  appName: 'Peta Wiki',
  logoCollapsedUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="50" fill="%232563eb"/%3E%3Ctext x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-size="40" font-weight="bold"%3EPW%3C/text%3E%3C/svg%3E',
  logoExpandedUrl: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 90"%3E%3Crect width="160" height="90" fill="%232563eb"/%3E%3Ctext x="50%" y="50%" dy=".35em" text-anchor="middle" fill="white" font-size="24" font-weight="bold"%3EPeta Wiki%3C/text%3E%3C/svg%3E',
  layoutMode: 'SIDEBAR'
};

const AUTH_MODE = 'mock' as const;

// Simple AppContent component
const AppContent = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const params = useParams();

  // State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<string>('HOME');

  // Data state
  const [documents, setDocuments] = useState<Document[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

  // Favorites
  const [favoriteDocIds, setFavoriteDocIds] = useState<string[]>([]);

  // Session restoration
  useEffect(() => {
    const restoreSession = () => {
      const savedSession = localStorage.getItem(SESSION_KEY);
      if (savedSession) {
        try {
          const { user, lastActive } = JSON.parse(savedSession);
          const now = Date.now();
          if (now - lastActive < INACTIVITY_LIMIT) {
            if (user.isMock) {
              setIsDarkMode((user.themePreference || 'light') === 'dark');
              setCurrentUser(user);
              setIsAuthenticated(true);
              return;
            }
            
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsDarkMode((user.themePreference || 'light') === 'dark');
          }
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      
      // Initialize mock data after a short delay
      setTimeout(() => {
        setCategories(MOCK_CATEGORIES);
        setDocuments(MOCK_DOCUMENTS);
        setActiveCategoryId('cat1');
        setIsLoading(false);
      }, 1000);
    };

    restoreSession();
  }, []);

  // Simple handlers
  const handleLogin = (username: string, password: string) => {
    console.log('handleLogin called with:', username);
    
    // Mock authentication
    if (username === 'admin' && password === 'admin') {
      const admin = MOCK_USERS[0];
      setCurrentUser(admin);
      setIsAuthenticated(true);
      setIsDarkMode(false);
      localStorage.setItem(SESSION_KEY, JSON.stringify({ user: admin, lastActive: Date.now() }));
      toast.success(`Bem-vindo, ${admin.name}!`);
    } else {
      toast.error('Usuário ou senha inválidos.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    setCurrentUser(null);
    setIsAuthenticated(false);
    setCurrentView('HOME');
    toast.success('Logout realizado com sucesso.');
  };

  const handleToggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
  };

  const handleSelectCategory = (category: Category) => {
    setActiveCategoryId(category.id);
    setCurrentView('CATEGORY_VIEW');
  };

  const handleSelectDocument = (document: Document) => {
    setSelectedDocId(document.id);
    setCurrentView('DOCUMENT_VIEW');
  };

  const handleCreateDocument = () => {
    setCurrentView('DOCUMENT_CREATE');
  };

  // URL handling
  useEffect(() => {
    const path = window.location.pathname;
    console.log('Processing URL:', path);

    if (path === '/' || path === '') {
      setCurrentView('HOME');
    } else if (path.startsWith('/categoria/')) {
      const catId = path.split('/')[2];
      if (catId) {
        const cat = categories.find(c => c.id === catId);
        if (cat) {
          setActiveCategoryId(cat.id);
          setCurrentView('CATEGORY_VIEW');
        }
      }
    } else if (path.startsWith('/documento/')) {
      const parts = path.split('/');
      if (parts.length >= 3) {
        const docId = parts[2];
        const action = parts[3];
        const doc = documents.find(d => d.id === docId);
        if (doc) {
          setCurrentView(action === 'editar' ? 'DOCUMENT_EDIT' : 'DOCUMENT_VIEW');
        }
      }
    } else if (path.startsWith('/notificacoes')) {
      setCurrentView('NOTIFICATIONS');
    } else if (path.startsWith('/admin')) {
      setCurrentView('ADMIN_SETTINGS');
    } else if (path.startsWith('/analytics')) {
      setCurrentView('ANALYTICS');
    } else if (path.startsWith('/revisoes')) {
      setCurrentView('REVIEW_CENTER');
    }
  }, [categories, documents]);

  // Helper functions
  const getCategoryPath = (categoryId: string | null): string => {
    if (!categoryId) return '';
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    const path = [category.name];
    let parent = category.parentId;
    while (parent) {
      const parentCategory = categories.find(c => c.id === parent);
      if (parentCategory) {
        path.unshift(parentCategory.name);
        parent = parentCategory.parentId;
      } else {
        break;
      }
    }
    return path.join(' > ');
  };

  // Build category tree
  const categoryTree = useMemo(() => {
    const buildTree = (categories: Category[]): any[] => {
      const categoryMap = new Map<string, any>();
      categories.forEach(cat => categoryMap.set(cat.id, { ...cat, children: [] });
      
      const rootCategories = categories.filter(c => !c.parentId);
      
      rootCategories.forEach(root => {
        if (categoryMap.has(root.id)) {
          const category = categoryMap.get(root.id);
          const buildChildren = (parentId: string | null): any[] => {
            return categoryMap.get(parentId)?.children || [];
          };
          category.children = buildChildren(root.id);
        }
      });
      
      return rootCategories;
    };
  }, [categories]);

  // Update documents with category paths
  const documentsWithPaths = useMemo(() => {
    return documents.map(doc => ({
      ...doc,
      categoryPath: getCategoryPath(doc.categoryId)
    }));
  }, [documents, categories]);

  // Mock data for categories
  const activeCategory = useMemo(() => {
    return categories.find(c => c.id === activeCategoryId) || null;
  }, [activeCategoryId, categories]);

  const activeCategoryDocs = useMemo(() => {
    return activeCategory ? documents.filter(d => d.categoryId === activeCategory.id) : [];
  }, [activeCategory, documents]);

  // Loading state
  if (isLoading) {
    return <FullPageLoader text="Inicializando sistema..." />;
  }

  // Authentication
  if (!isAuthenticated || !currentUser) {
    return (
      <React.Suspense fallback={<FullPageLoader text="Carregando..." />}>
        <LazyLoginPage
          onLogin={handleLogin}
          onSignUp={() => {}}
          settings={systemSettings}
        />
      </React.Suspense>
    );
  }

  // State variables for LazyComponents
  const [selectedDocId] = useState<string | null>(null);
  const [reviewCenterDocId] = setReviewCenterDocId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResultDocs, setSearchResultDocs] = useState<Document[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalParentId, setCategoryModalParentId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [settingsReturnView, setSettingsReturnView] = useState<string>('HOME');

  const {
    AnalyticsDashboard,
    ReviewCenter,
    TemplateSelector,
    CategoryModal,
    AdminSettings,
    UserProfile,
    NotificationsPage,
  } = LazyComponents;

  // Main app layout
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppContent />} />
          <Route path="/categoria/:categoryId" element={<AppContent />} />
          <Route path="/documento/:docId" element={<AppContent />} />
          <Route path="/documento/:docId/editar" element={<AppContent />} />
          <Route path="/novo" element={<AppContent />} />
          <Route path="/analytics" element={<AppContent />} />
          <route path="/admin" element={<AppContent />} />
          <Route path="/notificacoes" element={<AppContent />} />
          <Route path="/revisoes" element={<AppContent />} />
          <Route path="/revisoes/:docId" element={<AppContent />} />
          <Route path="*" element={<AppContent />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
};

export default App;